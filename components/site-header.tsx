import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-2xl font-semibold text-foreground">
          Immigrant Voices
        </Link>
        <nav className="flex items-center gap-5 text-sm text-slateWarm">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/stories" className="transition-colors hover:text-foreground">
            Stories
          </Link>
          <Link href="/contribute" className="transition-colors hover:text-foreground">
            Contribute
          </Link>
        </nav>
      </div>
    </header>
  );
}
