ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type text;

UPDATE vehicles
SET vehicle_type = CASE
  WHEN LOWER(COALESCE(vehicle_type, make, '')) LIKE '%motorcycle%' OR LOWER(COALESCE(vehicle_type, make, '')) LIKE '%motor%'
    THEN 'Motorcycle'
  WHEN LOWER(COALESCE(vehicle_type, make, '')) LIKE '%suv%' OR LOWER(COALESCE(vehicle_type, make, '')) LIKE '%crossover%'
    THEN 'SUV'
  WHEN LOWER(COALESCE(vehicle_type, make, '')) LIKE '%van%' OR LOWER(COALESCE(vehicle_type, make, '')) LIKE '%minibus%'
    THEN 'Van'
  WHEN LOWER(COALESCE(vehicle_type, make, '')) LIKE '%pickup%' OR LOWER(COALESCE(vehicle_type, make, '')) LIKE '%truck%'
    THEN 'Pickup Truck'
  WHEN LOWER(COALESCE(vehicle_type, make, '')) LIKE '%sedan%' OR LOWER(COALESCE(vehicle_type, make, '')) LIKE '%car%'
    THEN 'Sedan'
  ELSE 'Sedan'
END;

ALTER TABLE vehicles DROP COLUMN IF EXISTS model;

ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_vehicle_type_check;

ALTER TABLE vehicles
ADD CONSTRAINT vehicles_vehicle_type_check
CHECK (vehicle_type IN (
  'Motorcycle', 'Sedan', 'SUV', 'Van', 'Pickup Truck'
));
