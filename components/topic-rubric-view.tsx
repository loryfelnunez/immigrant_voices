import Link from "next/link";

import { RubricStepCard } from "@/components/rubric-step-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DomainDefinition } from "@/lib/domains";
import type { Rubric, Story } from "@/lib/schemas";

export function TopicRubricView({
  domain,
  rubric,
  stories
}: {
  domain: DomainDefinition;
  rubric?: Rubric;
  stories: Story[];
}) {
  return (
    <section className="mt-16 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.25em] text-accent">{domain.label}</p>
          <h2 className="font-serif text-4xl">{rubric?.title ?? domain.rubricTitle}</h2>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="secondary">
            <Link href={`/stories?domain=${domain.id}`}>View stories</Link>
          </Button>
          <Button asChild>
            <Link href={`/contribute?domain=${domain.id}`}>Share your story</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {rubric && rubric.steps.length > 0 ? (
          rubric.steps.map((step, index) => {
            const supportingStories = stories.filter((story) => step.sourceStoryIds.includes(story.id));
            return <RubricStepCard key={step.id} step={step} index={index} supportingStories={supportingStories} />;
          })
        ) : (
          <Card className="story-grid-glow border-white/80">
            <CardContent className="space-y-4 p-8">
              <p className="text-sm uppercase tracking-[0.25em] text-accent">No rubric yet</p>
              <h3 className="font-serif text-3xl">This topic needs at least 5 real stories first.</h3>
              <p className="max-w-2xl text-base leading-8 text-slateWarm">
                A rubric only appears when the advice is supported by repeated lived experience. Until then, people can
                still read stories and add their own.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
