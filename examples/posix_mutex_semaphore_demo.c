#define _POSIX_C_SOURCE 200809L

#include <errno.h>
#include <pthread.h>
#include <semaphore.h>
#include <stdatomic.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

static void fail_pthread(const char *operation, int error_number)
{
    fprintf(stderr, "%s: %s\n", operation, strerror(error_number));
    exit(EXIT_FAILURE);
}

static void fail_errno(const char *operation)
{
    perror(operation);
    exit(EXIT_FAILURE);
}

static void require(bool condition, const char *message)
{
    if (!condition) {
        fprintf(stderr, "FAIL: %s\n", message);
        exit(EXIT_FAILURE);
    }
}

/*
 * sem_wait() can fail with EINTR when a POSIX signal interrupts the wait.
 * Retry only that error. Other errors are real failures.
 */
static int wait_nointr(sem_t *semaphore)
{
    int result;

    do {
        result = sem_wait(semaphore);
    } while (result == -1 && errno == EINTR);

    return result;
}

/* ------------------------------------------------------------------------- */
/* Case 1: a mutex protects one read-check-write invariant. */

static pthread_mutex_t balance_mutex = PTHREAD_MUTEX_INITIALIZER;
static long balance = 1000;

struct withdrawal {
    long amount;
    bool approved;
};

static void *withdraw_money(void *argument)
{
    struct withdrawal *request = argument;
    int result = pthread_mutex_lock(&balance_mutex);

    if (result != 0) {
        fail_pthread("pthread_mutex_lock", result);
    }

    if (balance >= request->amount) {
        balance -= request->amount;
        request->approved = true;
    }

    result = pthread_mutex_unlock(&balance_mutex);
    if (result != 0) {
        fail_pthread("pthread_mutex_unlock", result);
    }

    return NULL;
}

static void test_mutex_protects_balance(void)
{
    pthread_t first_thread;
    pthread_t second_thread;
    struct withdrawal first = {.amount = 700, .approved = false};
    struct withdrawal second = {.amount = 500, .approved = false};
    int result;

    balance = 1000;

    result = pthread_create(&first_thread, NULL, withdraw_money, &first);
    if (result != 0) {
        fail_pthread("pthread_create", result);
    }
    result = pthread_create(&second_thread, NULL, withdraw_money, &second);
    if (result != 0) {
        fail_pthread("pthread_create", result);
    }

    result = pthread_join(first_thread, NULL);
    if (result != 0) {
        fail_pthread("pthread_join", result);
    }
    result = pthread_join(second_thread, NULL);
    if (result != 0) {
        fail_pthread("pthread_join", result);
    }

    require(first.approved != second.approved,
            "exactly one competing withdrawal should succeed");
    require(balance == 300 || balance == 500,
            "balance should match the single successful withdrawal");

    puts("PASS mutex: read-check-write kept the balance valid");
}

/* ------------------------------------------------------------------------- */
/* Case 2: an ERRORCHECK mutex exposes a wrong-owner unlock as EPERM. */

static pthread_mutex_t checked_mutex;
static int wrong_owner_result;

static void *try_wrong_owner_unlock(void *unused)
{
    (void)unused;
    wrong_owner_result = pthread_mutex_unlock(&checked_mutex);
    return NULL;
}

static void test_wrong_owner_is_rejected(void)
{
    pthread_mutexattr_t attributes;
    pthread_t intruder;
    int result;

    result = pthread_mutexattr_init(&attributes);
    if (result != 0) {
        fail_pthread("pthread_mutexattr_init", result);
    }
    result = pthread_mutexattr_settype(&attributes, PTHREAD_MUTEX_ERRORCHECK);
    if (result != 0) {
        fail_pthread("pthread_mutexattr_settype", result);
    }
    result = pthread_mutex_init(&checked_mutex, &attributes);
    if (result != 0) {
        fail_pthread("pthread_mutex_init", result);
    }
    result = pthread_mutexattr_destroy(&attributes);
    if (result != 0) {
        fail_pthread("pthread_mutexattr_destroy", result);
    }

    result = pthread_mutex_lock(&checked_mutex);
    if (result != 0) {
        fail_pthread("pthread_mutex_lock", result);
    }

    wrong_owner_result = 0;
    result = pthread_create(&intruder, NULL, try_wrong_owner_unlock, NULL);
    if (result != 0) {
        fail_pthread("pthread_create", result);
    }
    result = pthread_join(intruder, NULL);
    if (result != 0) {
        fail_pthread("pthread_join", result);
    }

    require(wrong_owner_result == EPERM,
            "ERRORCHECK mutex should return EPERM to a non-owner");

    result = pthread_mutex_unlock(&checked_mutex);
    if (result != 0) {
        fail_pthread("pthread_mutex_unlock", result);
    }
    result = pthread_mutex_destroy(&checked_mutex);
    if (result != 0) {
        fail_pthread("pthread_mutex_destroy", result);
    }

    puts("PASS owner: non-owner pthread_mutex_unlock returned EPERM");
}

/* ------------------------------------------------------------------------- */
/* Case 3: one thread publishes data and another thread receives the signal. */

