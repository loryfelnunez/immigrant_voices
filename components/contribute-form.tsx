"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DOMAIN_DEFINITIONS, getDomainDefinition } from "@/lib/domains";
import { DOMAIN } from "@/lib/schemas";

const countryOptions = [
  "Prefer not to say",
  "Brazil",
  "Colombia",
  "India",
  "Mexico",
  "Nigeria",
  "Philippines",
  "Romania",
  "Ukraine",
  "Other"
];

export function ContributeForm({ initialDomain = DOMAIN }: { initialDomain?: string }) {
  const activeDomain = getDomainDefinition(initialDomain);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const arrivalValue = formData.get("arrivalYear");
    const country = formData.get("countryOfOrigin");

    const payload = {
      domain: String(formData.get("domain") || DOMAIN).trim(),
      contributorName: String(formData.get("contributorName") || "").trim(),
      countryOfOrigin:
        !country || country === "Prefer not to say" ? null : String(country),
      arrivalYear: arrivalValue ? Number(arrivalValue) : null,
      storyText: String(formData.get("storyText") || "").trim()
    };

    startTransition(async () => {
      const response = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Something went wrong while saving your story.");
        return;
      }

      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-accent">Thank you</p>
            <h2 className="font-serif text-4xl">Your story is now part of the learnings.</h2>
            <p className="text-lg leading-8 text-slateWarm">
              The next person who needs this will see what you learned.
            </p>
          </div>
          <Button asChild>
            <Link href={`/topics/${activeDomain.id}`}>Back to the learnings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl">
      <CardContent className="p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Topic</span>
              <select
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
                name="domain"
                defaultValue={activeDomain.id}
              >
                {DOMAIN_DEFINITIONS.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">First name or chosen handle</span>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
                name="contributorName"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Country of origin</span>
              <select
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
                name="countryOfOrigin"
                defaultValue="Prefer not to say"
              >
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Arrival year</span>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
                name="arrivalYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="Prefer not to say"
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Story</span>
            <textarea
              className="min-h-56 w-full rounded-[28px] border border-border bg-white px-5 py-4 outline-none transition focus:border-accent"
              name="storyText"
              placeholder={activeDomain.contributionPrompt}
              required
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button disabled={isPending} type="submit">
            {isPending ? "Adding your story..." : "Add my story to the learnings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
