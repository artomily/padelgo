"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Calendar, Download } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { BookingWithCourt } from "@/types";

const statusConfig = {
  pending: { icon: Clock, label: "Menunggu Konfirmasi", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  confirmed: { icon: CheckCircle2, label: "Dikonfirmasi", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  cancelled: { icon: XCircle, label: "Dibatalkan", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
};

export default function BookingStatusPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithCourt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        setBooking(await res.json());
      } catch {
        router.push("/book");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [params.id, router]);

  function generateICS() {
    if (!booking) return;
    const start = booking.startTime.replace(":", "");
    const end = String(parseInt(booking.startTime.split(":")[0]) + 1).padStart(2, "0") + "0000";
    const date = booking.date.replace(/-/g, "");
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${date}T${start}00
DTEND:${date}T${end}00
SUMMARY:PadelGo - ${booking.court.name}
DESCRIPTION:Booking ${booking.bookingCode}
LOCATION:PadelGo
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `padelgo-${booking.bookingCode}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-16 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-muted mx-auto" />
          <div className="h-6 w-48 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-16 text-center">
        <p className="text-muted-foreground mb-4">Booking not found.</p>
        <Link href="/book"><button className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]">Book a Court</button></Link>
      </div>
    );
  }

  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-12 md:py-16">
      <Link href="/book" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Booking
      </Link>

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className={cn("inline-flex h-16 w-16 items-center justify-center rounded-2xl", status.bg, status.border, "border")}>
            <StatusIcon className={cn("h-8 w-8", status.color)} />
          </div>
          <h1 className="text-2xl font-heading font-bold tracking-tight mt-4">Booking {status.label}</h1>
        </div>

        <div className="rounded-2xl bg-card border border-border/50 p-6 mb-6">
          <div className="space-y-3 text-sm">
            {[
              ["Booking Code", <span key="code" className="font-mono font-semibold text-primary">{booking.bookingCode}</span>],
              ["Court", booking.court.name],
              ["Date", formatDate(new Date(booking.date + "T00:00:00"))],
              ["Time", `${booking.startTime} - ${String(parseInt(booking.startTime.split(":")[0]) + booking.durationHours).padStart(2, "0")}:00`],
              ["Duration", `${booking.durationHours}h`],
              ["Name", booking.customerName],
              ["Phone", booking.customerPhone],
              ["Email", booking.customerEmail],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                {value}
              </div>
            ))}
            <div className="border-t border-border/50 pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-heading font-bold text-primary">{formatCurrency(booking.totalPrice)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={generateICS}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border/50 bg-transparent px-6 py-2.5 text-sm font-semibold transition-all hover:bg-muted active:scale-[0.98]"
        >
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </button>
      </div>
    </div>
  );
}