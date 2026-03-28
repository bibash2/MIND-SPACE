"use client";

import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { TrendingUp, Calendar, BarChart2, Activity } from "lucide-react";
import {
  Chart, BarElement, BarController, DoughnutController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend,
} from "chart.js";
import { analyticsApi } from "@/lib/api";
import { AnalyticsSummary } from "@/types";
import AppLayout from "@/components/AppLayout";
import MoodChart from "@/components/MoodChart";
import StatCard from "@/components/StatCard";
import { getPolarityEmoji } from "@/lib/utils";

Chart.register(BarElement, BarController, DoughnutController, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const doughnutRef = useRef<HTMLCanvasElement>(null);
  const doughnutChart = useRef<Chart | null>(null);

  useEffect(() => {
    analyticsApi
      .summary()
      .then((res) => setSummary(res.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  // Doughnut chart for mood distribution
  useEffect(() => {
    if (!doughnutRef.current || !summary) return;
    if (doughnutChart.current) doughnutChart.current.destroy();

    const dist = summary.mood_distribution;
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    if (!total) return;

    doughnutChart.current = new Chart(doughnutRef.current, {
      type: "doughnut",
      data: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [{
          data: [dist.Positive ?? 0, dist.Neutral ?? 0, dist.Negative ?? 0],
          backgroundColor: ["rgba(77,217,172,0.8)", "rgba(139,154,181,0.8)", "rgba(232,112,112,0.8)"],
          borderColor: ["#4dd9ac", "#8b9ab5", "#e87070"],
          borderWidth: 1,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#8b9ab5", padding: 16, font: { size: 12, family: "DM Sans" }, boxWidth: 12 },
          },
          tooltip: {
            backgroundColor: "#162032",
            borderColor: "rgba(255,255,255,0.07)",
            borderWidth: 1,
            titleColor: "#e8edf5",
            bodyColor: "#8b9ab5",
            callbacks: {
              label: (ctx) => {
                const pct = total ? Math.round((ctx.parsed / total) * 100) : 0;
                return `  ${ctx.parsed} entries (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => doughnutChart.current?.destroy();
  }, [summary]);

  const data = view === "weekly" ? summary?.weekly_data ?? [] : summary?.monthly_data ?? [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-white">Analytics</h1>
          <p className="text-[--text-secondary] text-sm mt-1">Your emotional patterns over time</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Entries" value={summary?.total_entries ?? "—"} icon={<BarChart2 size={18} />} color="sage" delay={0} />
          <StatCard
            label="Avg Polarity"
            value={summary ? `${summary.avg_polarity >= 0 ? "+" : ""}${summary.avg_polarity.toFixed(3)}` : "—"}
            icon={<Activity size={18} />}
            sub={summary ? getPolarityEmoji(summary.avg_polarity) : ""}
            color="teal"
            delay={100}
          />
          <StatCard label="Dominant Mood" value={summary?.most_common_mood ?? "—"} icon={<TrendingUp size={18} />} color="amber" delay={200} />
          <StatCard label="Day Streak" value={summary?.streak_days ?? 0} icon={<Calendar size={18} />} sub="consecutive days" color="rose" delay={300} />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Line chart */}
          <div className="lg:col-span-2 glass rounded-xl p-6 border border-white/5 animate-fade-up delay-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-white">Mood Trend</h2>
              <div className="flex gap-1 p-1 glass rounded-lg border border-white/8">
                {(["weekly", "monthly"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                      view === v ? "bg-sage-500 text-white" : "text-[--text-muted] hover:text-white"
                    }`}
                  >
                    {v === "weekly" ? "7 Days" : "30 Days"}
                  </button>
                ))}
              </div>
            </div>
            <MoodChart data={data} />
            {summary && summary.total_entries > 0 && data.length === 0 && (
              <p className="text-xs text-[--text-muted] mt-3 text-center">
                No entries in this {view === "weekly" ? "7-day" : "30-day"} window. Try the other range, or add new journal entries.
              </p>
            )}
          </div>

          {/* Doughnut */}
          <div className="glass rounded-xl p-6 border border-white/5 animate-fade-up delay-300">
            <h2 className="font-display text-lg font-semibold text-white mb-5">Mood Breakdown</h2>
            {summary && summary.total_entries > 0 ? (
              <div className="h-52">
                <canvas ref={doughnutRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-52 text-[--text-muted] text-sm">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Detailed data table */}
        {data.length > 0 && (
          <div className="glass rounded-xl border border-white/5 overflow-hidden animate-fade-up delay-400">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="font-display text-base font-semibold text-white">
                Daily Breakdown — {view === "weekly" ? "Last 7 Days" : "Last 30 Days"}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[--text-muted] text-xs uppercase tracking-wide border-b border-white/5">
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Mood</th>
                    <th className="px-6 py-3 text-right">Polarity</th>
                    <th className="px-6 py-3 text-right">Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data].reverse().map((d, i) => (
                    <tr key={d.date} className={i % 2 === 0 ? "" : "bg-[rgba(94,228,184,0.03)]"}>
                      <td className="px-6 py-3 text-[--text-secondary] font-mono text-xs">{d.date}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          d.label === "Positive" ? "badge-positive" : d.label === "Negative" ? "badge-negative" : "badge-neutral"
                        }`}>
                          {getPolarityEmoji(d.polarity_score)} {d.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-xs" style={{
                        color: d.label === "Positive" ? "#4dd9ac" : d.label === "Negative" ? "#e87070" : "#8b9ab5"
                      }}>
                        {d.polarity_score >= 0 ? "+" : ""}{d.polarity_score.toFixed(3)}
                      </td>
                      <td className="px-6 py-3 text-right text-[--text-muted] font-mono text-xs">{d.entry_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
