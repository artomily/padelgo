"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatTime } from "@/lib/utils";
import type { BookingWithCourt } from "@/types";

const statusConfig = {
  pending: { icon: Clock, label: "Pending", variant: "secondary" as const, color: "text-yellow-600", bg: "bg-yellow-100" },
  confirmed: { icon: CheckCircle2, label: "Confirmed", variant: "default" as const, color: "text-green-600", bg: "bg-green-100" },
  cancelled: { icon: XCircle, label: "Cancelled", variant: "destructive" as const, color: "text-red-600", bg: "bg-red-100" },
};

export default function BookingViewPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithCourt | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setBooking(data);
      } catch {
        router.push("/book");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [params.id, router]);

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        const updated = await res.json();
        setBooking(updated);
      } else {
        const data = await res.json();
        alert(data.error || "Cannot cancel this booking");
      }
    } catch {
      alert("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading booking...</p>
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

  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;

  const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`);
  const now = new Date();
  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = booking.status !== "cancelled" && hoursUntilBooking > 48;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/book" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Booking
      </Link>

      <div className="text-center mb-8">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${status.bg} mb-4`}>
          <StatusIcon className={`h-8 w-8 ${status.color}`} />
        </div>
        <h1 className="text-2xl font-bold">Booking {status.label}</h1>
        <Badge variant={status.variant} className="mt-2">{status.label}</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-muted-foreground">Booking ID:</span>
            <span className="font-mono text-xs">{booking.id}</span>
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
            {booking.customer_phone && (
              <>
                <span className="text-muted-foreground">Phone:</span>
                <span>{booking.customer_phone}</span>
              </>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatCurrency(booking.total_price)}</span>
          </div>
        </CardContent>
      </Card>

      {booking.status === "pending" && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Payment Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-900 text-sm">
            <p>Your booking is awaiting payment verification. You will receive an email confirmation once payment is verified.</p>
          </CardContent>
        </Card>
      )}

      {canCancel && (
        <div className="flex justify-center">
          <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </div>
      )}

      {!canCancel && booking.status !== "cancelled" && (
        <p className="text-center text-sm text-muted-foreground">
          Cancellation is only available up to 48 hours before the booking time.
        </p>
      )}
    </div>
  );
}