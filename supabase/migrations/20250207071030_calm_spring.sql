/*
  # Fix Authentication Schema

  1. Changes
    - Drop existing tables to ensure clean state
    - Recreate tables with proper constraints
    - Add RLS policies
    - Add test accounts

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Drop existing tables in reverse order to avoid foreign key conflicts
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS nurse_slots;
DROP TABLE IF EXISTS nurse_service_areas;
DROP TABLE IF EXISTS nurse_profiles;
DROP TABLE IF EXISTS patient_profiles;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS service_areas;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('patient', 'nurse')),
  name text NOT NULL,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patient_profiles table
CREATE TABLE patient_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  blood_group text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_conditions text[],
  allergies text[],
  current_medications text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create nurse_profiles table
CREATE TABLE nurse_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  qualification text NOT NULL,
  years_of_experience integer NOT NULL DEFAULT 0,
  specializations text[] DEFAULT '{}',
  languages_spoken text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_areas table
CREATE TABLE service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode text NOT NULL,
  service_id text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pincode, service_id)
);

-- Create nurse_service_areas table
CREATE TABLE nurse_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id uuid REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  pincode text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(nurse_id, pincode)
);

-- Create nurse_slots table
CREATE TABLE nurse_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id uuid REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'booked', 'completed', 'cancelled')) DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_slot_time CHECK (end_time > start_time),
  CONSTRAINT one_hour_slot CHECK (EXTRACT(EPOCH FROM end_time::time - start_time::time) = 3600)
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  nurse_id uuid REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  slot_id uuid REFERENCES nurse_slots(id) ON DELETE CASCADE,
  service_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Patient Profiles Policies
CREATE POLICY "Patients can view their own profile"
  ON patient_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Patients can insert their own profile"
  ON patient_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can update their own profile"
  ON patient_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Nurse Profiles Policies
CREATE POLICY "Public can view nurse profiles"
  ON nurse_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nurses can insert their own profile"
  ON nurse_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Nurses can update their own profile"
  ON nurse_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service Areas Policies
CREATE POLICY "Public can view service areas"
  ON service_areas
  FOR SELECT
  TO public
  USING (true);

-- Nurse Service Areas Policies
CREATE POLICY "Public can view nurse service areas"
  ON nurse_service_areas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nurses can manage their service areas"
  ON nurse_service_areas
  FOR ALL
  TO authenticated
  USING (nurse_id = auth.uid())
  WITH CHECK (nurse_id = auth.uid());

-- Nurse Slots Policies
CREATE POLICY "Public can view available slots"
  ON nurse_slots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nurses can manage their slots"
  ON nurse_slots
  FOR ALL
  TO authenticated
  USING (nurse_id = auth.uid())
  WITH CHECK (nurse_id = auth.uid());

-- Bookings Policies
CREATE POLICY "Users can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid()
    OR nurse_id = auth.uid()
  );

CREATE POLICY "Patients can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'patient'
    )
  );

CREATE POLICY "Users can update their bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    patient_id = auth.uid()
    OR nurse_id = auth.uid()
  )
  WITH CHECK (
    patient_id = auth.uid()
    OR nurse_id = auth.uid()
  );

-- Insert test accounts
INSERT INTO profiles (id, role, name) VALUES
('e9dc96f3-6691-4a7c-9d6c-ef3b367ad6f1', 'patient', 'Test Patient'),
('f7dc96f3-6691-4a7c-9d6c-ef3b367ad6f2', 'nurse', 'Test Nurse')
ON CONFLICT (id) DO NOTHING;

-- Insert patient profile
INSERT INTO patient_profiles (
  id,
  date_of_birth,
  gender,
  blood_group,
  emergency_contact_name,
  emergency_contact_phone
) VALUES (
  'e9dc96f3-6691-4a7c-9d6c-ef3b367ad6f1',
  '1990-01-01',
  'male',
  'O+',
  'Emergency Contact',
  '+91 98765 43210'
) ON CONFLICT (id) DO NOTHING;

-- Insert nurse profile
INSERT INTO nurse_profiles (
  id,
  qualification,
  years_of_experience,
  specializations,
  languages_spoken
) VALUES (
  'f7dc96f3-6691-4a7c-9d6c-ef3b367ad6f2',
  'BSc Nursing',
  5,
  ARRAY['General Care', 'Elder Care', 'Post-operative Care'],
  ARRAY['English', 'Tamil', 'Hindi']
) ON CONFLICT (id) DO NOTHING;