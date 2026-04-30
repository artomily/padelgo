import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, CreditCard, Clock, Undo2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Book Your Padel Court in Seconds
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Easy online booking for our padel courts. Choose your time, pay with QRIS,
              and you&apos;re ready to play.
            </p>
            <Link href="/book">
              <Button size="lg" variant="secondary" className="text-base">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">1. Choose Date & Time</h3>
            <p className="text-sm text-muted-foreground">
              Pick your preferred date and time slot from our availability calendar.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">2. Pay with QRIS</h3>
            <p className="text-sm text-muted-foreground">
              Scan the QRIS code and make your payment through your banking app.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">3. Get Confirmed</h3>
            <p className="text-sm text-muted-foreground">
              Once we verify your payment, you&apos;ll receive a confirmation email.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
              <Undo2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">4. Easy Cancellation</h3>
            <p className="text-sm text-muted-foreground">
              Need to cancel? Free cancellation up to 48 hours before your booking.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Our Courts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Court 1", type: "Indoor Premium", price: "Rp 150,000" },
              { name: "Court 2", type: "Indoor Standard", price: "Rp 100,000" },
              { name: "Court 3", type: "Outdoor", price: "Rp 80,000" },
            ].map((court) => (
              <div
                key={court.name}
                className="rounded-lg border bg-card p-6 text-center"
              >
                <h3 className="font-semibold text-lg mb-1">{court.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{court.type}</p>
                <p className="text-2xl font-bold">{court.price}</p>
                <p className="text-sm text-muted-foreground">per hour</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/book">
              <Button size="lg">Book a Court Now</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}