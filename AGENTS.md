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
