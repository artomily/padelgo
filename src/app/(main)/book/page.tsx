"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, ArrowRight, Loader2, Check, Copy, MapPin, Clock, User, Mail, Phone, FileText } from "lucide-react";
import { cn, formatCurrency, formatDate, formatDateISO, getDayName, getDayNumber } from "@/lib/utils";
import type { Court, TimeSlot, BookingWithCourt } from "@/types";

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState(1);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingWithCourt | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  });

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/courts");
      const data = await res.json();
      setCourts(data);
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    async function fetchSlots() {
      setLoading(true);
      const res = await fetch(`/api/slots?date=${selectedDate}${selectedCourt ? `&courtId=${selectedCourt}` : ""}`);
      const data = await res.json();
      setSlots(data);
      setLoading(false);
    }
    fetchSlots();
  }, [selectedDate, selectedCourt]);

  const availableSlots = slots.filter((s) => s.available);
  const bookedSlots = slots.filter((s) => !s.available);

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const selectedCourtData = courts.find((c) => c.id === selectedCourt);

  async function handleSubmit() {
    if (!selectedCourt || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: selectedCourt,
          date: selectedDate,
          startTime: selectedTime,
          durationHours: duration,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingResult(data);
        setStep(3);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function copyBookingCode() {
    if (bookingResult) {
      navigator.clipboard.writeText(bookingResult.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (step === 3 && bookingResult) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-12 md:py-16">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Booking Berhasil!</h1>
            <p className="text-muted-foreground mt-2">Menunggu verifikasi pembayaran.</p>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6 mb-6">
            <div className="space-y-3 text-sm">
              {[
                ["Booking Code", (
                  <span key="code" className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-primary">{bookingResult.bookingCode}</span>
                    <button onClick={copyBookingCode} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {copied && <span className="text-xs text-primary ml-1">Copied!</span>}
                  </span>
                )],
                ["Court", bookingResult.court.name],
                ["Date", formatDate(new Date(bookingResult.date + "T00:00:00"))],
                ["Time", `${bookingResult.startTime} - ${String(parseInt(bookingResult.startTime.split(":")[0]) + duration).padStart(2, "0")}:00`],
                ["Name", bookingResult.customerName],
                ["Email", bookingResult.customerEmail],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  {value}
                </div>
              ))}
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-heading font-bold text-primary">{formatCurrency(bookingResult.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6 mb-6">
            <h3 className="font-heading font-semibold mb-3">Payment Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Scan QRIS code or transfer to the account below</li>
              <li>Pay: <strong className="text-foreground">{formatCurrency(bookingResult.totalPrice)}</strong></li>
              <li>Include booking code: <strong className="text-foreground">{bookingResult.bookingCode}</strong></li>
              <li>Wait for admin verification</li>
              <li>You'll receive email confirmation</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push(`/booking/${bookingResult.id}`)} className="flex-1 inline-flex items-center justify-center rounded-full border border-border/50 bg-transparent px-6 py-2.5 text-sm font-semibold transition-all hover:bg-muted active:scale-[0.98]">
              View Booking
            </button>
            <button onClick={() => { setStep(1); setBookingResult(null); setSelectedCourt(""); setSelectedTime(""); }} className="flex-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold transition-all hover:bg-primary/90 active:scale-[0.98]">
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-12 md:py-16">
      <div className="mb-8">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.push("/")} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {step === 1 ? "Back to Home" : "Back"}
        </button>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
          {step === 1 ? "Book a Court" : "Your Details"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {step === 1 ? "Select your court, date, and time." : "Fill in your information to confirm booking."}
        </p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date Strip */}
            <div>
              <h2 className="font-heading font-semibold mb-4">Select Date</h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {next7Days.map((day, i) => {
                  const dateStr = formatDateISO(day);
                  const isActive = selectedDate === dateStr;
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}
                      className={cn(
                        "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl border transition-all",
                        isActive
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border/50 text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      <span className="text-xs font-medium">{getDayName(day)}</span>
                      <span className="text-xl font-heading font-bold">{getDayNumber(day)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h2 className="font-heading font-semibold mb-4">Duration</h2>
              <div className="flex gap-2">
                {[1, 1.5, 2].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-medium transition-all",
                      duration === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border/50 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {d}h
                  </button>
                ))}
              </div>
            </div>

            {/* Court Selection */}
            <div>
              <h2 className="font-heading font-semibold mb-4">Select Court</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => { setSelectedCourt(court.id); setSelectedTime(""); }}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all",
                      selectedCourt === court.id
                        ? "bg-primary/10 border-primary/50"
                        : "bg-card border-border/50 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-semibold">{court.name}</h3>
                      <span className={cn("text-sm font-semibold", selectedCourt === court.id ? "text-primary" : "text-muted-foreground")}>
                        {formatCurrency(court.pricePerHour)}/hr
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{court.type}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h2 className="font-heading font-semibold mb-4">Available Time</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={`${slot.courtId}-${slot.time}`}
                      onClick={() => {
                        if (!slot.available) return;
                        setSelectedTime(slot.time);
                        if (!selectedCourt) setSelectedCourt(slot.courtId);
                      }}
                      disabled={!slot.available}
                      className={cn(
                        "py-2.5 rounded-xl text-sm font-medium transition-all",
                        slot.available
                          ? selectedTime === slot.time && selectedCourt === slot.courtId
                            ? "bg-primary/10 border border-primary/50 text-primary"
                            : "bg-card border border-border/50 text-muted-foreground hover:border-primary/30"
                          : "opacity-25 line-through cursor-not-allowed text-muted-foreground"
                      )}
                    >
                      {slot.time}
                      {!slot.available && selectedCourt === slot.courtId && (
                        <span className="block text-[10px]">Booked</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-card border border-border/50 p-6">
              <h3 className="font-heading font-semibold mb-4">Booking Summary</h3>
              {selectedCourtData ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Court</span>
                    <span className="font-medium">{selectedCourtData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{selectedDate ? formatDate(new Date(selectedDate + "T00:00:00")) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedTime || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{duration}h</span>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-heading font-bold text-primary">
                      {selectedTime ? formatCurrency(selectedCourtData.pricePerHour * duration) : "-"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a court to see details.</p>
              )}
              <button
                onClick={() => selectedCourt && selectedDate && selectedTime ? setStep(2) : null}
                disabled={!selectedCourt || !selectedDate || !selectedTime}
                className={cn(
                  "w-full mt-6 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
                  selectedCourt && selectedDate && selectedTime
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Lanjut ke Data Diri
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-card border border-border/50 p-6">
              <h2 className="font-heading font-semibold mb-6">Your Information</h2>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full h-11 rounded-xl bg-background border border-border/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <input
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="+62 812-3456-7890"
                      className="w-full h-11 rounded-xl bg-background border border-border/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full h-11 rounded-xl bg-background border border-border/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="inline-flex items-center justify-center rounded-full border border-border/50 bg-transparent px-6 py-2.5 text-sm font-semibold transition-all hover:bg-muted active:scale-[0.98]">
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.customerName || !formData.customerPhone || !formData.customerEmail}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
                    formData.customerName && formData.customerPhone && formData.customerEmail
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-card border border-border/50 p-6">
              <h3 className="font-heading font-semibold mb-4">Booking Summary</h3>
              {selectedCourtData && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Court</span>
                    <span className="font-medium">{selectedCourtData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(new Date(selectedDate + "T00:00:00"))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{duration}h</span>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-heading font-bold text-primary">{formatCurrency(selectedCourtData.pricePerHour * duration)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}