import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import type { ActiveOffer } from "../lib/offers";

// Active offers change rarely, but a coupon can expire or hit its usage cap at
// any moment — caching forever for the tab's lifetime meant a customer could
// keep seeing (and trying to use) a discount that had already gone stale,
// matching the exact bug of "shows a discount that doesn't deduct at payment".
// Cache for a short window instead, same order as the backend's own 60s cache
// (coupons.service.ts ACTIVE_COUPONS_TTL) so the two can't drift far apart.
const CACHE_TTL_MS = 60_000;

let cache: ActiveOffer[] | null = null;
let cachedAt = 0;
let inFlight: Promise<ActiveOffer[]> | null = null;

function load(): Promise<ActiveOffer[]> {
  if (cache && Date.now() - cachedAt < CACHE_TTL_MS) return Promise.resolve(cache);
  if (!inFlight) {
    inFlight = apiGet<ActiveOffer[]>("/coupons/active")
      .then((rows) => {
        cache = rows ?? [];
        cachedAt = Date.now();
        return cache;
      })
      .catch(() => {
        cache = cache ?? [];
        return cache;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/** Active customer-facing offers (auto-applied at checkout). Empty until loaded. */
export function useActiveOffers(): ActiveOffer[] {
  const [offers, setOffers] = useState<ActiveOffer[]>(cache ?? []);

  useEffect(() => {
    let cancelled = false;
    load().then((rows) => {
      if (!cancelled) setOffers(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return offers;
}
