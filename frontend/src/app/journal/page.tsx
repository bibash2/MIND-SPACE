"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { PenSquare, Search, BookOpen } from "lucide-react";
import { journalApi } from "@/lib/api";
import { JournalEntry } from "@/types";
import AppLayout from "@/components/AppLayout";
import EntryCard from "@/components/EntryCard";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const load = async (pageNum = 0) => {
    try {
      const res = await journalApi.list(pageNum * LIMIT, LIMIT);
      if (pageNum === 0) setEntries(res.data);
      else setEntries((prev) => [...prev, ...res.data]);
      setHasMore(res.data.length === LIMIT);
    } catch {
      toast.error("Failed to load entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await journalApi.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-display text-3xl font-semibold text-white">My Journal</h1>
            <p className="text-[--text-secondary] text-sm mt-1">{entries.length} entries</p>
          </div>
          <Link
            href="/journal/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-500 hover:bg-sage-400 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <PenSquare size={15} />
            New Journal
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[--text-muted]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(8,14,24,0.55)] border border-white/[0.07] backdrop-blur-md text-[--text-primary] placeholder:text-[--text-muted] text-sm focus:border-[rgba(94,228,184,0.35)] focus:ring-1 focus:ring-[rgba(94,228,184,0.12)] transition-all"
          />
        </div>

        {/* Entries */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-xl p-16 text-center border border-white/5">
            <BookOpen size={40} className="mx-auto text-[--text-muted] mb-4" />
            <p className="text-[--text-secondary] mb-2">
              {search ? "No entries match your search" : "No entries yet"}
            </p>
            {!search && (
              <Link
                href="/journal/new"
                className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-sage-500 hover:bg-sage-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <PenSquare size={14} />
                Write your first entry
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry, i) => (
              <div
                key={entry.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              >
                <EntryCard entry={entry} onDelete={handleDelete} />
              </div>
            ))}
            {hasMore && !search && (
              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  load(next);
                }}
                className="w-full py-3 text-sm text-[--text-secondary] hover:text-white glass rounded-xl border border-white/5 transition-colors"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
