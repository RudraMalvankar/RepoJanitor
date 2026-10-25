import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RepoJanitor — The AI maintainer you never asked for",
  description: "Automated open-weight AI repository maintenance for Hacktoberfest Open-Source AI Challenge 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
