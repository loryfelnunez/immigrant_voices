Build prompt: Rubricks — Community Knowledge for New Immigrants (local dev, Tavily + Together.ai)
What you're building
A web app called Rubricks that converts real immigrant stories from the open web into a structured, recency-scored rubric that helps the next person navigate the same journey. The first domain is getting your first credit card as an immigrant with a business idea in the US.
The product has four parts: a story ingestion pipeline (Tavily-driven), an AI extraction pipeline (Together.ai), three frontend views (Rubric, Stories, Contribute), and a contribution loop that closes back into the rubric.
This is a local dev build. No deployment, no auth, no database. Just npm run dev and a clean demo.
Tagline (use on the landing page)

Converting immigrant stories into shareable community knowledge we all can learn from.

Stack

Next.js 14+ (App Router, TypeScript)
Tailwind CSS + shadcn/ui components
Tavily API (tavily-js or direct fetch) for sourcing real stories from the web
Together.ai (OpenAI-compatible SDK) for all LLM calls — both story cleaning and rubric extraction
Local JSON files in /data/ for persistence: stories.json, rubrics.json, sources.json
Default model: meta-llama/Llama-3.3-70B-Instruct-Turbo (configurable via env)

Environment setup
Create a .env.local template with:
TAVILY_API_KEY=
TOGETHER_API_KEY=
TOGETHER_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
Use the OpenAI SDK pointed at Together's endpoint (https://api.together.xyz/v1) — Together is OpenAI-compatible, so the standard openai npm package works cleanly.
The data model
Source (raw Tavily result, kept for traceability):
ts{
  id: string
  url: string
  title: string
  rawContent: string
  fetchedAt: string  // ISO date
  query: string      // the Tavily query that surfaced it
}
Story (cleaned, structured human narrative):
ts{
  id: string
  contributorName: string         // "Maria" or "Reddit user u/sometimes_lucky" — preserve attribution
  countryOfOrigin: string | null  // null if unknown — don't fabricate
  arrivalYear: number | null      // null if unknown
  storyText: string               // the cleaned first-person narrative
  domain: string                  // "first-credit-card"
  sourceId: string                // links to Source
  sourceUrl: string               // for "read original" link in UI
  submittedAt: string             // ISO date — use the source's fetchedAt for seeded stories
  isSeeded: boolean               // true for Tavily-sourced, false for direct contributions
}
Rubric (AI-extracted structure):
ts{
  id: string
  domain: string
  title: string                   // "Getting Your First US Credit Card"
  steps: Array<{
    id: string
    title: string                 // imperative, e.g. "Get an SSN or ITIN before applying"
    why: string                   // 1-2 sentences of reasoning — the why behind the step
    sourceStoryIds: string[]      // which stories independently mention this
    lastValidatedAt: string       // most recent submittedAt across source stories
    contributorCount: number      // count of distinct stories supporting it
  }>
  generatedAt: string
}
The Tavily ingestion pipeline
Build a script at /scripts/ingest-stories.ts (run via npx tsx scripts/ingest-stories.ts) that:

Searches Tavily with a curated set of queries targeting real first-person stories. Use search_depth: "advanced" and prefer Reddit, blog posts, and community forums. Include queries like:

"first credit card" immigrant USA reddit no credit history
"I wish I had known" credit card new immigrant America
secured credit card immigrant story experience reddit
Nova Credit immigrant first credit card review
building credit from scratch immigrant USA personal story
ITIN credit card application experience immigrant
authorized user immigrant build credit story
Add 2-3 more variations the agent comes up with

For each query, request 5-8 results. Use include_domains to bias toward Reddit, Quora, Medium, and known immigrant blogs. Use include_raw_content: true to get full page content.
Saves raw sources to /data/sources.json with deduplication by URL.
For each new source, calls Together.ai to clean and structure it into a Story. The LLM prompt should:

Extract the first-person narrative if there is one (Reddit threads often have one OP story plus comments — focus on the OP plus any comment that's clearly a first-person account)
Skip if the content isn't a first-person story (e.g. it's a how-to article from Capital One)
Infer countryOfOrigin and arrivalYear only if explicitly stated; otherwise null
Preserve specific details: bank names, card products, dollar amounts, timeline. Do not generalize.
Keep length 100-250 words after cleaning
Generate a contributorName from the Reddit username or blog author if available; otherwise use a neutral first-name placeholder with a flag that it's anonymized

Use Together.ai's OpenAI-compatible JSON mode (response_format: { type: "json_object" }) for structured output. Validate the response against the Story schema.
Writes structured stories to /data/stories.json, deduplicated by sourceId.
Logs results clearly: how many sources fetched, how many stories produced, how many skipped (with reason). The user should be able to read the log and trust the pipeline.

The script should be idempotent — running it twice doesn't duplicate. It should also support a --limit N flag for quick testing.
Target: 15-25 high-quality stories after the first run. Better fewer real ones than many synthetic ones.
The rubric extraction pipeline
API route at /app/api/extract-rubric/route.ts (POST):

Reads all stories for the requested domain from /data/stories.json
Calls Together.ai with the extraction prompt
Validates the response against the Rubric schema
Writes to /data/rubrics.json
Returns the rubric

