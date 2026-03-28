"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Edit2, Trash2, Clock, FileText, Hash } from "lucide-react";
import { journalApi } from "@/lib/api";
import { JournalEntry } from "@/types";
import AppLayout from "@/components/AppLayout";
import SentimentBadge from "@/components/SentimentBadge";
import { formatDate } from "@/lib/utils";

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    journalApi
      .get(id)
      .then((res) => {
        setEntry(res.data);
        setEditTitle(res.data.title);
        setEditContent(res.data.content);
      })
      .catch(() => {
        toast.error("Entry not found");
        router.push("/journal");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      const res = await journalApi.update(id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setEntry(res.data);
      setEditing(false);
      toast.success("Entry updated & re-analysed ✨");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry permanently?")) return;
    try {
      await journalApi.delete(id);
      toast.success("Entry deleted");
      router.push("/journal");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!entry) return null;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Back */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm text-[--text-muted] hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to journal
        </Link>

        <div className="space-y-6 animate-fade-up">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full font-display text-2xl font-semibold bg-transparent text-white border-b border-sage-500/40 pb-1 focus:border-sage-400 transition-colors"
                />
              ) : (
                <h1 className="font-display text-3xl font-semibold text-white leading-tight">
                  {entry.title}
                </h1>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-[--text-muted]">
                <span className="flex items-center gap-1.5">
                  <Clock size={11} />
                  {formatDate(entry.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText size={11} />
                  {entry.word_count} words
                </span>
                {entry.mood_label && (
                  <span className="flex items-center gap-1">
                    <Hash size={11} />
                    {entry.mood_label}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 text-sm text-[--text-muted] hover:text-white glass rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1.5 text-sm bg-sage-500 hover:bg-sage-400 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 text-[--text-muted] hover:text-white glass rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-[--text-muted] hover:text-[--accent-rose] glass rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="glass rounded-xl p-6 border border-white/5">
            {editing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent text-[--text-primary] text-sm leading-relaxed min-h-[200px]"
                rows={10}
              />
            ) : (
              <p className="text-[--text-secondary] text-sm leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            )}
          </div>

          {/* Sentiment Analysis */}
          <div className="glass rounded-xl p-6 border border-white/5">
            <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-sage-500/20 flex items-center justify-center text-xs">✦</span>
              AI Sentiment Analysis
            </h2>
            <SentimentBadge sentiment={entry.sentiment} />
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 text-xs text-[--text-muted]">
              <span>Confidence: <span className="text-[--text-secondary] font-mono">{(entry.sentiment.confidence * 100).toFixed(0)}%</span></span>
              <span>VADER: <span className="text-[--text-secondary] font-mono">{entry.sentiment.vader_compound >= 0 ? "+" : ""}{entry.sentiment.vader_compound.toFixed(3)}</span></span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
