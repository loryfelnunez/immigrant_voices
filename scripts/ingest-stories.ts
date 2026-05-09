import { randomUUID } from "node:crypto";
import path from "node:path";

import dotenv from "dotenv";

import { getSources, getStories, saveSources, saveStories } from "@/lib/data-store";
import { domainQueries, getDomainDefinition } from "@/lib/domains";
import { searchTavily } from "@/lib/tavily";
import { extractedStorySchema, storySchema, sourceSchema, domainSchema, DOMAIN, type DomainId, type Source } from "@/lib/schemas";
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

function parseDomain() {
  const flagIndex = process.argv.findIndex((arg) => arg === "--domain");
  if (flagIndex === -1) {
    return DOMAIN;
  }

  return domainSchema.parse(process.argv[flagIndex + 1]);
}

function parseMaxStories() {
  const flagIndex = process.argv.findIndex((arg) => arg === "--max-stories");
  if (flagIndex === -1) {
    return 10;
  }

  const value = Number(process.argv[flagIndex + 1]);
  if (!Number.isFinite(value)) {
    return 10;
  }

  return Math.max(1, Math.min(10, value));
}

function buildExtractionPrompt(domain: DomainId, source: Source) {
  const domainDefinition = getDomainDefinition(domain);

  return `
You are cleaning raw web content into a structured immigrant story.

Rules:
- Extract the first-person narrative if there is one.
- Focus on the original poster and any clearly first-person account.
- Skip the content if it is not a first-person immigrant story about ${domainDefinition.label.toLowerCase()} in the United States.
- Infer countryOfOrigin and arrivalYear only if explicitly stated. Otherwise use null.
- Preserve specific details like banks, cards, dollar amounts, and timelines.
- Extract structured details that would help the next person:
  - mentionedOrganizations: banks, insurers, government agencies, employers, landlords, schools, clinics, platforms
  - productsOrServices: card names, insurance plans, portals, apps, account types, marketplaces, clinics
  - documentsMentioned: SSN, ITIN, lease, pay stubs, passport, visa, state ID, utility bill, etc.
  - feesOrAmounts: dollar amounts, deposits, annual fees, premiums, broker fees, balances
  - keyDetails: short factual bullets that do not fit neatly in the categories above
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
  "storyText": "string",
  "keyDetails": ["string", "string"],
  "mentionedOrganizations": ["string", "string"],
  "productsOrServices": ["string", "string"],
  "documentsMentioned": ["string", "string"],
  "feesOrAmounts": ["string", "string"]
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
  const domain = parseDomain();
  const maxStories = parseMaxStories();
  const together = getTogetherClient();

  const existingSources = await getSources();
  const existingStories = await getStories();
  const existingDomainStoryCount = existingStories.filter((story) => story.domain === domain).length;
  const sourceByUrl = new Map(existingSources.map((source) => [source.url, source]));
  const storyBySourceId = new Map(existingStories.map((story) => [story.sourceId, story]));

  if (existingDomainStoryCount >= maxStories) {
    console.log(`Domain ${domain} already has ${existingDomainStoryCount} stories. Max is ${maxStories}.`);
    return;
  }

  const domainSpecificQueries = domainQueries[domain];
  const queries = limit ? domainSpecificQueries.slice(0, limit) : domainSpecificQueries;
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
    const currentDomainCount = newStories.filter((story) => story.domain === domain).length;
    if (currentDomainCount >= maxStories) {
      break;
    }

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
          content: buildExtractionPrompt(domain, source)
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
      keyDetails: parsed.keyDetails,
      mentionedOrganizations: parsed.mentionedOrganizations,
      productsOrServices: parsed.productsOrServices,
      documentsMentioned: parsed.documentsMentioned,
      feesOrAmounts: parsed.feesOrAmounts,
      domain,
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

  console.log(`Domain: ${domain}`);
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
