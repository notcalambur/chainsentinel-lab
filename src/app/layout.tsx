import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "ChainSentinel Lab",
  description:
    "Personal, read-only Ethereum investigation workspace. MVP.",
  metadataBase: undefined,
};

const NAV = [
  { href: "/", label: "Investigate" },
  { href: "/saved", label: "Saved cases" },
  { href: "/learn", label: "Learning" },
  { href: "/about", label: "About" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-canvas text-text-primary">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="min-h-screen flex">
          <nav
            aria-label="Primary"
            className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-border bg-surface"
          >
            <div className="px-5 py-5 border-b border-border">
              <p className="font-display text-sm tracking-wider text-text-secondary uppercase">
                ChainSentinel
              </p>
              <p className="font-display text-xl text-text-primary">Lab</p>
            </div>
            <ul className="flex flex-col p-2 gap-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="block px-3 py-2 rounded-md text-sm hover:bg-surface-raised focus-visible:bg-surface-raised"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto p-4 text-xs text-text-secondary border-t border-border">
              <p>Read-only MVP.</p>
              <p className="mono">v0.1.0</p>
            </div>
          </nav>

          <div className="flex-1 flex flex-col min-w-0">
            <header className="md:hidden border-b border-border bg-surface px-4 py-3 flex items-center justify-between">
              <span className="font-display text-lg">ChainSentinel Lab</span>
              <nav aria-label="Mobile" className="flex gap-3 text-sm">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href} className="text-text-secondary hover:text-text-primary">
                    {n.label}
                  </Link>
                ))}
              </nav>
            </header>
            <main id="main" className="flex-1 px-4 md:px-8 py-6 md:py-10 max-w-6xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}