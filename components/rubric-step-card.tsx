"use client";

import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";

import { StoryCard } from "@/components/story-card";
import { Card, CardContent } from "@/components/ui/card";
import { getRecencyBadge } from "@/lib/recency";
import type { Rubric, Story } from "@/lib/schemas";

export function RubricStepCard({
  step,
  index,
  supportingStories
}: {
  step: Rubric["steps"][number];
  index: number;
  supportingStories: Story[];
}) {
  const [expanded, setExpanded] = useState(false);
  const badge = getRecencyBadge(step.lastValidatedAt);

  return (
    <Card className="overflow-hidden border-white/80 shadow-float">
      <CardContent className="p-0">
        <button
          className="flex w-full flex-col gap-5 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(241,221,214,0.34))] p-6 text-left transition-colors hover:bg-muted/45"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-accent">Step {index + 1}</p>
              <h3 className="font-serif text-2xl font-semibold">{step.title}</h3>
              <p className="max-w-3xl text-base leading-7 text-slateWarm">{step.why}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-slateWarm">
                <Users className="h-4 w-4" />
                {step.contributorCount} contributor{step.contributorCount === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-accent">
                {expanded ? "Hide source stories" : "Show source stories"}
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </span>
            </div>
          </div>
        </button>
        {expanded ? (
          <div className="grid gap-4 border-t border-border bg-[linear-gradient(180deg,rgba(244,239,233,0.7),rgba(255,255,255,0.85))] p-6 md:grid-cols-2">
            {supportingStories.map((story) => (
              <StoryCard key={story.id} story={story} compact />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
