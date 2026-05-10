# Build Spec
## Immigrant Voices: Community Knowledge for New Immigrants

> Build a product that turns real immigrant stories from the open web into structured, traceable, recency-aware community knowledge.

---

## Product Brief

Build a web app called **Immigrant Voices**.

Immigrant Voices is an extension of the earlier **Rubricks** concept, applied to the immigration space. It turns first-person immigrant stories into practical learnings that the next person can actually use. The initial domain is:

**Getting your first credit card as an immigrant with a business idea in the US**

The product has four parts:

1. A **story ingestion pipeline** powered by Tavily
2. An **AI extraction pipeline** powered by Together.ai
3. Three frontend views: **Learn**, **Stories**, and **Contribute**
4. A **contribution loop** that feeds new stories back into the learning

This is a local development build only.

- No deployment
- No auth
- No database
- The goal is a clean, convincing demo running on `npm run dev`

---

## Tagline

Use this on the landing page:

> **Converting immigrant stories into shareable community knowledge we all can learn from.**

---

## Technical Stack

- **Next.js 14+** with App Router and TypeScript
- **Tailwind CSS** with **shadcn/ui**
- **Tavily API** for sourcing real stories from the web
- **Together.ai** for all LLM calls
- **Local JSON files** in `/data/` for persistence
- Default model: `meta-llama/Llama-3.3-70B-Instruct-Turbo`

Use the standard `openai` npm package pointed at Together's OpenAI-compatible endpoint:

```text
https://api.together.xyz/v1
```

---

## Environment

Create `.env.local` with:

```env
TAVILY_API_KEY=
TOGETHER_API_KEY=
TOGETHER_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

---

## Data Model

### Source

Raw Tavily result, preserved for provenance and debugging.

```ts
{
  id: string
  url: string
  title: string
  rawContent: string
  fetchedAt: string  // ISO date
  query: string      // the Tavily query that surfaced it
}
```

### Story

Cleaned, structured first-person narrative.

```ts
{
  id: string
  contributorName: string         // "Maria" or "Reddit user u/sometimes_lucky"
  countryOfOrigin: string | null  // null if unknown; do not fabricate
  arrivalYear: number | null      // null if unknown
  storyText: string               // cleaned first-person narrative
  domain: string                  // "first-credit-card"
  sourceId: string                // links to Source
  sourceUrl: string               // used for "read original" in the UI
  submittedAt: string             // ISO date; use fetchedAt for seeded stories
  isSeeded: boolean               // true for Tavily-sourced, false for direct contributions
}
```

### Learning

Structured output synthesized from repeated patterns across stories. Internally, this can still be stored in the existing `Rubric` shape if that keeps the implementation simple.

```ts
{
  id: string
  domain: string
  title: string                   // "Getting Your First US Credit Card"
  steps: Array<{
    id: string
    title: string                 // imperative, e.g. "Get an SSN or ITIN before applying"
    why: string                   // 1-2 sentences of reasoning
    sourceStoryIds: string[]      // stories that independently support this step
    lastValidatedAt: string       // most recent submittedAt among source stories
    contributorCount: number      // distinct supporting stories
  }>
  generatedAt: string
}
```

---

## Ingestion Pipeline

Build a script at:

```text
/scripts/ingest-stories.ts
```

Run it with:

```bash
npx tsx scripts/ingest-stories.ts
```

### Requirements

Search Tavily with a curated set of queries targeting real first-person stories.

Use:

- `search_depth: "advanced"`
- `include_raw_content: true`
- `include_domains` biased toward Reddit, Quora, Medium, and known immigrant/community blogs

### Seed queries

```text
"first credit card" immigrant USA reddit no credit history
"I wish I had known" credit card new immigrant America
secured credit card immigrant story experience reddit
Nova Credit immigrant first credit card review
building credit from scratch immigrant USA personal story
ITIN credit card application experience immigrant
authorized user immigrant build credit story
```

Add 2-3 additional variations to improve recall.

### Retrieval behavior

- Request **5-8 results per query**
- Save raw sources to `/data/sources.json`
- Deduplicate by URL

### For each new source

Call Together.ai to clean and structure it into a `Story`.

The extraction prompt should:

- Extract the first-person narrative if there is one
- In Reddit threads, prioritize the **OP** and any clearly first-person comment
- Skip non-story content such as generic how-to articles
- Infer `countryOfOrigin` and `arrivalYear` **only if explicitly stated**
- Preserve specific details: bank names, card products, amounts, timelines
- Keep cleaned stories between 100-250 words
- Generate a `contributorName` from the author handle when available
- If attribution is unavailable, use a neutral placeholder and clearly treat it as anonymized

Use Together.ai JSON mode:

```ts
response_format: { type: "json_object" }
```

Validate responses against the `Story` schema.

### Output requirements

- Write structured stories to `/data/stories.json`
- Deduplicate by `sourceId`
- Log results clearly: sources fetched, stories produced, stories skipped, and skip reasons

The script must be idempotent. Running it twice must not duplicate entries.

Support:

```text
--limit N
```

Target:

> 15-25 high-quality stories after the first run. Better fewer real stories than many weak ones.

---

## Learning Extraction Pipeline

Build an API route at:

```text
/app/api/extract-rubric/route.ts
```

### POST behavior

- Read all stories for the requested domain from `/data/stories.json`
- Call Together.ai with the extraction prompt
- Validate the response against the `Rubric` schema
- Write the learning structure to `/data/rubrics.json`
- Return the learning structure

Also provide a CLI script at:

```text
/scripts/extract-rubric.ts
```

This should run the same pipeline from the terminal.

### Extraction prompt

```text
You are extracting a community knowledge learning from real stories of immigrants who navigated getting their first US credit card. Read the stories below and produce a structured learning — a checklist with reasoning — that captures what these contributors collectively learned.

