"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { AppSettings, Court } from "@/types";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");
  const [newCourtPrice, setNewCourtPrice] = useState("100000");

  useEffect(() => {
    const isAuthenticated = document.cookie.includes("admin_auth=true");
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }
    fetchData();
  }, [router]);

  async function fetchData() {
    try {
      const [settingsRes, courtsRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/courts?all=true"),
      ]);
      setSettings(await settingsRes.json());
      setCourts(await courtsRes.json());
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function toggleCourt(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/courts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCourts(courts.map((c) => (c.id === id ? updated : c)));
      toast.success(`Court ${!isActive ? "enabled" : "disabled"}`);
    }
  }

  async function updateCourtPrice(id: string, price: number) {
    const res = await fetch(`/api/admin/courts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_per_hour: price }),
    });
    if (res.ok) {
      toast.success("Price updated");
    }
  }

  async function addCourt() {
    if (!newCourtName.trim()) return;
    const res = await fetch("/api/admin/courts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCourtName.trim(),
        price_per_hour: parseInt(newCourtPrice),
      }),
    });
    if (res.ok) {
      const court = await res.json();
      setCourts([...courts, court]);
      setNewCourtName("");
      setNewCourtPrice("100000");
      toast.success("Court added");
    }
  }

  function updateSetting(key: keyof AppSettings, value: string) {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  }

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            </Link>
            <span className="font-semibold">Settings</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Venue Settings</CardTitle>
            <CardDescription>General venue information and operating hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name</Label>
                <Input
                  id="venueName"
                  value={settings.venue_name}
                  onChange={(e) => updateSetting("venue_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueAddress">Address</Label>
                <Input
                  id="venueAddress"
                  value={settings.venue_address}
                  onChange={(e) => updateSetting("venue_address", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venuePhone">Phone</Label>
                <Input
                  id="venuePhone"
                  value={settings.venue_phone}
                  onChange={(e) => updateSetting("venue_phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueEmail">Email</Label>
                <Input
                  id="venueEmail"
                  value={settings.venue_email}
                  onChange={(e) => updateSetting("venue_email", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
            <CardDescription>Set your venue operating hours and booking window</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Opening Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={settings.operating_hours_start}
                  onChange={(e) => updateSetting("operating_hours_start", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Closing Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={settings.operating_hours_end}
                  onChange={(e) => updateSetting("operating_hours_end", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                <Input
                  id="slotDuration"
                  type="number"
                  value={settings.slot_duration}
                  onChange={(e) => updateSetting("slot_duration", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdvance">Max Booking Advance (days)</Label>
                <Input
                  id="maxAdvance"
                  type="number"
                  value={settings.max_advance_days}
                  onChange={(e) => updateSetting("max_advance_days", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellationHours">Cancellation Window (hours before booking)</Label>
                <Input
                  id="cancellationHours"
                  type="number"
                  value={settings.cancellation_hours}
                  onChange={(e) => updateSetting("cancellation_hours", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentExpiry">Payment Expiry (hours)</Label>
                <Input
                  id="paymentExpiry"
                  type="number"
                  value={settings.payment_expiry_hours}
                  onChange={(e) => updateSetting("payment_expiry_hours", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QRIS Payment</CardTitle>
            <CardDescription>QRIS payment configuration for manual verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qrisImage">QRIS Code Image URL</Label>
                <Input
                  id="qrisImage"
                  value={settings.qris_image_url}
                  onChange={(e) => updateSetting("qris_image_url", e.target.value)}
                  placeholder="https://example.com/qris.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name</Label>
                <Input
                  id="accountName"
                  value={settings.qris_account_name}
                  onChange={(e) => updateSetting("qris_account_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank / E-Wallet Name</Label>
                <Input
                  id="bankName"
                  value={settings.qris_bank_name}
                  onChange={(e) => updateSetting("qris_bank_name", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courts</CardTitle>
            <CardDescription>Manage your padel courts and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courts.map((court) => (
              <div key={court.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{court.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Rp {court.price_per_hour.toLocaleString("id-ID")}/hour
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={court.is_active ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCourt(court.id, court.is_active)}
                  >
                    {court.is_active ? "Active" : "Inactive"}
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label>New Court Name</Label>
                <Input
                  value={newCourtName}
                  onChange={(e) => setNewCourtName(e.target.value)}
                  placeholder="Court 4"
                />
              </div>
              <div className="w-32 space-y-2">
                <Label>Price/hr (Rp)</Label>
                <Input
                  type="number"
                  value={newCourtPrice}
                  onChange={(e) => setNewCourtPrice(e.target.value)}
                />
              </div>
              <Button onClick={addCourt} size="icon" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}