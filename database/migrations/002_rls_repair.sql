-- Repair migration for a project where 001 was partially applied.
-- This script does not write to Supabase's protected auth schema.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_read_own ON profiles;
CREATE POLICY profile_read_own ON profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS profile_update_own ON profiles;
CREATE POLICY profile_update_own ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS vehicle_owner_all ON vehicles;
CREATE POLICY vehicle_owner_all ON vehicles
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS locations_authenticated_read ON parking_locations;
CREATE POLICY locations_authenticated_read ON parking_locations
  FOR SELECT TO authenticated USING (status = 'ACTIVE');

DROP POLICY IF EXISTS zones_authenticated_read ON parking_zones;
CREATE POLICY zones_authenticated_read ON parking_zones
  FOR SELECT TO authenticated USING (status = 'ACTIVE');

DROP POLICY IF EXISTS notification_owner_all ON notifications;
CREATE POLICY notification_owner_all ON notifications
  FOR ALL USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
