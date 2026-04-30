-- PadelGo Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Courts table
CREATE TABLE courts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 100000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (key-value store for app configuration)
CREATE TABLE settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Court blocks (maintenance, events, etc.)
CREATE TABLE court_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_court_date ON bookings(court_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_court_blocks_court_date ON court_blocks(court_id, block_date);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('operating_hours_start', '08:00', 'Venue opening time'),
  ('operating_hours_end', '22:00', 'Venue closing time'),
  ('slot_duration', '60', 'Slot duration in minutes'),
  ('max_advance_days', '30', 'Maximum days in advance for booking'),
  ('cancellation_hours', '48', 'Minimum hours before booking for free cancellation'),
  ('qris_image_url', '', 'QRIS QR code image URL'),
  ('qris_account_name', '', 'QRIS account holder name'),
  ('qris_bank_name', '', 'QRIS bank name'),
  ('payment_expiry_hours', '24', 'Hours before unconfirmed booking expires'),
  ('venue_name', 'PadelGo', 'Venue display name'),
  ('venue_address', '', 'Venue address'),
  ('venue_phone', '', 'Venue contact phone'),
  ('venue_email', '', 'Venue contact email');

-- Seed courts
INSERT INTO courts (name, description, price_per_hour) VALUES
  ('Court 1', 'Indoor premium court', 150000),
  ('Court 2', 'Indoor standard court', 100000),
  ('Court 3', 'Outdoor court', 80000);