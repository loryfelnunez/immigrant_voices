import Link from "next/link";

import { RubricStepCard } from "@/components/rubric-step-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRubrics, getStories } from "@/lib/data-store";
import { DOMAIN } from "@/lib/schemas";

export default async function HomePage() {
  const [rubrics, stories] = await Promise.all([getRubrics(), getStories()]);
  const rubric = rubrics.find((entry) => entry.domain === DOMAIN);
  const domainStories = stories.filter((story) => story.domain === DOMAIN);
  const hasRubric = Boolean(rubric?.steps.length);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <section className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-end">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Community knowledge for new immigrants</p>
          <div className="space-y-4">
            <h1 className="font-serif text-5xl leading-none md:text-7xl">Immigrant Voices</h1>
            <p className="max-w-2xl text-xl leading-8 text-slateWarm">
              Converting immigrant stories into shareable community knowledge we all can learn from.
            </p>
            <p className="max-w-xl text-base leading-7 text-slateWarm">
              Starting with: First credit card, for immigrants with a business idea.
            </p>
          </div>
        </div>
        <Card className="border-none bg-accent px-1 text-white">
          <CardContent className="space-y-4 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-white/75">Why this exists</p>
            <p className="text-2xl font-medium leading-9">
              The stories are the source. The rubric is the part you can reuse.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-16 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-accent">Rubric</p>
            <h2 className="font-serif text-4xl">{rubric?.title ?? "Getting Your First US Credit Card"}</h2>
          </div>
          <Button asChild>
            <Link href="/contribute">Share your story</Link>
          </Button>
        </div>

        <div className="space-y-5">
          {rubric && rubric.steps.length > 0 ? (
            rubric.steps.map((step, index) => {
              const supportingStories = domainStories.filter((story) => step.sourceStoryIds.includes(story.id));
              return <RubricStepCard key={step.id} step={step} index={index} supportingStories={supportingStories} />;
            })
          ) : (
            <Card>
              <CardContent className="space-y-4 p-8">
                <p className="text-sm uppercase tracking-[0.25em] text-accent">No rubric yet</p>
                <h3 className="font-serif text-3xl">Bring in stories first, then extract the rubric.</h3>
                <p className="max-w-2xl text-base leading-8 text-slateWarm">
                  This view stays empty until the app has real stories from Tavily or direct community contributions.
                  Run the ingestion script, or add a story manually, and then generate the rubric.
                </p>
                <div className="rounded-3xl bg-muted p-5 font-mono text-sm text-slateWarm">
                  npm run ingest:stories -- --limit 3
                  <br />
                  npm run extract:rubric
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
