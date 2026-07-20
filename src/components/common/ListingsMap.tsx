import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";

export interface MapListingItem {
  id: string;
  name: string;
  image: string;
  priceLabel: string;
  lat: number;
  lng: number;
  href: string;
}

interface ListingsMapProps {
  items: MapListingItem[];
  fallbackCenter: { lat: number; lng: number };
}

const pinIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:30px;height:30px;
      display:flex;align-items:center;justify-content:center;
      border-radius:9999px 9999px 9999px 2px;
      transform:rotate(45deg);
      background:#2563eb;
      border:2.5px solid #fff;
      box-shadow:0 3px 8px rgba(15,23,42,0.35);
    ">
      <div style="width:9px;height:9px;border-radius:9999px;background:#fff;transform:rotate(-45deg);"></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
  popupAnchor: [0, -26],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points, { padding: [32, 32] });
    }
    // Only re-fit when the actual point set changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

/**
 * Shared listing-page map: pins every item with real coordinates on an
 * OpenStreetMap/Leaflet base (no API key required). Used by the Map toggle
 * on every listing page — Day Pass, Hotel, Meeting Room, Monthly Pass,
 * Virtual Office, Coworking.
 */
export default function ListingsMap({ items, fallbackCenter }: ListingsMapProps) {
  const withCoords = useMemo(
    () => items.filter((i) => Number.isFinite(i.lat) && Number.isFinite(i.lng) && (i.lat !== 0 || i.lng !== 0)),
    [items],
  );
  const points = useMemo<[number, number][]>(() => withCoords.map((i) => [i.lat, i.lng]), [withCoords]);
  const initialCenter: [number, number] = points[0] ?? [fallbackCenter.lat, fallbackCenter.lng];

  return (
    <div className="relative h-full w-full">
      <MapContainer center={initialCenter} zoom={12} scrollWheelZoom className="h-full w-full grayscale-[8%]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <FitBounds points={points} />
        {withCoords.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]} icon={pinIcon}>
            <Popup>
              <div className="w-40">
                <img src={item.image} alt={item.name} className="h-20 w-full rounded-sm object-cover" />
                <p className="mt-1.5 truncate text-[13px] font-bold text-primary-text">{item.name}</p>
                <p className="text-xs font-semibold text-primary-blue">{item.priceLabel}</p>
                <Link to={item.href} className="mt-1 block text-xs font-bold text-primary-blue hover:underline">
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {withCoords.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 top-4 rounded-sm border border-border bg-card/95 px-3 py-2.5 text-xs font-medium text-secondary-text shadow-soft backdrop-blur-sm">
          None of these workspaces have a pinned location yet — showing the city map instead.
        </div>
      )}
    </div>
  );
}
