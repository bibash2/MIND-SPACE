import Link from "next/link";
import { JournalEntry } from "@/types";
import { formatDate, getPolarityEmoji } from "@/lib/utils";
import SentimentBadge from "./SentimentBadge";
import { Clock, FileText } from "lucide-react";

interface Props {
  entry: JournalEntry;
  onDelete?: (id: string) => void;
}

export default function EntryCard({ entry, onDelete }: Props) {
  const preview = entry.content.slice(0, 160) + (entry.content.length > 160 ? "…" : "");

  return (
    <div className="glass glass-hover rounded-xl p-5 group transition-all duration-200 relative">
      {/* Sentiment accent line */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full"
        style={{
          background:
            entry.sentiment.label === "Positive"
              ? "#4dd9ac"
              : entry.sentiment.label === "Negative"
              ? "#e87070"
              : "#6b7fa0",
        }}
      />

      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link href={`/journal/${entry.id}`} className="flex-1 min-w-0">
            <h3 className="font-display text-base font-semibold text-[--text-primary] group-hover:text-white truncate transition-colors">
              {entry.title}
            </h3>
          </Link>
          <SentimentBadge sentiment={entry.sentiment} compact />
        </div>

        {/* Preview */}
        <Link href={`/journal/${entry.id}`}>
          <p className="text-sm text-[--text-secondary] leading-relaxed mb-4 line-clamp-2">
            {preview}
          </p>
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[--text-muted]">
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {formatDate(entry.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <FileText size={11} />
              {entry.word_count} words
            </span>
            {entry.mood_label && (
              <span className="px-2 py-0.5 rounded-full bg-[rgba(94,228,184,0.06)] text-[--text-muted] border border-[rgba(94,228,184,0.1)]">
                #{entry.mood_label}
              </span>
            )}
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(entry.id)}
              className="opacity-0 group-hover:opacity-100 text-xs text-[--text-muted] hover:text-[--accent-rose] transition-all px-2 py-1 rounded hover:bg-[rgba(232,112,112,0.08)]"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
