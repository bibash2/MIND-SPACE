import { SentimentResult } from "@/types";
import { getSentimentBgClass, getPolarityEmoji, polarityToPercent } from "@/lib/utils";

interface Props {
  sentiment: SentimentResult;
  compact?: boolean;
}

export default function SentimentBadge({ sentiment, compact = false }: Props) {
  const emoji = getPolarityEmoji(sentiment.polarity_score);
  const pct = polarityToPercent(sentiment.polarity_score);
  const badgeClass = getSentimentBgClass(sentiment.label);

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        <span>{emoji}</span>
        {sentiment.label}
      </span>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${badgeClass}`}>
          <span>{emoji}</span>
          {sentiment.label}
        </span>
        <span className="text-sm font-mono text-[--text-secondary]">
          {sentiment.polarity_score >= 0 ? "+" : ""}{sentiment.polarity_score.toFixed(3)}
        </span>
      </div>

      {/* Polarity bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[--text-muted]">
          <span>Very Negative</span>
          <span>Very Positive</span>
        </div>
        <div className="relative h-2 rounded-full bg-[rgba(8,14,26,0.9)] overflow-hidden border border-white/[0.05]">
          {/* Center marker */}
          <div className="absolute left-1/2 top-0 w-px h-full bg-[rgba(148,163,184,0.35)] z-10" />
          {/* Fill */}
          <div
            className="absolute top-0 h-full rounded-full transition-all duration-700"
            style={{
              left: sentiment.polarity_score >= 0 ? "50%" : `${pct}%`,
              width: `${Math.abs(sentiment.polarity_score) * 50}%`,
              background:
                sentiment.label === "Positive"
                  ? "linear-gradient(90deg, #4dd9ac, #72a072)"
                  : sentiment.label === "Negative"
                  ? "linear-gradient(90deg, #e87070, #c45555)"
                  : "linear-gradient(90deg, #6b7fa0, #8b9ab5)",
            }}
          />
        </div>
      </div>

      {/* Emotion breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Positive", value: sentiment.emotions.positive, color: "#4dd9ac" },
          { label: "Neutral", value: sentiment.emotions.neutral, color: "#8b9ab5" },
          { label: "Negative", value: sentiment.emotions.negative, color: "#e87070" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-lg p-2">
            <div className="text-sm font-semibold" style={{ color }}>
              {(value * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-[--text-muted]">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
