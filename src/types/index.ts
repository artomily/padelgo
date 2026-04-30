export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Court {
  id: string;
  name: string;
  description: string | null;
  price_per_hour: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  court_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_price: number;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  court?: Court;
}

export interface BookingWithCourt extends Booking {
  court: Court;
}

export interface CourtBlock {
  id: string;
  court_id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface AppSettings {
  operating_hours_start: string;
  operating_hours_end: string;
  slot_duration: string;
  max_advance_days: string;
  cancellation_hours: string;
  qris_image_url: string;
  qris_account_name: string;
  qris_bank_name: string;
  payment_expiry_hours: string;
  venue_name: string;
  venue_address: string;
  venue_phone: string;
  venue_email: string;
}

export interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
  courtId: string;
  courtName: string;
  price: number;
}

export interface BookingFormData {
  courtId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}