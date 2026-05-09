import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getStories, saveStories } from "@/lib/data-store";
import { extractRubric } from "@/lib/rubric";
import { contributeSchema, storySchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const payload = contributeSchema.parse(await request.json());
    const stories = await getStories();

    const story = storySchema.parse({
      id: randomUUID(),
      contributorName: payload.contributorName,
      countryOfOrigin: payload.countryOfOrigin,
      arrivalYear: payload.arrivalYear,
      storyText: payload.storyText,
      domain: payload.domain,
      sourceId: `contribution-${Date.now()}`,
      sourceUrl: "http://localhost:3000/contribute",
      submittedAt: new Date().toISOString(),
      isSeeded: false
    });

    await saveStories([...stories, story]);

    let rubric = null;
    try {
      rubric = await extractRubric(payload.domain);
    } catch (error) {
      console.warn("Rubric extraction skipped after contribution:", error);
    }

    return NextResponse.json({ story, rubric });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save contribution." },
      { status: 400 }
    );
  }
}
