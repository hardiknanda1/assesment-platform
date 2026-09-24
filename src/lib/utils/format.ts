import { siteConfig } from "@/config/site";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: siteConfig.timeZone,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: siteConfig.timeZone,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatDate(value: Date | string | null | undefined, fallback = "—") {
  if (!value) return fallback;
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined, fallback = "—") {
  if (!value) return fallback;
  return dateTimeFormatter.format(new Date(value));
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatGrade(grade: string) {
  return `Class ${grade}`;
}

export function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