static sem_t ready;
static int published_value;
static int consumed_value;

static void *consume_after_signal(void *unused)
{
    (void)unused;

    if (wait_nointr(&ready) == -1) {
        fail_errno("sem_wait");
    }

    consumed_value = published_value;
    return NULL;
}

static void *publish_then_signal(void *unused)
{
    (void)unused;
    published_value = 42;

    if (sem_post(&ready) == -1) {
        fail_errno("sem_post");
    }

    return NULL;
}

static void test_cross_thread_signal(void)
{
    pthread_t producer;
    pthread_t consumer;
    int result;

    published_value = 0;
    consumed_value = 0;

    if (sem_init(&ready, 0, 0) == -1) {
        fail_errno("sem_init");
    }

    result = pthread_create(&consumer, NULL, consume_after_signal, NULL);
    if (result != 0) {
        fail_pthread("pthread_create", result);
    }
    result = pthread_create(&producer, NULL, publish_then_signal, NULL);
    if (result != 0) {
        fail_pthread("pthread_create", result);
    }

    result = pthread_join(producer, NULL);
    if (result != 0) {
        fail_pthread("pthread_join", result);
    }
    result = pthread_join(consumer, NULL);
    if (result != 0) {
        fail_pthread("pthread_join", result);
    }

    require(consumed_value == 42,
            "consumer should observe data published before sem_post");

    if (sem_destroy(&ready) == -1) {
        fail_errno("sem_destroy");
    }

    puts("PASS signal: producer posted and consumer observed value 42");
}

/* ------------------------------------------------------------------------- */
/* Case 4: POSIX sem_t does not enforce a maximum value of one. */

static void test_posix_binary_is_a_convention(void)
{
    sem_t gate;

    if (sem_init(&gate, 0, 1) == -1) {
        fail_errno("sem_init");
    }

    /*
     * The gate already contains one permit. This extra post raises it to two;
     * POSIX sem_init() has no "maximum count = 1" argument.
     */
    if (sem_post(&gate) == -1) {
        fail_errno("sem_post");
    }

    require(sem_trywait(&gate) == 0, "first permit should be available");
    require(sem_trywait(&gate) == 0, "extra post should create a second permit");
    require(sem_trywait(&gate) == -1 && errno == EAGAIN,
            "a third immediate wait should find no permit");

    if (sem_destroy(&gate) == -1) {
        fail_errno("sem_destroy");
    }

    puts("PASS binary convention: an extra sem_post created two permits");
}

/* ------------------------------------------------------------------------- */
/* Case 5: disciplined wait/post pairing makes a one-at-a-time gate. */

static sem_t one_at_a_time;
static atomic_int workers_inside;
static atomic_int maximum_inside;

static void record_maximum(int candidate)
{
    int observed = atomic_load(&maximum_inside);

    while (candidate > observed
           && !atomic_compare_exchange_weak(
               &maximum_inside, &observed, candidate)) {
        /* observed is refreshed by atomic_compare_exchange_weak(). */
    }
}

static void *use_gate_repeatedly(void *unused)
{
    const struct timespec short_pause = {
        .tv_sec = 0,
        .tv_nsec = 1000000
    };
    int iteration;

    (void)unused;

    for (iteration = 0; iteration < 25; ++iteration) {
        int inside;

        if (wait_nointr(&one_at_a_time) == -1) {
            fail_errno("sem_wait");
        }

        inside = atomic_fetch_add(&workers_inside, 1) + 1;
        record_maximum(inside);
        (void)nanosleep(&short_pause, NULL);
        atomic_fetch_sub(&workers_inside, 1);

        if (sem_post(&one_at_a_time) == -1) {
            fail_errno("sem_post");
        }
    }

    return NULL;
}

static void test_disciplined_semaphore_gate(void)
{
    enum { THREAD_COUNT = 4 };
    pthread_t threads[THREAD_COUNT];
    int index;
    int result;

    atomic_store(&workers_inside, 0);
    atomic_store(&maximum_inside, 0);

    if (sem_init(&one_at_a_time, 0, 1) == -1) {
        fail_errno("sem_init");
    }

    for (index = 0; index < THREAD_COUNT; ++index) {
        result = pthread_create(&threads[index], NULL, use_gate_repeatedly, NULL);
        if (result != 0) {
            fail_pthread("pthread_create", result);
        }
    }
    for (index = 0; index < THREAD_COUNT; ++index) {
        result = pthread_join(threads[index], NULL);
        if (result != 0) {
            fail_pthread("pthread_join", result);
        }
    }

    require(atomic_load(&maximum_inside) == 1,
            "disciplined gate should allow only one worker inside");

    if (sem_destroy(&one_at_a_time) == -1) {
        fail_errno("sem_destroy");
    }

    puts("PASS gate: disciplined wait/post pairing kept maximum_inside at 1");
}

int main(void)
{
    test_mutex_protects_balance();
    test_wrong_owner_is_rejected();
    test_cross_thread_signal();
    test_posix_binary_is_a_convention();
    test_disciplined_semaphore_gate();

    puts("ALL POSIX MUTEX/SEMAPHORE DEMOS PASSED");
    return EXIT_SUCCESS;
}
