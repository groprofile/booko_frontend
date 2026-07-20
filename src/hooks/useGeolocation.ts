import { useCallback, useState } from "react";

export type GeoStatus = "idle" | "prompting" | "granted" | "denied" | "unsupported" | "error";

export interface GeoCoords {
  lat: number;
  lng: number;
}

interface UseGeolocation {
  coords: GeoCoords | null;
  status: GeoStatus;
  error: string | null;
  request: () => void;
  clear: () => void;
}

/**
 * Thin wrapper over the browser Geolocation API for the "Near me" option.
 * Never throws — a denied/unsupported result just sets `status` so callers can
 * degrade gracefully (keep current results).
 */
export function useGeolocation(): UseGeolocation {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setError("Location isn't supported on this device.");
      return;
    }
    setStatus("prompting");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied."
            : "Couldn't get your location.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { coords, status, error, request, clear };
}
