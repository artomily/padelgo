import courtsData from "@/data/courts.json";
import settingsData from "@/data/settings.json";
import bookingsData from "@/data/bookings.json";
import type { Court, BookingWithCourt, TimeSlot, Settings, BookingFormData } from "@/types";
import { generateBookingCode } from "./utils";

let bookings: BookingWithCourt[] = [...bookingsData] as BookingWithCourt[];
let courts: Court[] = [...courtsData] as Court[];
let settings: Settings = { ...settingsData } as Settings;

export function getActiveCourts(): Court[] {
  return courts.filter((c) => c.isActive);
}

export function getAllCourts(): Court[] {
  return courts;
}

export function getCourtById(id: string): Court | undefined {
  return courts.find((c) => c.id === id);
}

export function getSettings(): Settings {
  return { ...settings };
}

export function getAvailableSlots(date: string, courtId?: string): TimeSlot[] {
  const s = settings;
  const [startH, startM] = s.openTime.split(":").map(Number);
  const [endH, endM] = s.closeTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const bookingDate = new Date(date + "T00:00:00");
  const now = new Date();
  const isToday = bookingDate.toDateString() === now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const targetCourts = courtId ? courts.filter((c) => c.id === courtId && c.isActive) : courts.filter((c) => c.isActive);

  const dateBookings = bookings.filter((b) => b.date === date && b.status !== "cancelled");

  const slots: TimeSlot[] = [];

  for (const court of targetCourts) {
    let current = startMinutes;
    while (current + 60 <= endMinutes) {
      const slotStart = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;

      const isBooked = dateBookings.some(
        (b) => b.courtId === court.id && b.startTime === slotStart
      );

      const isPast = isToday && current <= currentMinutes;

      slots.push({
        time: slotStart,
        available: !isBooked && !isPast,
        courtId: court.id,
        courtName: court.name,
        price: court.pricePerHour,
      });

      current += 60;
    }
  }

  return slots;
}

export function createBooking(formData: BookingFormData): BookingWithCourt {
  const court = courts.find((c) => c.id === formData.courtId);
  if (!court) throw new Error("Court not found");

  const bookingDate = new Date(formData.date + "T00:00:00");
  const bookingCode = generateBookingCode(bookingDate);
  const endTime = `${String(parseInt(formData.startTime.split(":")[0]) + formData.durationHours).padStart(2, "0")}:00`;

  const booking: BookingWithCourt = {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingCode,
    courtId: formData.courtId,
    date: formData.date,
    startTime: formData.startTime,
    durationHours: formData.durationHours,
    customerName: formData.customerName,
    customerPhone: formData.customerPhone,
    customerEmail: formData.customerEmail,
    totalPrice: court.pricePerHour * formData.durationHours,
    status: "pending",
    createdAt: new Date().toISOString(),
    court,
  };

  bookings.push(booking);
  return booking;
}

export function getBookingById(id: string): BookingWithCourt | null {
  return bookings.find((b) => b.id === id) || null;
}

export function getBookingByCode(code: string): BookingWithCourt | null {
  return bookings.find((b) => b.bookingCode === code) || null;
}

export function cancelBooking(id: string): BookingWithCourt {
  const booking = bookings.find((b) => b.id === id);
  if (!booking) throw new Error("Booking not found");
  booking.status = "cancelled";
  return booking;
}

export function getAllBookings(filters?: { status?: string; date?: string }): BookingWithCourt[] {
  let result = [...bookings];
  if (filters?.status) result = result.filter((b) => b.status === filters.status);
  if (filters?.date) result = result.filter((b) => b.date === filters.date);
  return result.sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
}

export function confirmBooking(id: string): BookingWithCourt {
  const booking = bookings.find((b) => b.id === id);
  if (!booking) throw new Error("Booking not found");
  booking.status = "confirmed";
  return booking;
}

export function adminCancelBooking(id: string): BookingWithCourt {
  const booking = bookings.find((b) => b.id === id);
  if (!booking) throw new Error("Booking not found");
  booking.status = "cancelled";
  return booking;
}

export function updateCourt(
  id: string,
  updates: { name?: string; type?: "indoor" | "outdoor"; pricePerHour?: number; isActive?: boolean }
): Court {
  const court = courts.find((c) => c.id === id);
  if (!court) throw new Error("Court not found");
  Object.assign(court, updates);
  court.updatedAt = new Date().toISOString();
  return court;
}

export function createCourt(data: { name: string; type: "indoor" | "outdoor"; pricePerHour: number }): Court {
  const court: Court = {
    id: `court-${Date.now()}`,
    name: data.name,
    type: data.type,
    pricePerHour: data.pricePerHour,
    amenities: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  courts.push(court);
  return court;
}

export function updateSettings(newSettings: Settings): Settings {
  settings = { ...newSettings };
  return settings;
}