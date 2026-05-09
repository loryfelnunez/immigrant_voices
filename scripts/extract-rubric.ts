import path from "node:path";

import dotenv from "dotenv";

import { extractRubric } from "@/lib/rubric";
import { DOMAIN } from "@/lib/schemas";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const rubric = await extractRubric(DOMAIN);
  console.log(`Rubric regenerated: ${rubric.title}`);
  console.log(`Steps: ${rubric.steps.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
