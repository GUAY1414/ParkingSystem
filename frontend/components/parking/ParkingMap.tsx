"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../../lib/supabase";

const icon = L.divIcon({
  html: '<div style="width:34px;height:34px;border-radius:50% 50% 50% 4px;background:#176b87;color:white;display:grid;place-items:center;transform:rotate(-45deg);box-shadow:0 8px 18px rgba(16,35,63,.25)"><span style="transform:rotate(45deg);font-size:17px">P</span></div>',
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

type ParkingLocation = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  parking_zones: Array<{ id: string; name: string; capacity: number; occupancy: number }>;
};

export default function ParkingMap({ onSelectLocation }: { onSelectLocation?: (location: ParkingLocation) => void }) {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);

  useEffect(() => {
    async function loadLocations() {
      if (!supabase) return;
      const { data } = await supabase
        .from("parking_locations")
        .select("id,name,address,latitude,longitude,parking_zones(id,name,capacity,occupancy,status)")
        .eq("status", "ACTIVE")
        .order("name");
      setLocations((data ?? []) as unknown as ParkingLocation[]);
    }
    loadLocations();
  }, []);

  const center: [number, number] = locations.length
    ? [Number(locations[0].latitude), Number(locations[0].longitude)]
    : [14.5906, 120.9822];

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom style={{ height: "100%", minHeight: 600, width: "100%" }}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[Number(location.latitude), Number(location.longitude)]}
          icon={icon}
          eventHandlers={{ click: () => onSelectLocation?.(location) }}
        >
          <Popup>
            <strong>{location.name}</strong><br />
            {location.parking_zones?.map((zone) => (
              <span key={zone.id} style={{ display: "block", marginTop: 4 }}>
                {zone.name}: {zone.capacity - zone.occupancy} available
              </span>
            ))}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
