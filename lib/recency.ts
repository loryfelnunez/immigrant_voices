const MONTH_MS = 1000 * 60 * 60 * 24 * 30;

export function getRecencyBadge(lastValidatedAt: string) {
  const ageMs = Date.now() - new Date(lastValidatedAt).getTime();
  const months = Math.max(1, Math.round(ageMs / MONTH_MS));

  if (months < 3) {
    return {
      label: "Recently validated",
      className: "bg-green-100 text-green-900 border-green-200"
    };
  }

  if (months <= 12) {
    return {
      label: `Validated ${months} month${months === 1 ? "" : "s"} ago`,
      className: "bg-amber-100 text-amber-900 border-amber-200"
    };
  }

  return {
    label: "Last validated over a year ago",
    className: "bg-stone-200 text-stone-800 border-stone-300"
  };
}
