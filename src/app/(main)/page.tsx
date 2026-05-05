import Link from "next/link";
import { ArrowRight, Clock, MapPin, Zap, Shield, Users, Trophy, Calendar, Star, Mail, Phone, Check } from "lucide-react";
import courtsData from "@/data/courts.json";
import { formatCurrency } from "@/lib/utils";

const features = [
  { icon: Zap, title: "Fast & Easy Booking", desc: "Book your court in just a few clicks. Real-time availability, instant confirmation." },
  { icon: Shield, title: "Professional Courts", desc: "Indoor & outdoor courts with premium surfaces and professional lighting." },
  { icon: Users, title: "Community Events", desc: "Join weekly tournaments, social mixers, and community-driven events." },
];

const services = [
  { title: "Indoor Courts", desc: "Professional-grade indoor courts with LED lighting and climate control." },
  { title: "Outdoor Courts", desc: "Natural outdoor experience with premium synthetic grass surfaces." },
  { title: "Court Rental", desc: "Flexible hourly rental with real-time availability. No membership required." },
];

const membershipPlans = [
  {
    name: "Club Member",
    price: "450K",
    period: "per bulan",
    features: [
      "Up to 12 sessions/month",
      "Priority booking (7 days early)",
      "Access to member-only events",
      "10% off merchandise & drinks",
      "Community chat group access",
    ],
    featured: false,
  },
  {
    name: "Elite Player",
    price: "1.200K",
    period: "per bulan",
    features: [
      "Unlimited sessions anytime",
      "2 personal coaching sessions/month",
      "20% off gear, merch & drinks",
      "VIP locker access",
      "Priority access to tournaments",
    ],
    featured: true,
  },
];

const events = [
  { title: "Weekly Ladder Matches", desc: "Challenge players at your level and climb the rankings.", date: "Every Saturday", time: "18:00" },
  { title: "Monthly Social Mixers", desc: "Meet fellow padel enthusiasts in relaxed gatherings.", date: "Every 1st Friday", time: "19:00" },
  { title: "Annual Padelo Cup", desc: "Our biggest tournament of the year.", date: "Yearly", time: "TBA" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="mx-auto max-w-[1280px] px-6 md:px-10 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Jakarta's Premier Padel Club
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.1] mb-6">
              Welcome to{" "}
              <span className="text-primary">PadelGo</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl font-medium">
                Play. Connect. Smash.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              The ultimate destination for padel enthusiasts. Whether you're a beginner or a seasoned pro, we've got the courts, community, and energy to fuel your game.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/book">
                <button className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold transition-all hover:bg-primary/90 active:scale-[0.98]">
                  Book a Court
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link href="#membership">
                <button className="inline-flex items-center justify-center rounded-full border border-border/50 bg-transparent px-8 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]">
                  View Membership
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-primary">{courtsData.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Professional Courts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-primary">60s</p>
              <p className="text-sm text-muted-foreground mt-1">Booking Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-primary">QRIS</p>
              <p className="text-sm text-muted-foreground mt-1">Payment Method</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-card border border-border/50">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">About PadelGo</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-6">
                What Makes <span className="text-primary">PadelGo</span> Different?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                PadelGo isn't just a padel club — it's a lifestyle hub. We combine professional-grade courts, certified coaching, and a thriving community to give you more than just a place to play.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "3", label: "Professional Courts", sub: "Indoor & Outdoor", icon: null },
                  { value: "500+", label: "Active Players", sub: "Community members", icon: null },
                  { value: "Weekly", label: "Events", sub: "Tournaments & mixers", icon: Trophy },
                  { value: "4.9", label: "Rating", sub: "Member reviews", icon: Star },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {Icon ? <Icon className="h-5 w-5 text-primary" /> : <span className="text-lg font-bold text-primary">{stat.value}</span>}
                      </div>
                      <div>
                        <p className="font-semibold">{stat.label}</p>
                        <p className="text-xs text-muted-foreground">{stat.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="aspect-[4/3] rounded-3xl bg-card border border-border/50 flex items-center justify-center">
              <div className="text-center p-8">
                <Users className="h-20 w-20 text-primary/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Join our community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 md:py-16 bg-card/30 border-y border-border/50">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
              Explore Our Padel Services
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <div key={i} className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                <h3 className="text-xl font-heading font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courts */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Our Courts</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
                Choose Your Court
              </h2>
            </div>
            <Link href="/book">
              <button className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold transition-all hover:bg-primary/90 active:scale-[0.98]">
                Book Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courtsData.map((court, i) => (
              <div key={court.id} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-heading font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-heading font-bold text-primary">{formatCurrency(court.pricePerHour)}</p>
                    <p className="text-xs text-muted-foreground">per hour</p>
                  </div>
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{court.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {court.amenities.map((a) => (
                    <span key={a} className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">
                      {a}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground capitalize">{court.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="py-12 md:py-16 bg-card/30 border-y border-border/50">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Membership</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
              Flexible Plans. Unlimited Possibilities.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Become part of the PadelGo community with our tailored membership plans.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {membershipPlans.map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border ${plan.featured ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border/50'}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-foreground text-primary text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-heading font-semibold mb-2 ${plan.featured ? 'text-primary-foreground' : ''}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-heading font-bold ${plan.featured ? 'text-primary-foreground' : 'text-primary'}`}>
                    IDR {plan.price}
                  </span>
                  <span className={`text-sm ${plan.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className={`h-4 w-4 shrink-0 ${plan.featured ? 'text-primary-foreground' : 'text-primary'}`} />
                      <span className={`text-sm ${plan.featured ? 'text-primary-foreground/90' : ''}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full rounded-full py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${plan.featured ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Events</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
              Let's Rally! Tournaments & Events
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              At PadelGo, there's always something happening.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((event, i) => {
              const Icon = i === 0 ? Trophy : i === 1 ? Users : Calendar;
              return (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border/50">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{event.desc}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{event.date}</span>
                    <span className="text-primary font-medium">{event.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            Ready to Serve, Smash, and Score?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Book a court, join our next tournament, or sign up for coaching — PadelGo is your padel playground.
          </p>
          <Link href="/book">
            <button className="inline-flex items-center justify-center rounded-full bg-primary-foreground text-primary px-8 py-3 text-sm font-semibold transition-all hover:bg-primary-foreground/90 active:scale-[0.98]">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
            {[
              { icon: Mail, label: "Email us", value: "hello@padelgo.id" },
              { icon: Phone, label: "Call us", value: "+62 812-3456-7890" },
              { icon: MapPin, label: "Visit us", value: "Jakarta, Indonesia" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}