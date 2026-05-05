export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type CourtType = "indoor" | "outdoor";

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  pricePerHour: number;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  courtId: string;
  date: string;
  startTime: string;
  durationHours: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  court?: Court;
}

export interface BookingWithCourt extends Booking {
  court: Court;
}

export interface Settings {
  venueName: string;
  openTime: string;
  closeTime: string;
  courts: Court[];
  qrisImageBase64: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  courtId: string;
  courtName: string;
  price: number;
}

export interface BookingFormData {
  courtId: string;
  date: string;
  startTime: string;
  durationHours: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}