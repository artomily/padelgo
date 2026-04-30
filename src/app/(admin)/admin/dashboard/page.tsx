"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { 
  LogOut, CheckCircle2, Clock, XCircle, Settings, 
  CalendarDays, Filter, RefreshCw, Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatTime } from "@/lib/utils";
import type { BookingWithCourt, Court } from "@/types";

const statusConfig = {
  pending: { icon: Clock, label: "Pending", variant: "secondary" as const },
  confirmed: { icon: CheckCircle2, label: "Confirmed", variant: "default" as const },
  cancelled: { icon: XCircle, label: "Cancelled", variant: "destructive" as const },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithCourt[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterCourt, setFilterCourt] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithCourt | null>(null);

  useEffect(() => {
    const isAuthenticated = document.cookie.includes("admin_auth=true");
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }
    fetchData();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterDate) params.set("date", filterDate);
    if (filterCourt !== "all") params.set("courtId", filterCourt);

    const [bookingsRes, courtsRes] = await Promise.all([
      fetch(`/api/admin/bookings?${params.toString()}`),
      fetch("/api/courts"),
    ]);
    setBookings(await bookingsRes.json());
    setCourts(await courtsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    if (filterStatus || filterDate || filterCourt) {
      fetchData();
    }
  }, [filterStatus, filterDate, filterCourt]);

  async function confirmBooking(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}/confirm`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setBookings(bookings.map((b) => (b.id === id ? updated : b)));
      setSelectedBooking(null);
    }
  }

  async function cancelBooking(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}/cancel`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setBookings(bookings.map((b) => (b.id === id ? updated : b)));
      setSelectedBooking(null);
    }
  }

  function handleLogout() {
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    revenue: bookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + b.total_price, 0),
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              PG
            </div>
            <span className="font-semibold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(stats.revenue)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Bookings</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val ?? "all")}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-[150px]"
                />
                <Select value={filterCourt} onValueChange={(val) => setFilterCourt(val ?? "all")}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Court" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courts</SelectItem>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Court</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => {
                      const st = statusConfig[booking.status];
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                          <TableCell>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</TableCell>
                          <TableCell>{booking.court.name}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.customer_name}</div>
                              <div className="text-xs text-muted-foreground">{booking.customer_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(booking.total_price)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {booking.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => confirmBooking(booking.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              {booking.status !== "cancelled" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => cancelBooking(booking.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{selectedBooking.id}</span>
                <span className="text-muted-foreground">Court:</span>
                <span>{selectedBooking.court.name}</span>
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date(selectedBooking.booking_date).toLocaleDateString()}</span>
                <span className="text-muted-foreground">Time:</span>
                <span>{formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}</span>
                <span className="text-muted-foreground">Customer:</span>
                <span>{selectedBooking.customer_name}</span>
                <span className="text-muted-foreground">Email:</span>
                <span>{selectedBooking.customer_email}</span>
                <span className="text-muted-foreground">Phone:</span>
                <span>{selectedBooking.customer_phone || "N/A"}</span>
                <span className="text-muted-foreground">Status:</span>
                <span>
                  <Badge variant={statusConfig[selectedBooking.status].variant}>
                    {statusConfig[selectedBooking.status].label}
                  </Badge>
                </span>
                <span className="text-muted-foreground">Payment Ref:</span>
                <span>{selectedBooking.payment_reference || "N/A"}</span>
                <span className="text-muted-foreground">Notes:</span>
                <span>{selectedBooking.notes || "None"}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{formatCurrency(selectedBooking.total_price)}</span>
              </div>
              {selectedBooking.status === "pending" && (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => confirmBooking(selectedBooking.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => cancelBooking(selectedBooking.id)}>
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}