import { StoryCard } from "@/components/story-card";
import { getStories } from "@/lib/data-store";

export default async function StoriesPage({
  searchParams
}: {
  searchParams?: { filter?: string };
}) {
  const stories = await getStories();
  const filter = searchParams?.filter ?? "all";
  const filteredStories = stories.filter((story) => {
    if (filter === "web") {
      return story.isSeeded;
    }
    if (filter === "contributed") {
      return !story.isSeeded;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <section className="space-y-5">
        <p className="text-sm uppercase tracking-[0.35em] text-accent">Stories</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-tight">
          These stories are the source. The rubric is what we extract from them.
        </h1>
        <div className="flex flex-wrap gap-3 text-sm">
          <a className={`rounded-full border px-4 py-2 ${filter === "all" ? "border-accent bg-accent text-white" : "border-border bg-white"}`} href="/stories?filter=all">
            Show all
          </a>
          <a className={`rounded-full border px-4 py-2 ${filter === "web" ? "border-accent bg-accent text-white" : "border-border bg-white"}`} href="/stories?filter=web">
            Web-sourced only
          </a>
          <a className={`rounded-full border px-4 py-2 ${filter === "contributed" ? "border-accent bg-accent text-white" : "border-border bg-white"}`} href="/stories?filter=contributed">
            Contributed only
          </a>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => <StoryCard key={story.id} story={story} compact />)
        ) : (
          <div className="md:col-span-2 xl:col-span-3">
            <div className="rounded-[28px] border border-border bg-card p-8 shadow-card">
              <p className="text-sm uppercase tracking-[0.25em] text-accent">No stories yet</p>
              <p className="mt-3 max-w-2xl text-base leading-8 text-slateWarm">
                Run the Tavily ingestion script to crawl real stories from the web, or submit one through the contribute flow.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
