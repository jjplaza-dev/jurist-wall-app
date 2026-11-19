// 2008-style timestamps: "3 minutes ago", "about 2 hours ago", "November 18 at 3:15pm"
export function formatPostTime(iso: string, now: number): string {
  const then = new Date(iso);
  const seconds = Math.max(0, Math.floor((now - then.getTime()) / 1000));

  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "about an hour ago" : `about ${hours} hours ago`;

  const day = then.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  const time = then
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
  return `${day} at ${time}`;
}

export function formatFullTime(iso: string): string {
  return new Date(iso).toLocaleString();
}
