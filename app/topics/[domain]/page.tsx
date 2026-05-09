import { notFound } from "next/navigation";

import { StoryCard } from "@/components/story-card";
import { TopicRubricView } from "@/components/topic-rubric-view";
import { Card, CardContent } from "@/components/ui/card";
import { DOMAIN_DEFINITIONS, domainMap } from "@/lib/domains";
import { getRubrics, getStories } from "@/lib/data-store";

export function generateStaticParams() {
  return DOMAIN_DEFINITIONS.map((domain) => ({ domain: domain.id }));
}

export default async function TopicPage({
  params
}: {
  params: { domain: string };
}) {
  const domain = domainMap.get(params.domain as (typeof DOMAIN_DEFINITIONS)[number]["id"]);
  if (!domain) {
    notFound();
  }

  const [stories, rubrics] = await Promise.all([getStories(), getRubrics()]);
  const topicStories = stories.filter((story) => story.domain === domain.id);
  const storyPreview = [...topicStories].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 10);
  const rubric = rubrics.find((entry) => entry.domain === domain.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <section className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-end">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Immigrant Voices</p>
          <div className="space-y-4">
            <h1 className="font-serif text-5xl leading-none md:text-7xl">{domain.label}</h1>
            <p className="max-w-2xl text-xl leading-8 text-slateWarm">{domain.subtitle}</p>
            <p className="max-w-xl text-base leading-7 text-slateWarm">{domain.heroLine}</p>
          </div>
        </div>
        <Card className="border-none bg-[linear-gradient(135deg,#c75d45,#9f4c3d)] px-1 text-white shadow-float">
          <CardContent className="space-y-4 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-white/75">Community signal</p>
            <p className="text-2xl font-medium leading-9">
              {topicStories.length} stor{topicStories.length === 1 ? "y" : "ies"} feeding this topic so far.
            </p>
            <p className="text-sm leading-7 text-white/80">A rubric appears only when at least 5 stories support it.</p>
          </CardContent>
        </Card>
      </section>

      <TopicRubricView domain={domain} rubric={rubric} stories={topicStories} />

      <section className="mt-16 space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.25em] text-accent">Recent stories</p>
          <h2 className="font-serif text-4xl">Up to 10 stories behind this topic.</h2>
        </div>
        {storyPreview.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {storyPreview.map((story) => (
              <StoryCard key={story.id} story={story} compact />
            ))}
          </div>
        ) : (
          <Card className="story-grid-glow border-white/80">
            <CardContent className="p-8 text-base leading-8 text-slateWarm">
              No stories yet for this topic. Run ingestion for this domain or add a community contribution first.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
