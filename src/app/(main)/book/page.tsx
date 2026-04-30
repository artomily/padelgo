"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency, formatTime } from "@/lib/utils";
import type { Court, TimeSlot, AppSettings } from "@/types";

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [courts, setCourts] = useState<Court[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/courts");
      const data = await res.json();
      setCourts(data);
      const settingsRes = await fetch("/api/settings");
      setSettings(await settingsRes.json());
    }
    init();
  }, []);

  useEffect(() => {
    if (!date) return;
    async function fetchSlots() {
      setLoading(true);
      const dateStr = format(date!, "yyyy-MM-dd");
      const res = await fetch(`/api/slots?date=${dateStr}`);
      const data = await res.json();
      setSlots(data);
      setLoading(false);
    }
    fetchSlots();
  }, [date]);

  const availableSlots = slots.filter(
    (s) => s.available && (!selectedCourt || s.courtId === selectedCourt)
  );

  const selectedSlotData = slots.find(
    (s) =>
      s.time === selectedSlot &&
      s.courtId === (selectedCourt || slots.find((sl) => sl.time === selectedSlot)?.courtId)
  );

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (settings ? parseInt(settings.max_advance_days) : 30));

  async function handleSubmit() {
    if (!date || !selectedSlot || !selectedCourt) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: selectedCourt,
          date: format(date!, "yyyy-MM-dd"),
          startTime: selectedSlot,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          notes: formData.notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/book/${data.id}/confirmation`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Book a Court</h1>
        <p className="text-muted-foreground mt-1">
          Select your date, court, and time slot to make a booking.
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              step >= s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose the date you want to play</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal mb-4",
                !date && "text-muted-foreground"
              )}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
            {showCalendar && (
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setShowCalendar(false);
                  }
                }}
                disabled={(d) =>
                  d < new Date(new Date().setHours(0, 0, 0, 0)) || d > maxDate
                }
                initialFocus
              />
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!date}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Court & Time</CardTitle>
            <CardDescription>
              {date && `Available slots for ${format(date, "PPP")}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="mb-2 block">Court</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCourt === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCourt("")}
                >
                  All Courts
                </Button>
                {courts.map((court) => (
                  <Button
                    key={court.id}
                    variant={selectedCourt === court.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCourt(court.id);
                      setSelectedSlot("");
                    }}
                  >
                    {court.name} - {formatCurrency(court.price_per_hour)}/hr
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No available slots for this date. Please try another date.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={`${slot.courtId}-${slot.time}`}
                    onClick={() => {
                      setSelectedSlot(slot.time);
                      if (!selectedCourt) setSelectedCourt(slot.courtId);
                    }}
                    className={cn(
                      "flex flex-col items-center rounded-lg border p-3 transition-colors hover:bg-accent",
                      selectedSlot === slot.time && selectedCourt === slot.courtId
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <span className="text-sm font-medium">
                      {formatTime(slot.time)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(slot.endTime)}
                    </span>
                    {!selectedCourt && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {slot.courtName}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedSlot || !selectedCourt}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && selectedSlotData && (
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
            <CardDescription>Review your booking and enter your information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4 mb-6">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Court:</span>
                <span>{selectedSlotData.courtName}</span>
                <span className="text-muted-foreground">Date:</span>
                <span>{date && format(date, "PPP")}</span>
                <span className="text-muted-foreground">Time:</span>
                <span>
                  {formatTime(selectedSlotData.time)} - {formatTime(selectedSlotData.endTime)}
                </span>
                <span className="text-muted-foreground">Price:</span>
                <span className="font-semibold">{formatCurrency(selectedSlotData.price)}</span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !formData.customerName ||
                  !formData.customerEmail
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}