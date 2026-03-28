"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, ArrowRight, Shield, BarChart2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-400 to-[#4dd9ac] flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-white">MindSpace</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-[--text-secondary] hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="px-4 py-2 bg-sage-500 hover:bg-sage-400 text-white rounded-lg text-sm font-medium transition-colors">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto w-full py-20">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-[--accent-teal] border border-[rgba(77,217,172,0.2)] mb-8">
            <Sparkles size={14} />
            AI-Powered Mental Health Tracking
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-white mb-6 leading-tight">
            Your mind deserves<br />
            <span className="gradient-text">to be understood</span>
          </h1>
          <p className="text-lg text-[--text-secondary] mb-10 max-w-xl mx-auto leading-relaxed">
            Journal your thoughts, and let AI uncover the emotional patterns you can't see. Real-time sentiment analysis, mood tracking, and actionable insights.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-500 hover:bg-sage-400 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-sage-500/20"
            >
              Start journaling free
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="px-6 py-3 glass rounded-xl text-[--text-secondary] hover:text-white border border-white/10 transition-all text-sm">
              Already have an account
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mt-24 w-full animate-fade-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          {[
            { icon: Brain, title: "AI Sentiment Analysis", desc: "NLP-powered Naïve Bayes + VADER hybrid engine analyses every entry automatically", color: "#4dd9ac" },
            { icon: BarChart2, title: "Mood Visualisations", desc: "Interactive charts showing your emotional trends over weekly and monthly periods", color: "#72a072" },
            { icon: Shield, title: "Privacy First", desc: "JWT authentication and encrypted storage. Your thoughts are yours alone.", color: "#f5a623" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass rounded-xl p-6 text-left border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-display text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-[--text-secondary] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[--text-muted] border-t border-white/5">
        MindSpace · MS Software Engineering Project · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
