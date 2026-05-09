import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DomainDefinition } from "@/lib/domains";

export function DomainCard({
  domain,
  storyCount,
  rubricCount
}: {
  domain: DomainDefinition;
  storyCount: number;
  rubricCount: number;
}) {
  return (
    <Link href={`/topics/${domain.id}`} className="block">
      <Card className="story-grid-glow h-full overflow-hidden border-white/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-float">
        <CardHeader className="space-y-3 border-b border-border/70 bg-white/60">
          <p className="text-sm uppercase tracking-[0.25em] text-accent">{domain.shortLabel}</p>
          <CardTitle>{domain.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-7 text-slateWarm">{domain.subtitle}</p>
          <div className="flex items-center justify-between text-sm text-slateWarm">
            <span>{storyCount} stor{storyCount === 1 ? "y" : "ies"}</span>
            <span>{rubricCount > 0 ? "Learnings ready" : "Needs 5 stories"}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
