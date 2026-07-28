# Repository instructions

## Learning order is required

`assets/learning-catalog.js` is the source of truth for navigation in the GitHub learning library.

- Every category must have a positive integer `order`.
- Every topic must have a positive integer `order` that is unique and contiguous within its category: `1, 2, 3, ...`.
- The UI must sort categories and topics by `order`; never rely on array insertion order, file creation time, or commit order.
- Use the Practice RoadMap and concept dependencies to decide where a new topic belongs. Do not automatically append a newly created topic.
- Topic numbers are contiguous among topics currently published in GitHub. They do not need to reuse the global IDs from Google Sheets.
- If a topic belongs between two existing topics, insert it there and renumber the later topics.
- Reordering must not change existing topic IDs, resource URLs, or recall deck IDs.
- Google Sheets remains the progress tracker. The GitHub `order` field describes learning sequence only.

Current published sequence:

- DSA: Non-overlapping Intervals → Perfect Rectangle → Inversions and Adjacent Swaps
- System Design: API Authentication → API Authorization → API Gateway → Non-functional Requirements → CAP Theorem → System Design Components
- C# / .NET: Value Semantics and Boxing

Before publishing catalogue changes, run:

```sh
node scripts/validate-catalog-order.js
```

The category page must display each topic number, and each topic page must retain working previous/next navigation in the same sequence.

## Beginner learning-page depth

Assume the learner is new to System Design unless the user explicitly asks for revision-only material.

- A diagram is a compact map for revision, not a complete lesson.
- Define every abbreviation and piece of system-design shorthand near its first use. Do not leave phrases such as “needs redundancy,” “hot shard,” “replication lag,” or “queue backlog” unexplained.
- Every new component explanation must include:
  1. the concrete problem before the component exists
  2. the mechanism step by step through one request, write, or job
  3. why that mechanism improves the measured pressure
  4. what it does not guarantee
  5. one realistic failure mode or trade-off
  6. a decision rule for when to use it
- Use structured cards, flows, examples, and visuals so depth does not become a wall of text.
- Keep quiz explanations mechanism-focused, but keep learning sections sufficiently detailed for first-time understanding.

## Quiz questions must be self-contained

Treat every quiz card as an independent problem. A learner must be able to answer it without importing architecture, requirements, or assumptions from the lesson, an earlier question, or the author’s intended answer.

- For a scenario question, state all five parts on the card:
  1. the current system and relevant request, write, or job flow
  2. observed evidence such as timings, rates, utilization, failure behavior, or access patterns
  3. the required business or non-functional behavior
  4. the constraints and explicitly accepted trade-offs
  5. the exact decision the learner must make
- Define abbreviations and specialized terms before they are needed. An undefined term in an answer choice must not be the price of understanding the question.
- Use “best,” “strongest,” or “most appropriate” only when the card states every decision criterion needed to make one option uniquely defensible.
- A distractor must be wrong because it conflicts with a written fact or because its mechanism cannot satisfy the written requirement—not because it is absurd, vaguely worded, or less sophisticated in tone.
- Do not make a question depend on facts established by another question. Repeated context is intentional when it is necessary for independent reasoning.
- Post-submit feedback must contain:
  - **Given facts:** the exact facts from the card that control the answer
  - **Reasoning:** the causal chain from those facts to the mechanism
  - **Boundary:** what the correct choice still does not guarantee or what cost it introduces
- Feedback must not add a missing assumption that was required to choose the answer. If the explanation needs a fact, move that fact into the question.
- When section scores tie, report the tie. Do not manufacture a single “weakest” section through alphabetical or array-order tie-breaking.
- A perfect score must not be labeled with a weakest section.

Before publishing a quiz that uses the standalone scenario-card format, run:

```sh
node scripts/validate-quiz-questions.js path/to/quiz.html
```
