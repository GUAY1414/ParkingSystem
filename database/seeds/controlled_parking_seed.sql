-- Controlled demonstration data only.
-- Run once in a fresh or reset development Supabase database.

INSERT INTO parking_locations (name, address, latitude, longitude, status)
SELECT seed.name, seed.address, seed.latitude, seed.longitude, 'ACTIVE'
FROM (VALUES
  ('Ermita Main', 'Ermita, Manila', 14.589400::numeric, 120.982200::numeric),
  ('Intramuros Central', 'Intramuros, Manila', 14.590600::numeric, 120.974700::numeric),
  ('Quiapo Parking', 'Quiapo, Manila', 14.600100::numeric, 120.983900::numeric)
) AS seed(name, address, latitude, longitude)
WHERE NOT EXISTS (
  SELECT 1 FROM parking_locations l WHERE l.name = seed.name
);

WITH location AS (
  SELECT id FROM parking_locations WHERE name = 'Ermita Main'
)
INSERT INTO parking_zones (location_id, name, capacity, occupancy, status)
SELECT id, zone.name, zone.capacity, 0, 'ACTIVE'
FROM location
CROSS JOIN (VALUES
  ('Zone A', 20),
  ('Zone B', 15)
) AS zone(name, capacity)
ON CONFLICT (location_id, name) DO NOTHING;

WITH location AS (
  SELECT id FROM parking_locations WHERE name = 'Intramuros Central'
)
INSERT INTO parking_zones (location_id, name, capacity, occupancy, status)
SELECT id, zone.name, zone.capacity, 0, 'ACTIVE'
FROM location
CROSS JOIN (VALUES
  ('Zone C', 30)
) AS zone(name, capacity)
ON CONFLICT (location_id, name) DO NOTHING;

WITH location AS (
  SELECT id FROM parking_locations WHERE name = 'Quiapo Parking'
)
INSERT INTO parking_zones (location_id, name, capacity, occupancy, status)
SELECT id, zone.name, zone.capacity, 0, 'ACTIVE'
FROM location
CROSS JOIN (VALUES
  ('Zone A', 18)
) AS zone(name, capacity)
ON CONFLICT (location_id, name) DO NOTHING;

INSERT INTO parking_rates (zone_id, amount_centavos, effective_from, status)
SELECT z.id,
       CASE z.name
         WHEN 'Zone A' THEN 5000
         WHEN 'Zone B' THEN 7000
         WHEN 'Zone C' THEN 10000
       END,
       now(),
       'ACTIVE'
FROM parking_zones z
ON CONFLICT DO NOTHING;
