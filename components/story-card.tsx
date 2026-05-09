import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Story } from "@/lib/schemas";

export function StoryCard({ story, compact = false }: { story: Story; compact?: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{story.contributorName}</CardTitle>
        <p className="text-sm text-slateWarm">
          {story.countryOfOrigin ?? "Country unknown"} · {story.arrivalYear ?? "Year unknown"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={compact ? "line-clamp-4 text-sm leading-7 text-foreground/85" : "text-sm leading-7 text-foreground/85"}>
          {story.storyText}
        </p>
        <div className="flex items-center justify-between text-sm text-slateWarm">
          <span>{story.isSeeded ? "Web-sourced story" : "Community contribution"}</span>
          <a href={story.sourceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            read original →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
