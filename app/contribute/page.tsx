import { ContributeForm } from "@/components/contribute-form";

export default function ContributePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="max-w-3xl space-y-5">
        <p className="text-sm uppercase tracking-[0.35em] text-accent">Contribute</p>
        <h1 className="font-serif text-5xl leading-tight">Share what you wish someone had told you.</h1>
        <p className="text-lg leading-8 text-slateWarm">
          Right after you got your first card, what would you tell yourself six months ago? That&apos;s the most useful thing you can give the next person who lands here.
        </p>
      </div>

      <div className="mt-10">
        <ContributeForm />
      </div>
    </div>
  );
}
