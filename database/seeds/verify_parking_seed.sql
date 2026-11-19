SELECT
  l.name AS location,
  z.name AS zone,
  z.capacity,
  z.occupancy,
  z.capacity - z.occupancy AS available,
  r.amount_centavos / 100 AS fixed_fee_pesos
FROM parking_locations l
JOIN parking_zones z ON z.location_id = l.id
LEFT JOIN LATERAL (
  SELECT amount_centavos
  FROM parking_rates r
  WHERE r.zone_id = z.id
    AND r.status = 'ACTIVE'
  ORDER BY r.effective_from DESC
  LIMIT 1
) r ON true
WHERE l.status = 'ACTIVE'
ORDER BY l.name, z.name;
