-- Kuya meron pa? initial PostgreSQL schema
-- Run in Supabase SQL Editor after reviewing for your project.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('DRIVER','PARKING_ATTENDANT','PARKING_ADMINISTRATOR','SYSTEM_ADMINISTRATOR');
CREATE TYPE account_status AS ENUM ('ACTIVE','INACTIVE','SUSPENDED');
CREATE TYPE session_status AS ENUM ('ACTIVE','CLOSED','CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH','ONLINE');
CREATE TYPE transaction_status AS ENUM ('PENDING','CONFIRMED','FAILED','CANCELLED');

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  mobile text,
  role user_role NOT NULL DEFAULT 'DRIVER',
  status account_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plate_number text NOT NULL,
  normalized_plate text NOT NULL,
  make text,
  model text,
  color text,
  status account_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_normalized_plate_unique UNIQUE (normalized_plate)
);
CREATE INDEX vehicles_owner_idx ON vehicles(owner_id);

CREATE TABLE parking_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
  status account_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT location_coordinate_check CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
);

CREATE TABLE parking_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer NOT NULL CHECK (capacity >= 0),
  occupancy integer NOT NULL DEFAULT 0 CHECK (occupancy >= 0),
  status account_status NOT NULL DEFAULT 'ACTIVE',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT zone_capacity_check CHECK (occupancy <= capacity),
  CONSTRAINT zone_location_name_unique UNIQUE (location_id, name)
);

CREATE TABLE parking_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES parking_zones(id) ON DELETE CASCADE,
  amount_centavos integer NOT NULL CHECK (amount_centavos >= 0),
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  status account_status NOT NULL DEFAULT 'ACTIVE',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX parking_rates_zone_active_idx ON parking_rates(zone_id, status, effective_from DESC);

CREATE TABLE attendant_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE,
  zone_id uuid NOT NULL REFERENCES parking_zones(id) ON DELETE CASCADE,
  status account_status NOT NULL DEFAULT 'ACTIVE',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assignment_unique UNIQUE (attendant_id, zone_id)
);

CREATE TABLE parking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_reference text NOT NULL UNIQUE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),
  zone_id uuid NOT NULL REFERENCES parking_zones(id),
  attendant_id uuid NOT NULL REFERENCES profiles(id),
  snapshot_rate_centavos integer NOT NULL CHECK (snapshot_rate_centavos >= 0),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  status session_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT session_times_check CHECK (end_time IS NULL OR end_time >= start_time)
);
CREATE UNIQUE INDEX active_session_per_vehicle ON parking_sessions(vehicle_id) WHERE status = 'ACTIVE';
CREATE INDEX sessions_zone_status_idx ON parking_sessions(zone_id, status);
CREATE INDEX sessions_attendant_idx ON parking_sessions(attendant_id);

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES parking_sessions(id),
  reference text NOT NULL UNIQUE,
  payment_method payment_method NOT NULL,
  provider text,
  amount_centavos integer NOT NULL CHECK (amount_centavos >= 0),
  expected_amount_centavos integer NOT NULL CHECK (expected_amount_centavos >= 0),
  status transaction_status NOT NULL DEFAULT 'PENDING',
  discrepancy_status text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX transactions_session_idx ON transactions(session_id);
CREATE INDEX transactions_status_idx ON transactions(status);

CREATE TABLE receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL UNIQUE REFERENCES transactions(id),
  session_id uuid NOT NULL REFERENCES parking_sessions(id),
  receipt_number text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES parking_sessions(id),
  type text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'UNREAD',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_idx ON audit_logs(created_at DESC);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions in the protected Supabase auth schema are not required.
-- Application roles are verified by the Express API and RLS uses auth.uid().

CREATE POLICY profile_read_own ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profile_update_own ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY vehicle_owner_all ON vehicles FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY locations_authenticated_read ON parking_locations FOR SELECT TO authenticated USING (status = 'ACTIVE');
CREATE POLICY zones_authenticated_read ON parking_zones FOR SELECT TO authenticated USING (status = 'ACTIVE');
CREATE POLICY notification_owner_all ON notifications FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
