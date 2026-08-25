window.LEARNING_CATALOG = {
  categories: [
    {
      id: "dsa",
      order: 1,
      name: "DSA",
      icon: "⌁",
      description: "Algorithms, proof techniques, invariants, and problem-solving patterns."
    },
    {
      id: "system-design",
      order: 2,
      name: "System Design",
      icon: "◎",
      description: "Architecture concepts, distributed-system trade-offs, APIs, and reliability."
    },
    {
      id: "csharp-dotnet",
      order: 3,
      name: "C# / .NET",
      icon: "C#",
      description: "Language semantics, runtime behavior, and backend interview concepts."
    },
    {
      id: "c-posix",
      order: 4,
      name: "C / POSIX",
      icon: "C",
      description: "C systems programming, POSIX threads, synchronization contracts, and failure behavior."
    }
  ],

  topics: [
    {
      id: "perfect-rectangle",
      categoryId: "dsa",
      order: 2,
      title: "Perfect Rectangle",
      description: "Use area conservation and corner parity to detect gaps, overlaps, and malformed covers.",
      resources: [
        {
          type: "recall",
          title: "Perfect Rectangle invariants",
          description: "Recall the exact-cover definition, area invariant, corner toggling, and why the checks work together.",
          href: "recall.html?deck=perfect-rectangle",
          meta: "8 cards"
        }
      ]
    },
    {
      id: "non-overlapping-intervals",
      categoryId: "dsa",
      order: 1,
      title: "Non-overlapping Intervals",
      description: "Visualize and prove the earliest-finish-time greedy choice with an exchange argument.",
      resources: [
        {
          type: "recall",
          title: "Earliest finishing time proof",
          description: "Reconstruct the exchange argument instead of memorizing the sorting rule.",
          href: "recall.html?deck=non-overlapping-intervals",
          meta: "1 proof card"
        }
      ]
    },
    {
      id: "inversions-adjacent-swaps",
      categoryId: "dsa",
      order: 3,
      title: "Inversions and Adjacent Swaps",
      description: "Connect inversion count to the minimum adjacent swaps required to sort an array.",
      resources: [
        {
          type: "recall",
          title: "Adjacent swaps proof",
          description: "Recall both the lower bound and the construction that achieves it.",
          href: "recall.html?deck=inversions-adjacent-swaps",
          meta: "1 proof card"
        }
      ]
    },
    {
      id: "non-functional-requirements",
      categoryId: "system-design",
      order: 4,
      title: "Non-functional Requirements",
      description: "Availability, scalability, latency, consistency, their mechanisms, and architectural trade-offs.",
      resources: [
        {
          type: "quiz",
          title: "NFR pre-reading diagnostic",
          description: "Scenario-based questions covering the complete introductory primer.",
          href: "system-design-nfr-pre-reading.html",
          meta: "24 questions"
        },
        {
          type: "recall",
          title: "NFR mechanism-first flashcards",
          description: "Explain the requirement-to-architecture linkage, not merely the component names.",
          href: "system-design-nfr-flashcards.html",
          meta: "12 cards + visuals"
        }
      ]
    },
    {
      id: "system-design-components",
      categoryId: "system-design",
      order: 6,
      title: "System Design Components",
      description: "Load balancing, caching, partitioning, replication, queues, and batch processing—matched to the pressure each mechanism actually solves.",
      resources: [
        {
          type: "learn",
          title: "System components visual guide",
          description: "Two diagrams plus six beginner walkthroughs explaining each mechanism, a concrete request flow, and the failure it introduces.",
          href: "system-design-components-visual-guide.html",
          meta: "2 diagrams + 6 walkthroughs"
        },
        {
          type: "quiz",
          title: "System components pre-reading diagnostic",
          description: "Production scenarios that test component choice, hidden trade-offs, and failure behavior—not definition recall.",
          href: "system-design-components-quiz.html",
          meta: "20 questions"
        }
      ]
    },
    {
      id: "high-availability",
      categoryId: "system-design",
      order: 7,
      title: "High Availability",
      description: "Downtime budgets, failure domains, redundancy, health checks, and the failover path that keeps a service operating.",
      resources: [
        {
          type: "learn",
          title: "High availability visual guide",
          description: "Three beginner visuals connect availability targets to failure domains, detection, routing, database failover, and concrete technology roles.",
          href: "system-design-high-availability-visual-guide.html",
          meta: "3 visual explanations"
        }
      ]
    },
    {
      id: "latency",
      categoryId: "system-design",
      order: 8,
      title: "Latency",
      description: "End-to-end response time, request-path breakdowns, percentiles, tail latency, and mechanism-specific optimization.",
      resources: [
        {
          type: "learn",
          title: "Latency visual guide",
          description: "Trace an 800 ms request, read p50/p95/p99 correctly, and decide when a CDN, index, cache, load balancing, or edge computing helps.",
          href: "system-design-latency-visual-guide.html",
          meta: "3 visual explanations"
        }
      ]
    },
    {
      id: "throughput",
      categoryId: "system-design",
      order: 9,
      title: "Throughput",
      description: "Completed work per unit time, bottlenecks, concurrency, saturation, and mechanism-specific ways to scale a data flow.",
      resources: [
        {
          type: "learn",
          title: "Throughput visual guide",
          description: "Three beginner visuals explain bottleneck capacity, concurrency and saturation, plus read, write, and asynchronous job scale-out.",
          href: "system-design-throughput-visual-guide.html",
          meta: "3 visual explanations"
        }
      ]
    },
    {
      id: "cap-theorem",
      categoryId: "system-design",
      order: 5,
      title: "CAP Theorem",
      description: "Understand the forced consistency-versus-availability choice during a network partition.",
      resources: [
        {
          type: "learn",
          title: "CAP theorem visual guide",
          description: "Eight visual steps covering partitions, the forced choice, impossibility reasoning, and operation-level decisions.",
          href: "cap-theorem-visual-guide.html",
          meta: "8 visual steps"
        }
      ]
    },
    {
      id: "api-authentication",
      categoryId: "system-design",
      order: 1,
      title: "API Authentication",
      description: "API keys, sessions, cookies, CSRF, JWT validation, signing algorithms, and token lifecycles.",
      resources: [
        {
          type: "recall",
          title: "API authentication recall",
          description: "Mechanism and failure-focused prompts migrated from the SFT deck.",
          href: "recall.html?deck=api-authentication",
          meta: "12 cards"
        }
      ]
    },
    {
      id: "api-authorization",
      categoryId: "system-design",
      order: 2,
      title: "API Authorization",
      description: "RBAC, ABAC, OAuth scopes, resource permissions, tenant isolation, and hybrid policy design.",
      resources: [
        {
          type: "recall",
          title: "API authorization recall",
          description: "Contrast authorization models and reconstruct the checks that protect resources.",
          href: "recall.html?deck=api-authorization",
          meta: "6 cards"
        }
      ]
    },
    {
      id: "api-gateway",
      categoryId: "system-design",
      order: 3,
      title: "API Gateway",
      description: "Client-facing routing, cross-cutting concerns, reliability trade-offs, and responsibility boundaries.",
      resources: [
        {
          type: "recall",
          title: "API Gateway recall",
          description: "Four essential cards covering purpose, routing, risk, and responsibility placement.",
          href: "recall.html?deck=api-gateway",
          meta: "4 cards"
        }
      ]
    },
    {
      id: "value-semantics-boxing",
      categoryId: "csharp-dotnet",
      order: 1,
      title: "Value Semantics and Boxing",
      description: "Copying, parameter passing, boxing, exact-type unboxing, casting, conversion, and equality.",
      resources: [
        {
          type: "quiz",
          title: "Value semantics and boxing — Set A",
          description: "A focused diagnostic on copying, parameters, boxing, unboxing, and boxed equality.",
          href: "csharp-value-reference-boxing.html",
          meta: "8 questions"
        },
        {
          type: "quiz",
          title: "Topic 1 mastery challenge",
          description: "A fresh interview-style set covering the same mechanisms through different scenarios.",
          href: "csharp-topic1-mastery-challenge.html",
          meta: "12 questions"
        }
      ]
    },
    {
      id: "equality-contracts",
      categoryId: "csharp-dotnet",
      order: 2,
      title: "Equality Contracts, Records and Hash Codes",
      description: "Identity versus value equality, operator dispatch, IEquatable<T>, equality laws, hashing, immutable keys, records, and shallow-copy boundaries.",
      resources: [
        {
          type: "learn",
          title: "Complete equality learning guide",
          description: "Ten beginner-first checkpoints plus ten exercises covering equality dispatch, implementation, hash collections, stable keys, records, and interview reasoning.",
          href: "csharp-equality-contracts.html",
          meta: "10 checkpoints + 10 exercises"
        }
      ]
    },
    {
      id: "object-oriented-design-patterns",
      categoryId: "csharp-dotnet",
      order: 3,
      title: "Object-Oriented Design Patterns",
      description: "Visual C# guides to object construction, interchangeable behavior, and runtime composition.",
      resources: [
        {
          type: "learn",
          title: "Builder",
          description: "Assemble a complex object through named construction steps, then validate and create it.",
          href: "eli5-builder-pattern-csharp.html",
          meta: "5 visual steps"
        },
        {
          type: "learn",
          title: "Factory Method",
          description: "Separate product creation from use, and distinguish Factory Method from Simple Factory.",
          href: "eli5-factory-method-csharp.html",
          meta: "5 visual steps"
        },
        {
          type: "learn",
          title: "Abstract Factory",
          description: "Create compatible families of related products without naming their concrete classes.",
          href: "eli5-abstract-factory-csharp.html",
          meta: "5 visual steps"
        },
        {
          type: "learn",
          title: "Prototype",
          description: "Copy configured objects while making shallow-versus-deep copy semantics explicit.",
          href: "eli5-prototype-csharp.html",
          meta: "5 visual steps"
        },
        {
          type: "learn",
          title: "Strategy",
          description: "Move interchangeable algorithms behind one behavior contract and select them at runtime.",
          href: "eli5-strategy-csharp.html",
          meta: "5 visual steps"
        },
        {
          type: "learn",
          title: "Decorator",
          description: "Stack optional behavior around individual objects without creating a subclass for every combination.",
          href: "eli5-decorator-csharp.html",
          meta: "5 visual steps"
        }
      ]
    },
    {
      id: "mutex-binary-semaphore",
      categoryId: "c-posix",
      order: 1,
      title: "Mutex vs Binary Semaphore",
      description: "pthread mutex ownership versus POSIX semaphore permits, locking versus signaling, initial count, over-posting, EINTR, and failure flows.",
      resources: [
        {
          type: "learn",
          title: "Mutex vs binary semaphore in C",
          description: "A five-year-old-friendly analogy mapped to exact POSIX state models, an interactive flow lab, ten end-to-end cases, tested C patterns, and interview answers.",
          href: "c-mutex-vs-binary-semaphore.html",
          meta: "Interactive lab + 10 cases + C demo"
        }
      ]
    }
  ],

  tools: [
    {
      id: "deathclock",
      title: "Deathclock",
      description: "A live countdown toward an editable age horizon, kept separate from the learning library.",
      href: "deathclock.html",
      meta: "Personal perspective tool"
    }
  ]
};

