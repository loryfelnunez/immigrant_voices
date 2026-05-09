import { DomainCard } from "@/components/domain-card";
import { TopicRubricView } from "@/components/topic-rubric-view";
import { RubricStepCard } from "@/components/rubric-step-card";
import { Card, CardContent } from "@/components/ui/card";
import { DOMAIN_DEFINITIONS, getDomainDefinition } from "@/lib/domains";
import { getRubrics, getStories } from "@/lib/data-store";
import { DOMAIN } from "@/lib/schemas";

export default async function HomePage() {
  const [rubrics, stories] = await Promise.all([getRubrics(), getStories()]);
  const featuredDomain = getDomainDefinition(DOMAIN);
  const rubric = rubrics.find((entry) => entry.domain === featuredDomain.id);
  const domainStories = stories.filter((story) => story.domain === featuredDomain.id);

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
              Browse the most common topics people struggle with first, then read the learnings built from real stories.
            </p>
          </div>
        </div>
        <Card className="border-none bg-accent px-1 text-white">
          <CardContent className="space-y-4 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-white/75">Why this exists</p>
            <p className="text-2xl font-medium leading-9">
              The stories are the source. The learnings are the part you can reuse.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-16 space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.25em] text-accent">Topics</p>
          <h2 className="font-serif text-4xl">Start with the topic you need right now.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {DOMAIN_DEFINITIONS.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              storyCount={stories.filter((story) => story.domain === domain.id).length}
              rubricCount={rubrics.filter((rubric) => rubric.domain === domain.id).length}
            />
          ))}
        </div>
      </section>

      <TopicRubricView domain={featuredDomain} rubric={rubric} stories={domainStories} />
    </div>
  );
}
