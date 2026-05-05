import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-xs">
              PG
            </div>
            <span className="font-heading font-semibold tracking-tight">PadelGo</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/book" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Book Court
            </Link>
            <Link href="/admin/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Admin
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PadelGo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}