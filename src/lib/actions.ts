"use server";

import { supabase, createServerClient } from "./supabase";
import type { BookingFormData, AppSettings } from "@/types";
import { format } from "date-fns";

export async function getActiveCourts() {
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

export async function getCourts() {
  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("courts")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase.from("settings").select("*");

  if (error) throw error;

  const settings: Record<string, string> = {};
  for (const row of data as { key: string; value: string }[]) {
    settings[row.key] = row.value;
  }

  return settings as unknown as AppSettings;
}

export async function getAvailableSlots(date: string) {
  const settings = await getSettings();
  const startTime = settings.operating_hours_start;
  const endTime = settings.operating_hours_end;
  const slotDuration = parseInt(settings.slot_duration);
  const advanceDays = parseInt(settings.max_advance_days);

  const bookingDate = new Date(date);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + advanceDays);
  if (bookingDate > maxDate) {
    return [];
  }

  const courts = await getActiveCourts();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("court_id, start_time, end_time, status")
    .eq("booking_date", date)
    .neq("status", "cancelled");

  const { data: blocks } = await supabase
    .from("court_blocks")
    .select("court_id, start_time, end_time")
    .eq("block_date", date);

  const slots = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (const court of courts) {
    let currentMinutes = startMinutes;
    while (currentMinutes + slotDuration <= endMinutes) {
      const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, "0")}:${String(currentMinutes % 60).padStart(2, "0")}`;
      const slotEndMinutes = currentMinutes + slotDuration;
      const slotEnd = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, "0")}:${String(slotEndMinutes % 60).padStart(2, "0")}`;

      const isBooked = bookings?.some(
        (b) =>
          b.court_id === court.id &&
          b.start_time <= slotStart &&
          b.end_time > slotStart
      );

      const isBlocked = blocks?.some(
        (b) =>
          b.court_id === court.id &&
          b.start_time <= slotStart &&
          b.end_time > slotStart
      );

      const isPast =
        bookingDate.toDateString() === new Date().toDateString() &&
        currentMinutes <= new Date().getHours() * 60 + new Date().getMinutes();

      slots.push({
        time: slotStart,
        endTime: slotEnd,
        available: !isBooked && !isBlocked && !isPast,
        courtId: court.id,
        courtName: court.name,
        price: court.price_per_hour,
      });

      currentMinutes += slotDuration;
    }
  }

  return slots;
}

export async function createBooking(formData: BookingFormData) {
  const courts = await getActiveCourts();
  const court = courts.find((c) => c.id === formData.courtId);
  if (!court) throw new Error("Court not found");

  const settings = await getSettings();
  const slotDuration = parseInt(settings.slot_duration);
  const [startH, startM] = formData.startTime.split(":").map(Number);
  const endMinutes = startH * 60 + startM + slotDuration;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

  const cancellationDeadline = new Date(formData.date);
  cancellationDeadline.setHours(
    cancellationDeadline.getHours() - parseInt(settings.cancellation_hours)
  );
  if (new Date() > cancellationDeadline) {
    throw new Error("Cannot book within the cancellation window");
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      court_id: formData.courtId,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone || null,
      booking_date: formData.date,
      start_time: formData.startTime,
      end_time: endTime,
      total_price: court.price_per_hour,
      status: "pending",
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, court:courts(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function cancelBooking(id: string) {
  const settings = await getSettings();
  const booking = await getBookingById(id);

  const bookingDateTime = new Date(
    `${booking.booking_date}T${booking.start_time}`
  );
  const deadline = new Date(
    bookingDateTime.getTime() -
      parseInt(settings.cancellation_hours) * 60 * 60 * 1000
  );

  if (new Date() > deadline) {
    throw new Error(
      `Cannot cancel within ${settings.cancellation_hours} hours of booking`
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllBookings(filters?: {
  status?: string;
  date?: string;
  courtId?: string;
}) {
  const serverClient = createServerClient();
  let query = serverClient
    .from("bookings")
    .select("*, court:courts(*)")
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.date) query = query.eq("booking_date", filters.date);
  if (filters?.courtId) query = query.eq("court_id", filters.courtId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function confirmBooking(id: string, paymentReference?: string) {
  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("bookings")
    .update({
      status: "confirmed",
      payment_reference: paymentReference || null,
    })
    .eq("id", id)
    .select("*, court:courts(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function adminCancelBooking(id: string) {
  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("*, court:courts(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function updateCourt(
  id: string,
  updates: { name?: string; description?: string; price_per_hour?: number; is_active?: boolean }
) {
  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("courts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createCourt(data: {
  name: string;
  description?: string;
  price_per_hour: number;
}) {
  const serverClient = createServerClient();
  const { data: court, error } = await serverClient
    .from("courts")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return court;
}

export async function updateSetting(key: string, value: string) {
  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("settings")
    .update({ value })
    .eq("key", key)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function formatCurrency(amount: number): Promise<string> {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export { format };