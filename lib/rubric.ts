import { randomUUID } from "node:crypto";

import { getRubrics, getStories, saveRubrics, upsertById } from "@/lib/data-store";
import { getTogetherClient, getTogetherModel } from "@/lib/together";
import { extractedRubricSchema, rubricSchema, type Rubric, type Story } from "@/lib/schemas";

function buildRubricPrompt(stories: Story[]) {
  const storyBlock = stories
    .map((story) => {
      return [
        `Story ID: ${story.id}`,
        `Contributor: ${story.contributorName}`,
        `Country of origin: ${story.countryOfOrigin ?? "unknown"}`,
        `Arrival year: ${story.arrivalYear ?? "unknown"}`,
        `Submitted at: ${story.submittedAt}`,
        `Story: ${story.storyText}`
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return `
You are extracting a community knowledge rubric from real stories of immigrants who navigated getting their first US credit card.
Read the stories below and produce a structured rubric that captures what these contributors collectively learned.

Rules:
- Use an imperative title for each step.
- Explain the why in 1-2 sentences grounded in the stories.
- Only include steps mentioned by 2 or more contributors.
- Reference the story IDs that support each step.
- Order steps logically: prerequisites first, then primary path, then optimization.
- Do not include generic advice that is not clearly supported by the stories.

Return strict JSON matching:
{
  "title": "string",
  "steps": [
    {
      "title": "string",
      "why": "string",
      "sourceStoryIds": ["story-id-1", "story-id-2"]
    }
  ]
}

Stories:
${storyBlock}
  `.trim();
}

function hydrateRubric(domain: string, title: string, steps: Array<{ title: string; why: string; sourceStoryIds: string[] }>, stories: Story[]): Rubric {
  const storyMap = new Map(stories.map((story) => [story.id, story]));

  return rubricSchema.parse({
    id: `rubric-${domain}`,
    domain,
    title,
    generatedAt: new Date().toISOString(),
    steps: steps.map((step) => {
      const supportingStories = step.sourceStoryIds
        .map((storyId) => storyMap.get(storyId))
        .filter((story): story is Story => Boolean(story));

      const lastValidatedAt = supportingStories
        .map((story) => story.submittedAt)
        .sort()
        .at(-1) ?? new Date().toISOString();

      return {
        id: randomUUID(),
        title: step.title,
        why: step.why,
        sourceStoryIds: [...new Set(step.sourceStoryIds)],
        lastValidatedAt,
        contributorCount: new Set(supportingStories.map((story) => story.id)).size
      };
    })
  });
}

function extractFallbackRubric(domain: string, stories: Story[]) {
  const patterns = [
    {
      title: "Get your SSN or ITIN lined up before you apply",
      why: "Contributors repeatedly describe identity setup as the thing that prevents dead-end applications. Having the right tax identifier in place made approvals and account setup more straightforward.",
      matches: [/ssn/i, /\bitin\b/i]
    },
    {
      title: "Start with a secured card or another thin-file path",
      why: "The most common first win was not an elite card. People got traction by choosing products built for new arrivals, secured cards, or issuers willing to underwrite a thin file.",
      matches: [/secured/i, /thin file/i, /starter card/i, /nova credit/i]
    },
    {
      title: "Build a relationship with one bank before optimizing rewards",
      why: "Several stories point to checking accounts, deposits, and consistent payments with one institution as useful trust signals early on. That relationship often mattered more than squeezing out points.",
      matches: [/checking account/i, /direct deposit/i, /relationship/i, /same bank/i, /banker/i]
    },
    {
      title: "Keep utilization low and pay before the balance starts looking risky",
      why: "The shared pattern is disciplined use rather than heavy spend. Small recurring charges plus frequent payments helped contributors build history without letting a new card work against them.",
      matches: [/autopay/i, /paid every/i, /paid before/i, /utilization/i, /subscriptions/i, /groceries/i, /gas/i]
    },
    {
      title: "Use authorized-user or foreign-history bridges if you have them",
      why: "People who could borrow trust from an older account or translate prior credit history felt they skipped part of the slowest path. It was a useful accelerator when available.",
      matches: [/authorized user/i, /nova credit/i, /foreign history/i, /oldest card/i]
    }
  ];

  const steps = patterns
    .map((pattern) => {
      const matchingStories = stories.filter((story) =>
        pattern.matches.some((regex) => regex.test(story.storyText))
      );

      if (matchingStories.length < 2) {
        return null;
      }

      return {
        title: pattern.title,
        why: pattern.why,
        sourceStoryIds: matchingStories.map((story) => story.id)
      };
    })
    .filter((step): step is NonNullable<typeof step> => Boolean(step));

  return hydrateRubric(domain, "Getting Your First US Credit Card", steps, stories);
}

export async function extractRubric(domain: string) {
  const stories = (await getStories()).filter((story) => story.domain === domain);
  if (stories.length < 2) {
    throw new Error("At least two stories are required to extract a rubric.");
  }

  let rubric: Rubric;

  try {
    const client = getTogetherClient();
    const response = await client.chat.completions.create({
      model: getTogetherModel(),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You extract structured, grounded community knowledge from real immigrant stories."
        },
        {
          role: "user",
          content: buildRubricPrompt(stories)
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Together returned an empty rubric response.");
    }

    const parsed = extractedRubricSchema.parse(JSON.parse(content));
    rubric = hydrateRubric(domain, parsed.title, parsed.steps, stories);
  } catch (error) {
    console.warn("Falling back to heuristic rubric extraction:", error);
    rubric = extractFallbackRubric(domain, stories);
  }

  const existingRubrics = await getRubrics();
  await saveRubrics(upsertById(existingRubrics, rubric));

  return rubric;
}
