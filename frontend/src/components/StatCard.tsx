import { ReactNode } from "react";
import clsx from "clsx";

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  sub?: string;
  color?: "teal" | "sage" | "amber" | "rose" | "default";
  delay?: number;
}

const COLOR_MAP = {
  teal: { icon: "text-[#4dd9ac]", bg: "bg-[rgba(77,217,172,0.08)]" },
  sage: { icon: "text-[#72a072]", bg: "bg-[rgba(114,160,114,0.08)]" },
  amber: { icon: "text-[#f5a623]", bg: "bg-[rgba(245,166,35,0.08)]" },
  rose: { icon: "text-[#e87070]", bg: "bg-[rgba(232,112,112,0.08)]" },
  default: { icon: "text-[--text-secondary]", bg: "bg-[rgba(94,228,184,0.06)]" },
};

export default function StatCard({ label, value, icon, sub, color = "default", delay = 0 }: Props) {
  const colors = COLOR_MAP[color];
  return (
    <div
      className="glass rounded-xl p-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={clsx("p-2 rounded-lg", colors.bg)}>
          <span className={clsx("block", colors.icon)}>{icon}</span>
        </div>
      </div>
      <div className="font-display text-2xl font-semibold text-[--text-primary] mb-0.5">
        {value}
      </div>
      <div className="text-sm text-[--text-secondary]">{label}</div>
      {sub && <div className="text-xs text-[--text-muted] mt-1">{sub}</div>}
    </div>
  );
}
