"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, BarChart2, PenSquare, LogOut, Brain } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Brain },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[rgba(5,8,14,0.72)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[rgba(5,8,14,0.55)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-400 to-[#4dd9ac] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-white">MindSpace</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "bg-[rgba(94,228,184,0.12)] text-white shadow-[0_0_20px_-4px_rgba(94,228,184,0.25)]"
                  : "text-[--text-secondary] hover:text-white hover:bg-[rgba(94,228,184,0.06)]"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/journal/new"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-sage-500 hover:bg-sage-400 text-white text-sm font-medium transition-colors"
          >
            <PenSquare size={14} />
            New Journal
          </Link>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(8,14,24,0.55)] border border-white/[0.06] backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sage-400 to-[#4dd9ac] flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="hidden sm:block text-sm text-[--text-secondary] max-w-[100px] truncate">
              {user?.name}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-[--text-muted] hover:text-[--accent-rose] hover:bg-[rgba(232,112,112,0.08)] transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-white/5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors",
              pathname === href
                ? "text-[--accent-teal]"
                : "text-[--text-muted]"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <Link
          href="/journal/new"
          className="flex-1 flex flex-col items-center gap-1 py-2 text-xs text-sage-400"
        >
          <PenSquare size={16} />
          New
        </Link>
      </div>
    </nav>
  );
}
