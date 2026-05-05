"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-xs tracking-tight transition-transform group-hover:scale-105">
              PG
            </div>
            <span className="font-heading font-semibold tracking-tight text-lg">PadelGo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/book" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Book Court
            </Link>
            <Link href="/admin/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Admin
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/book">
              <button className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold transition-all hover:bg-primary/90 active:scale-[0.98]">
                Book Now
              </button>
            </Link>
          </div>

          <button
            className="flex md:hidden items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="mx-auto max-w-[1280px] px-6 py-4 flex flex-col gap-1">
            <Link href="/" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/book" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              Book Court
            </Link>
            <Link href="/admin/login" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              Admin
            </Link>
            <div className="mt-3 pt-3 border-t border-border/50">
              <Link href="/book" onClick={() => setMobileOpen(false)}>
                <button className="w-full inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]">
                  Book Now
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}