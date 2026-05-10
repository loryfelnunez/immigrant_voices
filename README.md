# Immigrant Voices

Immigrant Voices is a Next.js app that turns immigrant stories into reusable community knowledge. It collects first-person stories about common newcomer challenges in the US, structures those stories into normalized records, and then generates practical learnings by topic.

The live deployment is on Vercel:
`https://immigrant-voices.vercel.app`

## What the project does

The app focuses on topics that new immigrants often struggle with early on:

- First credit card
- Healthcare
- Housing
- Jobs
- Banking
- Legal paperwork

For each topic, the product does two things:

1. It shows the original stories.
2. It generates a topic-level rubric of community learnings grounded in those stories.

Users can also contribute their own stories through the app, and those contributions can feed the next round of rubric generation.

## Tech stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Tavily for web search and raw-content retrieval
- Together AI for structured extraction and rubric generation
- Local JSON files in `data/` for persistence

## Local setup

Create a `.env.local` file with:

```env
TAVILY_API_KEY=your_tavily_key
TOGETHER_API_KEY=your_together_key
TOGETHER_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Useful scripts

Run story ingestion for the default topic:

```bash
npm run ingest:stories
```

Run story ingestion for a specific topic:

```bash
npm run ingest:stories -- --domain housing
```

Limit how many search queries are used:

```bash
npm run ingest:stories -- --domain jobs --limit 3
```

Cap the number of stored stories for a topic:

```bash
npm run ingest:stories -- --domain banking --max-stories 10
```

Regenerate a rubric for a topic:

```bash
npm run extract:rubric -- --domain first-credit-card
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## App flow

### 1. Story collection

Stories come from two places:

- Web-sourced stories collected by the ingestion script
- Direct community submissions through the contribute form

Web-sourced entries are marked as seeded data, while form submissions are stored as contributed stories.

### 2. Tavily extraction

The ingestion script in `scripts/ingest-stories.ts` starts with a set of topic-specific search queries from `lib/domains.ts`.

For each query, we use Tavily to:

- Search domains that are likely to contain personal experience posts
- Fetch raw page content
- Save source metadata into `data/sources.json`

The project currently prefers sources like Reddit, Quora, Medium, expat forums, and similar sites where first-person accounts are common.

### 3. Structured story extraction

After fetching raw content, the app sends each source to the Together model with a strict extraction prompt. That prompt asks the model to keep only valid first-person immigrant stories related to the selected topic.

For accepted stories, we extract:

- Contributor name
- Country of origin
- Arrival year
- Cleaned story text
- Organizations mentioned
- Products or services mentioned
- Documents mentioned
- Fees or amounts
- Other key details

Those normalized records are saved into `data/stories.json`.

### 4. Clustering into recurring themes

Once stories exist for a topic, we look across the whole set and group repeated signals into shared learnings. In practice, the clustering here is semantic rather than embedding-based:

- All stories are already grouped by topic domain
- The rubric generation step compares stories side by side
- It identifies repeated actions, obstacles, and successful patterns mentioned by multiple contributors
- It turns those repeated patterns into ordered rubric steps

Each generated step must be supported by multiple stories, and the saved rubric keeps the supporting story IDs so every learning is traceable back to the source stories.

### 5. How we came up with the learnings

The learnings are not written manually. They are synthesized from repeated patterns in the story set.

The rubric generation logic in `lib/rubric.ts` asks the model to:

- Read all stories for one topic
- Find only advice that is independently supported by multiple contributors
- Explain why the step matters based on the evidence in the stories
- Order the steps from prerequisite actions to the main path and then optimization

The output becomes a topic rubric saved in `data/rubrics.json`.

If model-based extraction fails, the app falls back to a heuristic rubric path for resilience.

## Data files

- `data/sources.json`: raw source metadata and fetched content
- `data/stories.json`: cleaned, structured story records
- `data/rubrics.json`: generated topic learnings and supporting story references

## Main routes

- `/`: landing page with topic overview and featured rubric
- `/topics/[domain]`: topic page with rubric and supporting stories
- `/stories`: browse all stored stories
- `/contribute`: submit a new story

## Deployment

This project is deployed on Vercel at:
`https://immigrant-voices.vercel.app`

For Vercel deployment, the required environment variables are:

- `TAVILY_API_KEY`
- `TOGETHER_API_KEY`
- `TOGETHER_MODEL`

## Project goal

The core idea is simple: immigrant stories are valuable, but raw stories are hard to reuse at scale. This project turns those stories into structured community knowledge so the next person can learn faster, avoid common mistakes, and start from what already worked for others.
