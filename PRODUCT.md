# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Primary: Self-organizing Indian families and DIY hosts (grooms, brides, parents, siblings) planning major life celebrations (Vivah/Weddings, Community Utsavs, Jubilee Milestones) under tight budgets, high social stakes, and family scrutiny.
- Secondary: Community festival committees (Sarvajanik Utsav, Diwali, Dandiya, Ganesh Utsav) and independent celebration coordinators needing agency-grade rigor, mathematical justification for decisions, and printable vendor execution briefs.

## Product Purpose
Tyohar AI transforms Indian event planning from chaotic, ungrounded Pinterest moodboards and messy WhatsApp chats into an intelligent, mathematically grounded celebration execution co-pilot. It eliminates the 15–20% customary catering food waste, detects predatory vendor contract clauses before advance deposits are paid, protects non-negotiable family priorities during budget crunches, and manages cascading critical-path deadlines without single points of failure. Success is measured by zero food waste, zero budget overruns without sacrificing cultural warmth, and zero day-of logistics surprises.

## Positioning
The only celebration planning tool combining conversational generative AI (Gemini 2.5 Flash for contextual synthesis, unstructured quote auditing, and what-if contingencies) with deterministic TypeScript mathematical and graph algorithms (exact INR arithmetic, Kahn's topological sort, BFS delay cascade tracing, and the Shagun & Surplus Smart Plate turnout formula). Generic LLMs hallucinate Rupee math, produce circular dependencies, and crash under rate limits; Tyohar AI guarantees 100% computational correctness and full offline operational continuity.

## Operating Context
- Environments: Mobile and desktop web browsers during family planning sessions, WhatsApp vendor negotiation threads, and on-site venue walkthroughs.
- Artifacts & Deliverables: Single-page execution briefs (print-styled for physical vendor handoffs), JSON plan exports for versioning, and pre-formatted WhatsApp RFQ messages in natural Hinglish and formal English.
- Real-World Constraints: Last-minute guest count fluctuations, auspicious weekend (Saya/Mahurat) pricing spikes, vendor quote opacity (excluded GST, post-11 PM overtime surcharges, generator fuel, crockery breakage deposits), and multi-generational spatial friction.

## Capabilities and Constraints
- Capabilities:
  - Adaptive Intake Wizard with 1–5 Priority Weights and real-time demographic balance (Kids %, Adults %, Seniors %).
  - Shagun & Surplus Smart Plate Calculator: contracts guaranteed plates at realistic turnout (85–92%) and negotiates discounted buffer plates, activating a 3-step zero-waste redistribution plan when buffer > 15 plates.
  - 20% Over-Budget Surgical Trade-Off Simulator: automatically protects #1 priority categories while targeting lowest-priority unconfirmed categories first.
  - Vendor Quote Auditor: parses raw unstructured quotes, scores contract transparency (Value Score 0–100), and flags hidden fees.
  - WhatsApp RFQ Generator: drafts strategic negotiation messages in English/Hinglish that strictly conceal the host's maximum budget ceiling.
  - Dependency Timeline & Delay Cascade Tracer: Kahn's topological sort milestone sequencing with BFS cascade impact warnings and 1–4 week date compression testing.
  - Live Chaos Mutator Bar (⌘K): in-place state diffing for "+50 guests & -10% budget", moved dates, or custom plain-English contingencies without resetting user progress.
- Technical & Design Constraints:
  - Zero hardcoded API keys; BYOK option stored strictly in browser `sessionStorage`.
  - All AI cost figures badged as "Estimated Market Benchmark (Unconfirmed)" until marked as a verified vendor quote.
  - Client-side privacy-first architecture with 100% deterministic offline fallback if Gemini API is unavailable or quota-limited.
  - Strict repository size constraint (< 10 MB total).

## Brand Commitments
- Name: Tyohar AI (Intelligent Celebration & Execution Co-Pilot).
- Identity & Emblem: Multi-layered geometric Diya & Lotus vector emblem with warm artisanal pigment accents (BrandLogo.tsx).
- Voice: Respectful, culturally attuned, discerning, authoritative yet celebratory. Never clinical, patronizing, or boastful about internal CS algorithms; speaks the language of Indian hosts ("khaana kam nahi padna chahiye", shagun, mahurat) rather than developer jargon.
- Typography & Surface: "The Editorial Bahi-Khata" aesthetic — warm archival ivory (#FAF7F2) and sandstone (#F3EFE6) surfaces, crisp white ledger cards (#FFFFFF) with 1px architectural hairlines (#E4DEC8), deep kohl-ink text (#161412), and flat pigment accents in Sindoor Vermilion (#C23B22), Burnished Brass (#B4690E), and Mehendi Emerald (#1E5631). Google Fonts: 'Playfair Display' for ceremonial headings, 'Plus Jakarta Sans' for UI, and 'JetBrains Mono' for INR numbers and plate math.

## Evidence on Hand
- Working production application with 4 distinct celebration presets:
  - Royal Vivah (₹8,00,000 / 200 guests)
  - Community Utsav (₹50,000 / 350 guests)
  - Milestone Birthday (₹25,000 / 40 guests)
- Verified automated unit test suite (`src/__tests__/`) with 33 passing Vitest tests covering budget allocation, Smart Plate math, trade-off ranking, Kahn's topological sort, delay cascades, and input sanitization.
- Clean production Vite bundle under 600 KB total source footprint.

## Product Principles
1. **Math Is Sacrosanct, AI Is Contextual:** Pure arithmetic, critical-path graphs, and plate buffers are executed deterministically in TypeScript; GenAI is reserved for semantic extraction, custom package drafting, and conversational contingency parsing.
2. **Protect Non-Negotiables First:** When budgets surge or dates compress, cuts and trade-offs systematically target low-priority items, leaving the host's primary cultural centerpiece (e.g. Catering or Mandap) uncompromised.
3. **Transparent by Default:** Never display estimated figures as confirmed quotes; never expose maximum budget ceilings to vendors in negotiation messages; flag every hidden contractual surcharge upfront.
4. **Resilient Under Real-World Chaos:** Every view must support unexpected changes (+50 unexpected relatives, 2-week date shift, vendor cancellation) with in-place diffing that preserves user edits.
5. **Dignified Multi-Generational Inclusivity:** Events are designed for toddlers to grandparents simultaneously—acoustic zoning, dining cadence, and dietary segregation are treated as first-class constraints, not afterthoughts.

## Accessibility & Inclusion
- High-contrast WCAG AAA/AA text ratios (#161412 kohl ink over #FAF7F2 warm ivory surfaces) for effortless daylight and iPad readability by senior family members.
- Minimum 11px/12px typography floor—zero illegible 9px micro-copy.
- Semantic HTML5 landmarks (header, nav, main, aside, section, footer) and ARIA live regions (aria-live="polite") for real-time calculation and diff alerts.
- Physical & dietary inclusion as core planning dimensions: wheelchair access, low-decibel acoustic zones, dedicated Jain/Satvik kitchen counters, early kids dining (5:30 PM), and diabetic-friendly sweet counters.

