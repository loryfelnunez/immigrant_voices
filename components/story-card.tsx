import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDomainDefinition } from "@/lib/domains";
import type { Story } from "@/lib/schemas";

export function StoryCard({ story, compact = false }: { story: Story; compact?: boolean }) {
  const domain = getDomainDefinition(story.domain);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">{domain.label}</p>
        <CardTitle className="text-xl">{story.contributorName}</CardTitle>
        <p className="text-sm text-slateWarm">
          {story.countryOfOrigin ?? "Country unknown"} · {story.arrivalYear ?? "Year unknown"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={compact ? "line-clamp-4 text-sm leading-7 text-foreground/85" : "text-sm leading-7 text-foreground/85"}>
          {story.storyText}
        </p>
        {story.mentionedOrganizations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {story.mentionedOrganizations.slice(0, 4).map((item) => (
              <span key={item} className="rounded-full bg-accentSoft px-3 py-1 text-xs text-foreground/80">
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {story.productsOrServices.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-slateWarm">Products or services</p>
            <div className="flex flex-wrap gap-2">
              {story.productsOrServices.slice(0, 4).map((item) => (
                <span key={item} className="rounded-full bg-white px-3 py-1 text-xs text-foreground/80 border border-border">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {story.documentsMentioned.length > 0 || story.feesOrAmounts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {story.documentsMentioned.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-slateWarm">Documents</p>
                <ul className="space-y-1 text-sm leading-6 text-slateWarm">
                  {story.documentsMentioned.slice(0, 3).map((detail) => (
                    <li key={detail}>• {detail}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {story.feesOrAmounts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-slateWarm">Fees or amounts</p>
                <ul className="space-y-1 text-sm leading-6 text-slateWarm">
                  {story.feesOrAmounts.slice(0, 3).map((detail) => (
                    <li key={detail}>• {detail}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
        {story.keyDetails.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-slateWarm">Useful details</p>
            <ul className="space-y-1 text-sm leading-6 text-slateWarm">
              {story.keyDetails.slice(0, 3).map((detail) => (
                <li key={detail}>• {detail}</li>
              ))}
            </ul>
          </div>
        ) : null}
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
