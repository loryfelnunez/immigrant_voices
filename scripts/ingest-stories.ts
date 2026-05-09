import { randomUUID } from "node:crypto";
import path from "node:path";

import dotenv from "dotenv";

import { getSources, getStories, saveSources, saveStories } from "@/lib/data-store";
import { curatedQueries, searchTavily } from "@/lib/tavily";
import { extractedStorySchema, storySchema, sourceSchema, DOMAIN, type Source } from "@/lib/schemas";
import { getTogetherClient, getTogetherModel } from "@/lib/together";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

function parseLimit() {
  const flagIndex = process.argv.findIndex((arg) => arg === "--limit");
  if (flagIndex === -1) {
    return null;
  }

  const value = Number(process.argv[flagIndex + 1]);
  return Number.isFinite(value) ? value : null;
}

function buildExtractionPrompt(source: Source) {
  return `
You are cleaning raw web content into a structured immigrant story.

Rules:
- Extract the first-person narrative if there is one.
- Focus on the original poster and any clearly first-person account.
- Skip the content if it is not a first-person immigrant story about getting a first US credit card.
- Infer countryOfOrigin and arrivalYear only if explicitly stated. Otherwise use null.
- Preserve specific details like banks, cards, dollar amounts, and timelines.
- Keep the cleaned story between 100 and 250 words.
- Generate contributorName from the page if possible. If unavailable, use a neutral first-name placeholder.

Return strict JSON matching one of:
{"shouldInclude": false, "reason": "string"}
or
{
  "shouldInclude": true,
  "contributorName": "string",
  "countryOfOrigin": "string or null",
  "arrivalYear": 2023 or null,
  "storyText": "string"
}

Title: ${source.title}
URL: ${source.url}
Query: ${source.query}
Fetched at: ${source.fetchedAt}
Raw content:
${source.rawContent}
  `.trim();
}

async function main() {
  const limit = parseLimit();
  const together = getTogetherClient();

  const existingSources = await getSources();
  const existingStories = await getStories();
  const sourceByUrl = new Map(existingSources.map((source) => [source.url, source]));
  const storyBySourceId = new Map(existingStories.map((story) => [story.sourceId, story]));

  const queries = limit ? curatedQueries.slice(0, limit) : curatedQueries;
  const newSources: Source[] = [];

  for (const query of queries) {
    const response = await searchTavily(query, 6);

    for (const result of response.results ?? []) {
      if (sourceByUrl.has(result.url)) {
        continue;
      }

      const source = sourceSchema.parse({
        id: randomUUID(),
        url: result.url,
        title: result.title ?? "Untitled source",
        rawContent: result.raw_content ?? result.content ?? "",
        fetchedAt: new Date().toISOString(),
        query
      });

      sourceByUrl.set(source.url, source);
      newSources.push(source);
    }
  }

  const nextSources = [...existingSources, ...newSources];
  await saveSources(nextSources);

  let produced = 0;
  let skipped = 0;
  const skipReasons = new Map<string, number>();
  const newStories = [...existingStories];

  for (const source of newSources) {
    if (storyBySourceId.has(source.id)) {
      continue;
    }

    const completion = await together.chat.completions.create({
      model: getTogetherModel(),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You convert noisy web content into validated first-person story JSON."
        },
        {
          role: "user",
          content: buildExtractionPrompt(source)
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      skipped += 1;
      skipReasons.set("empty LLM response", (skipReasons.get("empty LLM response") ?? 0) + 1);
      continue;
    }

    const parsed = extractedStorySchema.parse(JSON.parse(content));
    if (!parsed.shouldInclude) {
      skipped += 1;
      skipReasons.set(parsed.reason, (skipReasons.get(parsed.reason) ?? 0) + 1);
      continue;
    }

    const story = storySchema.parse({
      id: randomUUID(),
      contributorName: parsed.contributorName,
      countryOfOrigin: parsed.countryOfOrigin,
      arrivalYear: parsed.arrivalYear,
      storyText: parsed.storyText,
      domain: DOMAIN,
      sourceId: source.id,
      sourceUrl: source.url,
      submittedAt: source.fetchedAt,
      isSeeded: true
    });

    newStories.push(story);
    storyBySourceId.set(story.sourceId, story);
    produced += 1;
  }

  await saveStories(newStories);

  console.log(`Queries run: ${queries.length}`);
  console.log(`New sources fetched: ${newSources.length}`);
  console.log(`Stories produced: ${produced}`);
  console.log(`Stories skipped: ${skipped}`);
  if (skipReasons.size > 0) {
    console.log("Skip reasons:");
    for (const [reason, count] of skipReasons.entries()) {
      console.log(`- ${reason}: ${count}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
