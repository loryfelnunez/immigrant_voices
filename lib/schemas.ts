import { z } from "zod";

export const DOMAIN = "first-credit-card";
export const DOMAIN_IDS = [
  "first-credit-card",
  "healthcare",
  "housing",
  "jobs",
  "banking",
  "legal-paperwork"
] as const;

export const domainSchema = z.enum(DOMAIN_IDS);

export const sourceSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  rawContent: z.string(),
  fetchedAt: z.string(),
  query: z.string()
});

export const storySchema = z.object({
  id: z.string(),
  contributorName: z.string(),
  countryOfOrigin: z.string().nullable(),
  arrivalYear: z.number().int().nullable(),
  storyText: z.string(),
  keyDetails: z.array(z.string()).default([]),
  mentionedOrganizations: z.array(z.string()).default([]),
  productsOrServices: z.array(z.string()).default([]),
  documentsMentioned: z.array(z.string()).default([]),
  feesOrAmounts: z.array(z.string()).default([]),
  domain: z.string(),
  sourceId: z.string(),
  sourceUrl: z.string().url(),
  submittedAt: z.string(),
  isSeeded: z.boolean()
});

export const rubricStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  why: z.string(),
  sourceStoryIds: z.array(z.string()).min(2).max(10),
  lastValidatedAt: z.string(),
  contributorCount: z.number().int().min(2).max(10)
});

export const rubricSchema = z.object({
  id: z.string(),
  domain: z.string(),
  title: z.string(),
  steps: z.array(rubricStepSchema),
  generatedAt: z.string()
});

export const extractedStorySchema = z.discriminatedUnion("shouldInclude", [
  z.object({
    shouldInclude: z.literal(false),
    reason: z.string()
  }),
  z.object({
    shouldInclude: z.literal(true),
    contributorName: z.string(),
    countryOfOrigin: z.string().nullable(),
    arrivalYear: z.number().int().nullable(),
    storyText: z.string(),
    keyDetails: z.array(z.string()).max(6).default([]),
    mentionedOrganizations: z.array(z.string()).max(6).default([]),
    productsOrServices: z.array(z.string()).max(6).default([]),
    documentsMentioned: z.array(z.string()).max(6).default([]),
    feesOrAmounts: z.array(z.string()).max(6).default([])
  })
]);

export const extractedRubricSchema = z.object({
  title: z.string(),
  steps: z.array(
    z.object({
      title: z.string(),
      why: z.string(),
      sourceStoryIds: z.array(z.string()).min(2).max(10)
    })
  )
});

export const contributeSchema = z.object({
  domain: domainSchema,
  contributorName: z.string().min(1).max(80),
  countryOfOrigin: z.string().nullable(),
  arrivalYear: z.number().int().min(1900).max(new Date().getFullYear()).nullable(),
  storyText: z.string().min(40).max(4000)
});

export type Source = z.infer<typeof sourceSchema>;
export type Story = z.infer<typeof storySchema>;
export type Rubric = z.infer<typeof rubricSchema>;
export type RubricStep = z.infer<typeof rubricStepSchema>;
export type ContributeInput = z.infer<typeof contributeSchema>;
export type ExtractedStory = z.infer<typeof extractedStorySchema>;
export type ExtractedRubric = z.infer<typeof extractedRubricSchema>;
export type DomainId = z.infer<typeof domainSchema>;