For each step in the learning:

- Use an imperative title (e.g. "Get your SSN or ITIN before applying")
- Explain the why in 1-2 sentences — the reasoning a friend would share, not generic advice
- Only include steps that are independently mentioned by 2 or more contributors
- Reference the story IDs that support each step
- Order steps logically: prerequisites first, then primary path, then optimization

The learning should feel like practical advice from someone who already solved this problem. It should not read like legal guidance or generic financial content. It should be specific, grounded, and traceable to what contributors actually did.

Return strict JSON matching this schema: [include schema]
```

Use JSON mode.

After parsing, compute:

- `lastValidatedAt`
- `contributorCount`

Both values should be derived from the referenced stories.

---

## Frontend

### Global layout

- Top nav: **Immigrant Voices** logo linking home
- Right-side links: `/stories` and `/contribute`
- Footer includes the tagline

### Visual direction

- Warm
- Calm
- Community-first
- Off-white background: `#FAF9F6` or similar
- One warm accent color:
  - terracotta `#C75D45`
  - or warm blue `#3B5BA5`
- Generous spacing
- Serif headings
- Clean sans-serif body
- `shadcn/ui` Card components with subtle shadows
- Avoid generic enterprise UI

---

## 1. Landing / Learn View (`/`)

### Hero

- **Immigrant Voices** as the main headline
- Tagline: _Converting immigrant stories into shareable community knowledge we all can learn from._
- Sub-headline: _Starting with: First credit card, for immigrants with a business idea._

### Main content

Render the learning directly below the hero:

- Learning title
- Vertical list of steps using card components

Each step should show:

- Step number
- Imperative title
- Short "why" explanation
- Recency badge
- Contributor count such as `"12 contributors"`
- Expand button to reveal supporting stories

### Expanded state

Show supporting stories as smaller cards with:

- Contributor name
- Country, if known
- Arrival year, if known
- Story snippet
- `"Read original →"` linking to `sourceUrl`

### CTA

Place this at the top-right of the learning section:

**Share your story** → links to `/contribute`

---

## 2. Stories View (`/stories`)

Top banner copy:

> **These stories are the source. The learning is what we extract from them.**

Show a grid of all stories.

Each card includes:

- Contributor name
- Country or `"Country unknown"`
- Arrival year or `"Year unknown"`
- Story text truncated to around 3 lines with expand behavior
- Small `"view original"` link

Add filtering:

- show all
- seeded only
- contributed only

---

## 3. Contribute View (`/contribute`)

### Page copy

Heading:

> **Share what you wish someone had told you.**

Sub-text:

> Right after you got your first card, what would you tell yourself six months ago? That's the most useful thing you can give the next person who lands here.

### Form fields

- First name or chosen handle
- Country of origin
  - searchable dropdown
  - include `"prefer not to say"`
- Arrival year
  - number input
  - include `"prefer not to say"`
- Story textarea
  - placeholder: `"What worked? What didn't? What was the move that finally clicked?"`

Submit button:

> **Add my story to the learning**

### On submit

- POST to `/api/contribute`
- Append the story to `/data/stories.json`
- Automatically trigger learning extraction
- Show confirmation state:

> **Thank you. Your story is now part of the learning. The next person who needs this will see what you learned.**

Include:

**Back to the learning**

This page should feel intentional and human, not transactional. The copy matters here more than anywhere else in the product.

---

## Recency Logic

For each learning step:

- `< 3 months` since `lastValidatedAt` → green badge: **Recently validated**
- `3-12 months` → amber badge: **Validated X months ago**
- `> 12 months` → gray badge: **Last validated over a year ago**

This badge should make it obvious that the learning is living knowledge, not static content.

---

## Scope Constraints

Do not add any of the following:

- No authentication
- No database
- No multi-domain support
- No moderation, editing, or admin views
- No deployment config
- No tests
- No mobile-specific work beyond good Tailwind/shadcn defaults

Keep the scope tight.

---

## Execution Order

1. Scaffold the Next.js app with TypeScript, Tailwind, and shadcn/ui
2. Set up `.env.local` and the Together.ai client
3. Build the Tavily ingestion script and ingest real stories first
4. Build the learning extraction pipeline
5. Build the learning view
6. Build the stories view
7. Build the contribute flow
8. Do a final polish pass on the learning view

The learning view is the centerpiece of the demo. Polish there matters most.

---

## Product Principles

- Keep the copy human: `"12 contributors"`, not `"12 data points"`
- The product should feel like a community artifact, not a database
- AI handles ingestion and extraction; the stories remain the primary asset
- Preserve attribution rigorously
- Every story keeps its `sourceUrl`
- Every contributor keeps a name or clear attribution handle
- Do not fabricate
- Do not wash away useful specifics in the name of neatness
- Optimize for a strong local demo on `npm run dev`
- Do not add deployment complexity

---

## Delivery Standard

Build all of this in the order above.

Start by scaffolding, ingest real stories first, extract the learning second, and then build the UI around real data.

The result should feel like an early product with clear judgment behind it, not a generic prototype.