The extraction prompt:

You are extracting a community knowledge rubric from real stories of immigrants who navigated getting their first US credit card. Read the stories below and produce a structured rubric — a checklist with reasoning — that captures what these contributors collectively learned.
For each step in the rubric:

Use an imperative title (e.g. "Get your SSN or ITIN before applying")
Explain the why in 1-2 sentences — the reasoning a friend would share, not generic advice
Only include steps that are independently mentioned by 2 or more contributors
Reference the story IDs that support each step
Order steps logically: prerequisites first, then primary path, then optimization

The rubric should feel like the friend who moved here three years before you, sitting you down and saying "here's what I wish someone had told me." Not legal advice. Not generic. Specific, real, grounded in what these people actually did.
Return strict JSON matching this schema: [include schema]

Use JSON mode. After parsing, compute lastValidatedAt and contributorCount for each step from the referenced stories.
Provide a CLI script at /scripts/extract-rubric.ts that runs the same pipeline, so the user can regenerate from the terminal.
The frontend
Layout
Top nav: Rubricks (logo, links home), with right-side links to /stories and /contribute. Footer with the tagline.
Visual tone: warm, slightly soft, community-first. Off-white background (#FAF9F6 or similar). One warm accent color (terracotta #C75D45 or warm blue #3B5BA5 — your call). Generous spacing. Serif headings, clean sans-serif body. shadcn Card components with subtle shadows. Avoid enterprise gray.
1. Landing / Rubric view (/)
Hero:

Rubricks (large)
Tagline: Converting immigrant stories into shareable community knowledge we all can learn from.
Sub-headline: Starting with: First credit card, for immigrants with a business idea.

Below the hero, the rubric:

Title of the rubric (e.g. "Getting Your First US Credit Card")
Vertical list of steps (Card components)
Each step shows:

Step number + imperative title (bold)
The "why" reasoning (regular weight, slightly muted)
Recency badge (color-coded — see below)
Contributor count: "12 contributors" with a small icon
Expand button → reveals source stories



Expanded step shows source stories as small cards: contributor name + country (if known) + arrival year (if known) + story snippet + "read original →" linking to sourceUrl.
Top-right of the rubric section: a "Share your story" button (primary CTA) → goes to /contribute.
2. Stories view (/stories)
Banner at top: "These stories are the source. The rubric is what we extract from them."
Grid of all source stories. Each card: contributor name, country (or "Country unknown"), arrival year (or "Year unknown"), the story text (truncated to ~3 lines with expand), and a small "view original" link.
Filter: show all / seeded only / contributed only.
3. Contribute view (/contribute)
Heading: Share what you wish someone had told you.
Sub-text: Right after you got your first card, what would you tell yourself six months ago? That's the most useful thing you can give the next person who lands here.
Form fields:

First name (or chosen handle)
Country of origin (searchable dropdown, with "prefer not to say")
Arrival year (number input, with "prefer not to say")
Story (textarea, placeholder: "What worked? What didn't? What was the move that finally clicked?")
Submit button: "Add my story to the rubric"

On submit:

POST to /api/contribute which appends to /data/stories.json
Automatically calls the extract-rubric pipeline so the rubric updates
Shows a confirmation screen: "Thank you. Your story is now part of the rubric. The next person who needs this will see what you learned."
Includes a "Back to the rubric" button

The page should feel like a small ritual, not a form. Be careful with copy — it's the emotional center of the product.
Recency logic
For each step:

< 3 months since lastValidatedAt → green badge: "Recently validated"
3–12 months → amber badge: "Validated 6 months ago" (compute the actual gap)
> 12 months → gray badge: "Last validated over a year ago"

This badge is the visual cue that the rubric is living. It must be obvious in the UI.
What to leave out (scope ruthlessly)

No authentication
No database (JSON files only)
No multi-domain (just first-credit-card)
No moderation, editing, or admin views
No deployment config (local only)
No tests
No mobile-specific work beyond shadcn/Tailwind defaults

Build order

Scaffold the Next.js app with TypeScript, Tailwind, shadcn/ui
Set up .env.local template and the Together.ai client (OpenAI SDK pointed at Together)
Build the Tavily ingestion script — get real stories first, before anything else
Build the rubric extraction pipeline (script + API route)
Build the rubric view (this is the demo's hero — polish here matters most)
Build the stories view
Build the contribute flow
Final polish pass on the rubric view

Final notes

Keep copy human. "12 contributors," not "12 data points." Real names, real countries, real years where known.
The product feels like a community, not a database. Every UI choice should reinforce that.
The AI is doing the boring work (ingestion, extraction). The humans are doing the meaningful work (their stories). The UI should make that hierarchy visible.
Preserve attribution rigorously. Every story has a sourceUrl. Every contributor has a name. Don't fabricate, don't generalize, don't lose provenance.
The demo is local. Build for npm run dev on the founder's laptop. Don't add deployment complexity.

Build all of this. Start by scaffolding, then ingest real stories from Tavily, then extract the rubric, then build the UI. Demo-quality polish on the rubric view specifically.