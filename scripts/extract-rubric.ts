import path from "node:path";

import dotenv from "dotenv";

import { extractRubric } from "@/lib/rubric";
import { domainSchema, DOMAIN } from "@/lib/schemas";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

function parseDomain() {
  const flagIndex = process.argv.findIndex((arg) => arg === "--domain");
  if (flagIndex === -1) {
    return DOMAIN;
  }

  return domainSchema.parse(process.argv[flagIndex + 1]);
}

async function main() {
  const rubric = await extractRubric(parseDomain());
  console.log(`Rubric regenerated: ${rubric.title}`);
  console.log(`Steps: ${rubric.steps.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
