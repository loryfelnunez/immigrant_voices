import { promises as fs } from "node:fs";
import path from "node:path";

import { rubricSchema, sourceSchema, storySchema, type Rubric, type Source, type Story } from "@/lib/schemas";

const dataDir = path.join(process.cwd(), "data");
const sourcesFile = path.join(dataDir, "sources.json");
const storiesFile = path.join(dataDir, "stories.json");
const rubricsFile = path.join(dataDir, "rubrics.json");

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function ensureFile<T>(filePath: string, seed: T) {
  await ensureDir();

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(seed, null, 2), "utf8");
  }
}

async function readJsonArray<T>(filePath: string, seed: T[], parser: (value: unknown) => T) {
  await ensureFile(filePath, seed);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown[];
  return parsed.map(parser);
}

async function readJsonArraySafe<T>(filePath: string, seed: T[], parser: (value: unknown) => T) {
  await ensureFile(filePath, seed);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown[];
  return parsed.flatMap((value) => {
    try {
      return [parser(value)];
    } catch {
      return [];
    }
  });
}

async function writeJsonArray<T>(filePath: string, entries: T[]) {
  await ensureDir();
  await fs.writeFile(filePath, JSON.stringify(entries, null, 2), "utf8");
}

export async function getSources() {
  return readJsonArray(sourcesFile, [], (value) => sourceSchema.parse(value));
}

export async function saveSources(entries: Source[]) {
  await writeJsonArray(sourcesFile, entries);
}

export async function getStories() {
  return readJsonArray(storiesFile, [], (value) => storySchema.parse(value));
}

export async function saveStories(entries: Story[]) {
  await writeJsonArray(storiesFile, entries);
}

export async function getRubrics() {
  return readJsonArraySafe(rubricsFile, [], (value) => rubricSchema.parse(value));
}

export async function saveRubrics(entries: Rubric[]) {
  await writeJsonArray(rubricsFile, entries);
}

export function upsertById<T extends { id: string }>(entries: T[], nextEntry: T) {
  const index = entries.findIndex((entry) => entry.id === nextEntry.id);
  if (index === -1) {
    return [...entries, nextEntry];
  }

  const copy = [...entries];
  copy[index] = nextEntry;
  return copy;
}
