"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Send, Sparkles, Hash } from "lucide-react";
import Link from "next/link";
import { journalApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import SentimentBadge from "@/components/SentimentBadge";
import { SentimentResult } from "@/types";

const MOOD_TAGS = ["gratitude", "anxiety", "calm", "excited", "stressed", "hopeful", "sad", "reflective", "motivated"];

export default function NewEntryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<SentimentResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content]);

  // Live sentiment preview (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (content.trim().length < 20) {
      setPreview(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        // Create a temp entry to get sentiment, then delete — 
        // OR better: call a lightweight endpoint. We'll just compute client-side
        // preview by creating and immediately deleting. Here we show a static mock
        // until saved. Real preview would call POST /api/journal/ then DELETE.
        // For UX, we'll show the result on save.
      } catch {}
    }, 800);
    return () => clearTimeout(debounceRef.current);
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setLoading(true);
    try {
      const res = await journalApi.create(title.trim(), content.trim(), moodTag || undefined);
      toast.success("Entry saved & analysed! ✨");
      router.push(`/journal/${res.data.id}`);
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

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

        <div className="animate-fade-up">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-sage-500/20 flex items-center justify-center">
              <Sparkles size={15} className="text-[--accent-teal]" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-white">New Journal</h1>
              <p className="text-xs text-[--text-muted]">AI will analyse your mood automatically</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="glass rounded-xl border border-white/[0.07] overflow-hidden bg-[rgba(6,10,18,0.4)] focus-within:border-[rgba(94,228,184,0.35)] focus-within:ring-1 focus-within:ring-[rgba(94,228,184,0.12)] transition-all">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Entry title…"
                className="w-full px-5 py-4 bg-transparent text-[--text-primary] font-display text-xl placeholder:text-[--text-muted] font-medium"
              />
            </div>

            {/* Content */}
            <div className="glass rounded-xl border border-white/[0.07] overflow-hidden bg-[rgba(6,10,18,0.4)] focus-within:border-[rgba(94,228,184,0.35)] focus-within:ring-1 focus-within:ring-[rgba(94,228,184,0.12)] transition-all">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="What's on your mind today? Write freely — the AI will analyse the emotional tone of your entry automatically…"
                className="w-full px-5 py-4 bg-transparent text-[--text-primary] placeholder:text-[--text-muted] text-sm leading-relaxed min-h-[240px]"
                rows={8}
              />
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                <span className="text-xs text-[--text-muted] font-mono">{wordCount} words</span>
                {wordCount > 0 && (
                  <span className="text-xs text-[--accent-teal] flex items-center gap-1">
                    <Sparkles size={10} />
                    AI will analyse on save
                  </span>
                )}
              </div>
            </div>

            {/* Mood tag */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[--text-secondary] uppercase tracking-wide mb-3">
                <Hash size={11} />
                Mood tag (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {MOOD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMoodTag(moodTag === tag ? "" : tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      moodTag === tag
                        ? "bg-sage-500/20 border-sage-500/50 text-sage-300"
                        : "glass border-white/8 text-[--text-muted] hover:text-white hover:border-white/20"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-sage-500 hover:bg-sage-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing with AI…
                </>
              ) : (
                <>
                  <Send size={15} />
                  Save & Analyse Entry
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
