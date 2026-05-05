"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Court, Settings } from "@/types";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");
  const [newCourtPrice, setNewCourtPrice] = useState("100000");

  useEffect(() => {
    const isAuthenticated = document.cookie.includes("admin_auth=true");
    if (!isAuthenticated) { router.push("/admin/login"); return; }
    fetchData();
  }, [router]);

  async function fetchData() {
    try {
      const [settingsRes, courtsRes] = await Promise.all([fetch("/api/settings"), fetch("/api/courts?all=true")]);
      setSettings(await settingsRes.json());
      setCourts(await courtsRes.json());
    } catch { toast.error("Failed to load settings"); }
    finally { setLoading(false); }
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      if (res.ok) toast.success("Settings saved");
      else toast.error("Failed to save settings");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  }

  async function toggleCourt(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/courts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    if (res.ok) { const updated = await res.json(); setCourts(courts.map((c) => (c.id === id ? updated : c))); toast.success(`Court ${!isActive ? "enabled" : "disabled"}`); }
  }

  async function addCourt() {
    if (!newCourtName.trim()) return;
    const res = await fetch("/api/admin/courts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCourtName.trim(), pricePerHour: parseInt(newCourtPrice) }) });
    if (res.ok) { const court = await res.json(); setCourts([...courts, court]); setNewCourtName(""); setNewCourtPrice("100000"); toast.success("Court added"); }
  }

  function updateSetting(key: keyof Settings, value: string) {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  }

  if (loading || !settings) {
    return <div className="min-h-[100dvh] flex items-center justify-center"><p className="text-muted-foreground">Loading settings...</p></div>;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1280px] flex h-14 items-center gap-2 px-6 md:px-10">
          <Link href="/admin/dashboard"><button className="inline-flex items-center rounded-full border border-border/50 bg-transparent px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</button></Link>
          <span className="font-heading font-semibold tracking-tight">Settings</span>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-6 space-y-6">
        {/* Venue */}
        <div className="rounded-2xl bg-card border border-border/50 p-6">
          <h3 className="font-heading font-semibold mb-4">Venue Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Venue Name</label>
              <input value={settings.venueName} onChange={(e) => updateSetting("venueName", e.target.value)} className="w-full h-11 rounded-xl bg-background border border-border/50 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Open Time</label>
              <input type="time" value={settings.openTime} onChange={(e) => updateSetting("openTime", e.target.value)} className="w-full h-11 rounded-xl bg-background border border-border/50 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Close Time</label>
              <input type="time" value={settings.closeTime} onChange={(e) => updateSetting("closeTime", e.target.value)} className="w-full h-11 rounded-xl bg-background border border-border/50 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>
        </div>

        {/* Courts */}
        <div className="rounded-2xl bg-card border border-border/50 p-6">
          <h3 className="font-heading font-semibold mb-4">Courts</h3>
          <div className="space-y-3 mb-4">
            {courts.map((court) => (
              <div key={court.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                <div>
                  <p className="font-medium">{court.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{court.type} · {formatCurrency(court.pricePerHour)}/hr</p>
                </div>
                <button onClick={() => toggleCourt(court.id, court.isActive)} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", court.isActive ? "bg-primary text-primary-foreground" : "border border-border/50 text-muted-foreground")}>
                  {court.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 items-end pt-4 border-t border-border/50">
            <div className="flex-1 grid gap-2"><label className="text-sm font-medium">New Court Name</label><input value={newCourtName} onChange={(e) => setNewCourtName(e.target.value)} placeholder="Court 4" className="w-full h-11 rounded-xl bg-background border border-border/50 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" /></div>
            <div className="w-32 grid gap-2"><label className="text-sm font-medium">Price/hr</label><input type="number" value={newCourtPrice} onChange={(e) => setNewCourtPrice(e.target.value)} className="w-full h-11 rounded-xl bg-background border border-border/50 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" /></div>
            <button onClick={addCourt} className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-all active:scale-[0.98]"><Plus className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={saveSettings} disabled={saving} className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>
    </div>
  );
}