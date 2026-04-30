"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatTime } from "@/lib/utils";
import type { BookingWithCourt, AppSettings } from "@/types";

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithCourt | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingRes, settingsRes] = await Promise.all([
          fetch(`/api/bookings/${params.id}`),
          fetch("/api/settings"),
        ]);
        const bookingData = await bookingRes.json();
        const settingsData = await settingsRes.json();
        setBooking(bookingData);
        setSettings(settingsData);
      } catch {
        router.push("/book");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id, router]);

  function copyBookingId() {
    if (booking) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Booking not found.</p>
        <Link href="/book">
          <Button className="mt-4">Book a Court</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold">Booking Created!</h1>
        <p className="text-muted-foreground mt-1">
          Your booking is pending payment verification.
        </p>
        <Badge variant="secondary" className="mt-2">
          Pending
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-muted-foreground">Booking ID:</span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-xs">{booking.id.slice(0, 8)}...</span>
              <button onClick={copyBookingId} className="text-primary">
                <Copy className="h-3 w-3" />
              </button>
              {copied && <span className="text-xs text-green-600">Copied!</span>}
            </span>
            <span className="text-muted-foreground">Court:</span>
            <span className="font-medium">{booking.court.name}</span>
            <span className="text-muted-foreground">Date:</span>
            <span>{new Date(booking.booking_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="text-muted-foreground">Time:</span>
            <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
            <span className="text-muted-foreground">Name:</span>
            <span>{booking.customer_name}</span>
            <span className="text-muted-foreground">Email:</span>
            <span>{booking.customer_email}</span>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatCurrency(booking.total_price)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Payment Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-900">
          <ol className="list-decimal list-inside space-y-2">
            <li>Scan the QRIS code below or transfer to the provided account</li>
            <li>Pay the exact amount: <strong>{formatCurrency(booking.total_price)}</strong></li>
            <li>Include your booking ID <strong>({booking.id.slice(0, 8)})</strong> in the payment reference if possible</li>
            <li>Wait for admin to verify your payment</li>
            <li>You will receive a confirmation email once verified</li>
          </ol>

          {settings?.qris_image_url && (
            <div className="mt-6 flex justify-center">
              <img
                src={settings.qris_image_url}
                alt="QRIS Code"
                className="max-w-[250px] rounded-lg border"
              />
            </div>
          )}

          {settings?.qris_account_name && (
            <div className="mt-4 p-3 bg-white rounded-lg text-sm">
              <p><strong>Account Name:</strong> {settings.qris_account_name}</p>
              {settings.qris_bank_name && <p><strong>Bank:</strong> {settings.qris_bank_name}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/booking/${booking.id}`}>
          <Button variant="outline" className="w-full sm:w-auto">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Booking
          </Button>
        </Link>
        <Link href="/book">
          <Button className="w-full sm:w-auto">Book Another Court</Button>
        </Link>
      </div>
    </div>
  );
}