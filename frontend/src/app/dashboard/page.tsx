"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, BookOpen, TrendingUp, Flame, PenSquare, Sparkles } from "lucide-react";
import { journalApi, analyticsApi } from "@/lib/api";
import { JournalEntry, AnalyticsSummary } from "@/types";
import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import EntryCard from "@/components/EntryCard";
import MoodChart from "@/components/MoodChart";
import { useAuth } from "@/hooks/useAuth";
import { getPolarityEmoji } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      journalApi.list(0, 5),
      analyticsApi.summary(),
    ])
      .then(([entriesRes, summaryRes]) => {
        setEntries(entriesRes.data);
        setSummary(summaryRes.data);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const avgEmoji = summary ? getPolarityEmoji(summary.avg_polarity) : "😐";

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-10 animate-fade-up">
          <p className="text-sm text-[--text-muted] mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-4xl font-semibold text-white">
            Good {getTimeOfDay()},{" "}
            <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-[--text-secondary] mt-2">
            {summary?.total_entries === 0
              ? "Start your first journal entry to see your insights."
              : `You've written ${summary?.total_entries} entries. Your average mood is ${avgEmoji}.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Entries"
            value={summary?.total_entries ?? "—"}
            icon={<BookOpen size={18} />}
            color="sage"
            delay={0}
          />
          <StatCard
            label="Avg Mood Score"
            value={summary ? `${summary.avg_polarity >= 0 ? "+" : ""}${summary.avg_polarity.toFixed(2)}` : "—"}
            icon={<Brain size={18} />}
            sub={summary?.most_common_mood ?? ""}
            color="teal"
            delay={100}
          />
          <StatCard
            label="Day Streak"
            value={summary?.streak_days ?? 0}
            icon={<Flame size={18} />}
            sub="consecutive days"
            color="amber"
            delay={200}
          />
          <StatCard
            label="Dominant Mood"
            value={summary?.most_common_mood ?? "—"}
            icon={<Sparkles size={18} />}
            color="default"
            delay={300}
          />
        </div>

        {/* Chart + Recent Entries */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          {/* Chart */}
          <div className="lg:col-span-3 glass rounded-xl p-6 border border-white/5 animate-fade-up delay-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-white">Mood This Week</h2>
              <Link href="/analytics" className="text-xs text-[--accent-teal] hover:text-sage-300 transition-colors flex items-center gap-1">
                <TrendingUp size={12} /> Full analytics
              </Link>
            </div>
            <MoodChart data={summary?.weekly_data ?? []} />
          </div>

          {/* Mood distribution */}
          <div className="lg:col-span-2 glass rounded-xl p-6 border border-white/5 animate-fade-up delay-300">
            <h2 className="font-display text-lg font-semibold text-white mb-5">Mood Distribution</h2>
            {summary && summary.total_entries > 0 ? (
              <div className="space-y-4">
                {[
                  { label: "Positive", color: "#4dd9ac", key: "Positive" },
                  { label: "Neutral", color: "#8b9ab5", key: "Neutral" },
                  { label: "Negative", color: "#e87070", key: "Negative" },
                ].map(({ label, color, key }) => {
                  const count = summary.mood_distribution[key] ?? 0;
                  const pct = summary.total_entries ? Math.round((count / summary.total_entries) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span style={{ color }}>{label}</span>
                        <span className="text-[--text-muted] font-mono text-xs">{count} ({pct}%)</span>
                      </div>
                      <div className="mood-track">
                        <div
                          className="mood-fill"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-[--text-muted]">
                <p className="text-sm">No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent entries */}
        <div className="animate-fade-up delay-400">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-white">Recent Entries</h2>
            <Link href="/journal" className="text-sm text-[--text-secondary] hover:text-white transition-colors">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-xl h-28 animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center border border-white/5">
              <Brain size={40} className="mx-auto text-[--text-muted] mb-4" />
              <p className="text-[--text-secondary] mb-4">Your journal is empty</p>
              <Link
                href="/journal/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-500 hover:bg-sage-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <PenSquare size={14} />
                Write your first entry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
              {entries.length >= 5 && (
                <Link
                  href="/journal"
                  className="block text-center py-3 text-sm text-[--text-secondary] hover:text-white glass rounded-xl border border-white/5 transition-colors"
                >
                  View all entries →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
