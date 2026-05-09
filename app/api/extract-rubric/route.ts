import { NextRequest, NextResponse } from "next/server";

import { domainSchema } from "@/lib/schemas";
import { extractRubric } from "@/lib/rubric";
import { DOMAIN } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { domain?: string };
    const rubric = await extractRubric(body.domain ? domainSchema.parse(body.domain) : DOMAIN);
    return NextResponse.json(rubric);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract rubric." },
      { status: 500 }
    );
  }
}
