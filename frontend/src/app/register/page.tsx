"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Brain, Eye, EyeOff, UserPlus } from "lucide-react";
import { authApi } from "@/lib/api";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      login(res.data.access_token, res.data.user);
      toast.success("Account created! Welcome to MindSpace 🌿");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-400 to-[#4dd9ac] flex items-center justify-center mb-4 animate-float">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-white">Create your space</h1>
          <p className="text-[--text-secondary] text-sm mt-2">Start your mental wellness journey</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[--text-secondary] uppercase tracking-wide mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-[rgba(8,14,24,0.85)] border border-white/[0.07] text-[--text-primary] placeholder:text-[--text-muted] text-sm focus:border-[rgba(94,228,184,0.35)] focus:bg-[rgba(10,18,32,0.95)] focus:ring-1 focus:ring-[rgba(94,228,184,0.15)] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[--text-secondary] uppercase tracking-wide mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[rgba(8,14,24,0.85)] border border-white/[0.07] text-[--text-primary] placeholder:text-[--text-muted] text-sm focus:border-[rgba(94,228,184,0.35)] focus:bg-[rgba(10,18,32,0.95)] focus:ring-1 focus:ring-[rgba(94,228,184,0.15)] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[--text-secondary] uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-[rgba(8,14,24,0.85)] border border-white/[0.07] text-[--text-primary] placeholder:text-[--text-muted] text-sm focus:border-[rgba(94,228,184,0.35)] focus:bg-[rgba(10,18,32,0.95)] focus:ring-1 focus:ring-[rgba(94,228,184,0.15)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-secondary] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sage-500 hover:bg-sage-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Create account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[--text-muted] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[--accent-teal] hover:text-sage-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
