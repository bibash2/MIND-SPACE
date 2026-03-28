import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "MindSpace — AI Mental Health Journal",
  description: "Track your emotions, discover patterns, and understand yourself better with AI-powered journaling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden bg-[#030508] text-[--text-primary]">
        <div className="pointer-events-none fixed inset-0 z-0 app-atmosphere" aria-hidden />
        <div className="pointer-events-none fixed inset-0 z-0 app-noise" aria-hidden />
        <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-[#030508]/90" aria-hidden />
        <div className="relative z-10 min-h-screen">{children}</div>
        <Toaster
          position="bottom-right"
          containerStyle={{ zIndex: 9999 }}
          toastOptions={{
            style: {
              background: "linear-gradient(145deg, rgba(18,28,44,0.95), rgba(12,20,34,0.92))",
              color: "var(--text-primary)",
              border: "1px solid rgba(94,228,184,0.12)",
              boxShadow: "0 12px 40px -8px rgba(0,0,0,0.5)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
