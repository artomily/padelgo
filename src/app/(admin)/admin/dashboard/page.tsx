"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, CheckCircle2, Clock, XCircle, Settings, RefreshCw, Eye } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { BookingWithCourt } from "@/types";

const statusConfig = {
  pending: { icon: Clock, label: "Pending", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  confirmed: { icon: CheckCircle2, label: "Confirmed", color: "text-primary", bg: "bg-primary/10" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithCourt | null>(null);

  useEffect(() => {
    const isAuthenticated = document.cookie.includes("admin_auth=true");
    if (!isAuthenticated) { router.push("/admin/login"); return; }
    fetchData();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterDate) params.set("date", filterDate);
    const [bookingsRes] = await Promise.all([fetch(`/api/admin/bookings?${params.toString()}`)]);
    setBookings(await bookingsRes.json());
    setLoading(false);
  }

  useEffect(() => { if (filterStatus || filterDate) fetchData(); }, [filterStatus, filterDate]);

  async function confirmBooking(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}/confirm`, { method: "POST" });
    if (res.ok) { const updated = await res.json(); setBookings(bookings.map((b) => (b.id === id ? updated : b))); setSelectedBooking(null); }
  }

  async function cancelBooking(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}/cancel`, { method: "POST" });
    if (res.ok) { const updated = await res.json(); setBookings(bookings.map((b) => (b.id === id ? updated : b))); setSelectedBooking(null); }
  }

  function handleLogout() {
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  }

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.date === today);
  const stats = {
    today: todayBookings.length,
    revenue: todayBookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.totalPrice, 0),
    pending: bookings.filter((b) => b.status === "pending").length,
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1280px] flex h-14 items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-xs">PG</div>
            <span className="font-heading font-semibold tracking-tight">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings"><button className="inline-flex items-center rounded-full border border-border/50 bg-transparent px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted"><Settings className="h-4 w-4 mr-1.5" />Settings</button></Link>
            <button onClick={handleLogout} className="inline-flex items-center rounded-full border border-border/50 bg-transparent px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted"><LogOut className="h-4 w-4 mr-1.5" />Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Bookings Today", value: stats.today, color: "" },
            { label: "Revenue Today", value: formatCurrency(stats.revenue), color: "text-primary" },
            { label: "Pending", value: stats.pending, color: "text-yellow-500" },
            { label: "Total", value: bookings.length, color: "" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-card border border-border/50 p-5">
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              <p className={cn("text-2xl font-heading font-bold mt-1", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-xl bg-card border border-border/50 px-4 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-10 rounded-xl bg-card border border-border/50 px-4 text-sm focus:outline-none focus:border-primary/50"
          />
          <button onClick={fetchData} className="h-10 w-10 rounded-xl border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Court</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No bookings found</td></tr>
                ) : bookings.map((booking) => {
                  const st = statusConfig[booking.status];
                  return (
                    <tr key={booking.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-4">{booking.date}</td>
                      <td className="py-3 px-4 font-mono">{booking.startTime}</td>
                      <td className="py-3 px-4">{booking.court.name}</td>
                      <td className="py-3 px-4"><div><div className="font-medium">{booking.customerName}</div><div className="text-xs text-muted-foreground">{booking.customerPhone}</div></div></td>
                      <td className="py-3 px-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", st.bg, st.color)}>
                          <st.icon className="h-3 w-3" />
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(booking.totalPrice)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedBooking(booking)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye className="h-4 w-4" /></button>
                          {booking.status === "pending" && <button onClick={() => confirmBooking(booking.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><CheckCircle2 className="h-4 w-4" /></button>}
                          {booking.status !== "cancelled" && <button onClick={() => cancelBooking(booking.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><XCircle className="h-4 w-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedBooking(null)}>
          <div className="rounded-2xl bg-card border border-border/50 p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-semibold mb-4">Booking Details</h3>
            <div className="space-y-2 text-sm">
              {[
                ["Code", selectedBooking.bookingCode],
                ["Court", selectedBooking.court.name],
                ["Date", selectedBooking.date],
                ["Time", selectedBooking.startTime],
                ["Duration", `${selectedBooking.durationHours}h`],
                ["Name", selectedBooking.customerName],
                ["Phone", selectedBooking.customerPhone],
                ["Email", selectedBooking.customerEmail],
                ["Status", selectedBooking.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-heading font-bold text-primary">{formatCurrency(selectedBooking.totalPrice)}</span>
              </div>
            </div>
            {selectedBooking.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => confirmBooking(selectedBooking.id)} className="flex-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]">Confirm</button>
                <button onClick={() => cancelBooking(selectedBooking.id)} className="flex-1 inline-flex items-center justify-center rounded-full border border-border/50 text-destructive px-4 py-2.5 text-sm font-semibold transition-all hover:bg-destructive/10 active:scale-[0.98]">Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}