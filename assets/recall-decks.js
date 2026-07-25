window.RECALL_DECKS = {
  "api-authentication": {
    title: "API Authentication Recall",
    categoryId: "system-design",
    topicId: "api-authentication",
    description: "API keys, sessions, browser protections, JWT validation, and token lifecycle failure modes.",
    cards: [
      {
        sourceId: "qa-4603",
        question: "Why does an API key usually require a server-side lookup instead of carrying roles inside the key?",
        answer: "An API key is usually an opaque bearer secret. The server maps its hash to application identity, scopes or permissions, status, owner, and limits. Keeping authorization data server-side allows permissions and revocation to change without issuing a new key.",
        tags: ["API key", "opaque credential", "authorization"]
      },
      {
        sourceId: "qa-4604",
        question: "Why might a revoked API key continue working even after its database record is disabled?",
        answer: "A cache may still contain an active key record. Revocation should update the source-of-truth database and invalidate the shared cache immediately. Per-instance local caches also need an invalidation event; otherwise the key remains accepted until their TTL expires.",
        tags: ["API key", "revocation", "cache invalidation"]
      },
      {
        sourceId: "qa-4605",
        question: "Why is copying roles into a long-lived server-side session risky, and what are better designs?",
        answer: "Authorization can become stale after an administrator changes the user’s roles. Alternatives include storing only userId and loading current permissions from a database or cache, storing a permissionsVersion and refreshing on mismatch, or maintaining userId-to-sessionIds for targeted invalidation.",
        tags: ["sessions", "authorization", "stale permissions"]
      },
      {
        sourceId: "qa-4606",
        question: "What does “opaque” mean in an opaque session ID, and why must the ID be unpredictable?",
        answer: "The ID contains no client-readable user ID, roles, or expiry; it is only a random lookup key to server-side state. It acts as a bearer secret, so a predictable value could be guessed and used to hijack another user’s session.",
        tags: ["sessions", "opaque token", "session hijacking"]
      },
      {
        sourceId: "qa-4607",
        question: "What does an HttpOnly session cookie protect against, and what can XSS still do?",
        answer: "HttpOnly prevents JavaScript from reading and exfiltrating the cookie value. It does not neutralize XSS: malicious same-origin JavaScript can still send authenticated requests through the victim’s browser while it is running.",
        tags: ["cookies", "HttpOnly", "XSS"]
      },
      {
        sourceId: "qa-4608",
        question: "Why might an application use CSRF tokens even when session cookies have a SameSite setting?",
        answer: "SameSite is a browser-level defense with compatibility and policy exceptions: some flows require SameSite=None, Lax permits some cross-site navigations, and sibling subdomains may be considered same-site. A CSRF token adds an application-level check that the request contains a secret associated with the legitimate session or page.",
        tags: ["CSRF", "SameSite", "defense in depth"]
      },
      {
        sourceId: "qa-4609",
        question: "In a synchronizer-token CSRF design, when is the token created, where is it stored, and why can an attacker submit a request but not obtain the valid token?",
        answer: "The server creates a cryptographically random token per session or request, stores the expected value in server-side session state, and exposes it to the legitimate page in HTML or an API response. The page explicitly returns it in a form field or header. An attacker can trigger a cross-site request and the browser may attach cookies automatically, but the same-origin policy prevents the attacker’s page from reading the protected page or response to learn the token.",
        tags: ["CSRF", "same-origin policy", "synchronizer token"]
      },
      {
        sourceId: "qa-4610",
        question: "What must an API validate before accepting a JWT?",
        answer: "Whitelist the expected algorithm; verify the signature with a trusted key; validate issuer, audience, expiry, and not-before while allowing only deliberate clock skew. Then perform authorization separately. A valid signature alone is insufficient.",
        tags: ["JWT", "validation", "authorization"]
      },
      {
        sourceId: "qa-4611",
        question: "Why is RS256 usually safer than HS256 across many microservices?",
        answer: "HS256 uses one shared secret for signing and verification, so any verifier that is compromised can forge tokens. With RS256, the authentication server keeps the private signing key while services receive only public verification keys, reducing the blast radius.",
        tags: ["JWT", "RS256", "HS256"]
      },
      {
        sourceId: "qa-4612",
        question: "Why use a short-lived access token together with a longer-lived refresh token?",
        answer: "The short access-token lifetime limits damage from theft and stale claims. The refresh token is sent only to the authentication server, which can check server-side state, rotate or revoke it, and issue a new access token without forcing frequent logins.",
        tags: ["access token", "refresh token", "trade-off"]
      },
      {
        sourceId: "qa-4613",
        question: "How does refresh-token rotation detect replay, and what should happen when an old refresh token is reused?",
        answer: "On refresh, atomically mark RT1 used and issue RT2 in the same token family. If RT1 appears again, treat it as copied or replayed and revoke the entire family, including RT2, because the server cannot know whether the attacker or genuine user received the successor.",
        tags: ["refresh token", "rotation", "replay detection"]
      },
      {
        sourceId: "qa-4614",
        question: "A user’s role changes, but an unexpired JWT still contains the old role. What happens, and how can the risk be reduced?",
        answer: "Services may continue authorizing the stale role until the JWT expires. Reduce the window with short-lived access tokens. For immediate revocation, add server-side checks such as token or user versioning, or a denylist for high-risk cases.",
        tags: ["JWT", "stale claims", "revocation"]
      }
    ]
  },

  "api-authorization": {
    title: "API Authorization Recall",
    categoryId: "system-design",
    topicId: "api-authorization",
    description: "Authorization models, delegated scopes, resource checks, and tenant isolation.",
    cards: [
      {
        sourceId: "qa-4630",
        question: "What is the difference between authentication and authorization?",
        answer: "Authentication answers “Who are you?” Authorization answers “What are you allowed to do?” A valid identity or token does not itself grant permission.",
        tags: ["authentication", "authorization"]
      },
      {
        sourceId: "qa-4631",
        question: "When should you choose RBAC, and what is its main limitation?",
        answer: "Choose RBAC when permissions follow stable organizational roles: user → role → permissions. It is simple to manage, but resource-specific exceptions can cause role explosion.",
        tags: ["RBAC", "trade-off"]
      },
      {
        sourceId: "qa-4632",
        question: "What does ABAC evaluate, and when is it useful?",
        answer: "ABAC evaluates attributes of the user, resource, action, and environment. Use it for dynamic rules such as matching tenant or department, device trust, resource state, amount limits, or time restrictions.",
        tags: ["ABAC", "dynamic policy"]
      },
      {
        sourceId: "qa-4633",
        question: "In OAuth, what is the difference between a scope and a resource permission?",
        answer: "The scope limits what the third-party client may do, such as drive.read. Resource permission limits which specific files or resources the user may access. Both checks must pass.",
        tags: ["OAuth", "scope", "resource permission"]
      },
      {
        sourceId: "qa-4634",
        question: "What checks prevent BOLA or IDOR and cross-tenant access?",
        answer: "Load the real resource using its ID, then verify that the caller has the required action permission and that the resource’s owner or tenant attributes match the authenticated context. Do not trust a client-supplied ownerId or tenantId as proof.",
        tags: ["BOLA", "IDOR", "tenant isolation"]
      },
      {
        sourceId: "qa-4635",
        question: "How do RBAC, ABAC, and OAuth fit together in a hybrid authorization system?",
        answer: "RBAC grants broad internal permissions, ABAC adds resource and context restrictions, and OAuth scopes limit delegated third-party access. Layer them instead of forcing one model to solve every case.",
        tags: ["RBAC", "ABAC", "OAuth"]
      }
    ]
  },

  "api-gateway": {
    title: "API Gateway Recall",
    categoryId: "system-design",
    topicId: "api-gateway",
    description: "Purpose, routing, reliability trade-offs, and the boundary between gateway and service logic.",
    cards: [
      {
        sourceId: "qa-4636",
        question: "What is an API Gateway, and what problem does it solve?",
        answer: "An API Gateway is a stable client-facing entry point that routes requests to backend services and centralizes cross-cutting concerns. It hides internal service locations and protocols, reducing client-to-service coupling. Core domain business logic should remain in backend services.",
        tags: ["definition", "routing", "coupling"]
      },
      {
        sourceId: "qa-4637",
        question: "What is the difference between API Gateway routing and load balancing?",
        answer: "Routing chooses which backend service receives the request using signals such as path, HTTP method, headers, or query parameters. Load balancing chooses which healthy instance of that selected service receives it.",
        tags: ["routing", "load balancing"]
      },
      {
        sourceId: "qa-4638",
        question: "What is the main API Gateway trade-off, and how is the risk reduced?",
        answer: "Centralization simplifies clients and makes shared policies consistent, but it adds a network hop and creates bottleneck and failure-blast-radius risk. Reduce the risk with multiple stateless gateway instances behind load balancing, health checks, autoscaling, timeouts, circuit breakers, rate limits, and strong monitoring.",
        tags: ["trade-off", "reliability", "blast radius"]
      },
      {
        sourceId: "qa-4639",
        question: "Which responsibilities belong at an API Gateway, and which should remain in backend services?",
        answer: "Gateway: routing, credential or token validation, coarse authorization, rate limiting, TLS termination, protocol translation, safe request or response transformation, logging, metrics, and tracing.\n\nServices: core domain rules, transactions, data ownership, and resource-level authorization that requires domain data. Defense in depth may repeat critical checks in services.",
        tags: ["responsibility boundary", "security", "domain logic"]
      }
    ]
  },

  "perfect-rectangle": {
    title: "Perfect Rectangle Recall",
    categoryId: "dsa",
    topicId: "perfect-rectangle",
    description: "Exact-cover conditions, failure modes, and the two invariants behind the O(n) solution.",
    cards: [
      {
        sourceId: "qa-4533",
        question: "What does a valid Perfect Rectangle cover require?",
        answer: "The bounding rectangle must be covered exactly once at every point: no gaps and no overlaps.",
        tags: ["definition", "exact cover"]
      },
      {
        sourceId: "qa-4534",
        question: "What are the only two conceptual failure modes in Perfect Rectangle?",
        answer: "A gap means some point is covered zero times. An overlap means some point is covered more than once.",
        tags: ["gap", "overlap"]
      },
      {
        sourceId: "qa-4535",
        question: "What is the global area invariant for Perfect Rectangle?",
        answer: "The sum of all small-rectangle areas must equal (maxX − minX) × (maxY − minY), the area of the overall bounding rectangle.",
        tags: ["area", "invariant"]
      },
      {
        sourceId: "qa-4536",
        question: "Why is equal total area alone insufficient for Perfect Rectangle?",
        answer: "A gap and an overlap can have equal area and cancel numerically, so the total area may still match even though the cover is invalid.",
        tags: ["area", "counterexample"]
      },
      {
        sourceId: "qa-4537",
        question: "What is the corner-parity invariant in Perfect Rectangle?",
        answer: "Toggle each rectangle corner in a set: insert it when absent and remove it when present. Properly paired internal corners occur an even number of times and therefore cancel.",
        tags: ["corners", "parity", "invariant"]
      },
      {
        sourceId: "qa-4538",
        question: "Which corners must remain after toggling every corner in a valid Perfect Rectangle?",
        answer: "Exactly the four bounding corners: (minX,minY), (minX,maxY), (maxX,minY), and (maxX,maxY).",
        tags: ["corners", "bounding box"]
      },
      {
        sourceId: "qa-4539",
        question: "Why do area equality and corner parity work together for Perfect Rectangle?",
        answer: "Area equality checks total coverage, while corner parity checks that internal boundaries pair correctly. Together they rule out area-changing gaps or overlaps and malformed boundary arrangements that area alone would miss.",
        tags: ["proof", "sufficiency", "invariants"]
      },
      {
        sourceId: "qa-4540",
        question: "Before designing a geometry sweep line, what simpler invariants should you check for?",
        answer: "Look first for global conservation, such as total area, and local parity or cancellation, such as corner occurrences, before simulating ordered events.",
        tags: ["problem solving", "sweep line", "invariants"]
      }
    ]
  },

  "non-overlapping-intervals": {
    title: "Non-overlapping Intervals Recall",
    categoryId: "dsa",
    topicId: "non-overlapping-intervals",
    description: "Reconstruct the earliest-finish-time exchange argument.",
    cards: [
      {
        sourceId: "qa-4380",
        question: "How do you visualize and prove that selecting intervals by earliest finishing time is optimal?",
        answer: "Take an optimal solution whose first interval is X, and let G be the available interval with the earliest end. Because end(G) ≤ end(X), replace X with G. Every later interval that started after end(X) also starts after end(G), so the replacement removes nothing and leaves the same or more free space. Therefore an optimal solution exists that starts with G. Repeat on the remaining intervals.\n\nReusable proof pattern: greedy choice → exchange with the optimal choice → prove no damage → repeat.",
        tags: ["greedy", "exchange argument", "proof"]
      }
    ]
  },

  "inversions-adjacent-swaps": {
    title: "Inversions and Adjacent Swaps Recall",
    categoryId: "dsa",
    topicId: "inversions-adjacent-swaps",
    description: "Prove both the lower bound and the construction that reaches it.",
    cards: [
      {
        sourceId: "qa-4640",
        question: "Why does the minimum number of adjacent swaps needed to sort an array equal its inversion count?",
        answer: "A sorted array has zero inversions. If an array is unsorted, it has an adjacent inversion. Swapping an adjacent inverted pair changes only that pair’s relative order, so the inversion count decreases by exactly one. Repeating reaches zero inversions in K swaps.\n\nConversely, one adjacent swap cannot remove more than one inversion because it changes the relative order of only one pair. Therefore at least K swaps are required and K swaps are achievable, where K is the initial inversion count.",
        tags: ["inversions", "adjacent swaps", "proof"]
      }
    ]
  }
};
