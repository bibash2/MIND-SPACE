import { SentimentResult } from "@/types";

export function getSentimentColor(label: string): string {
  switch (label) {
    case "Positive": return "#4dd9ac";
    case "Negative": return "#e87070";
    default: return "#8b9ab5";
  }
}

export function getSentimentBgClass(label: string): string {
  switch (label) {
    case "Positive": return "badge-positive";
    case "Negative": return "badge-negative";
    default: return "badge-neutral";
  }
}

export function getPolarityLabel(score: number): string {
  if (score >= 0.5) return "Very Positive";
  if (score >= 0.05) return "Positive";
  if (score <= -0.5) return "Very Negative";
  if (score <= -0.05) return "Negative";
  return "Neutral";
}

export function getPolarityEmoji(score: number): string {
  if (score >= 0.5) return "😊";
  if (score >= 0.05) return "🙂";
  if (score <= -0.5) return "😢";
  if (score <= -0.05) return "😕";
  return "😐";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function polarityToPercent(score: number): number {
  // -1..+1 → 0..100
  return Math.round(((score + 1) / 2) * 100);
}
