import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { apiGet } from "../lib/api";

interface CouponRow {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  image_url: string | null;
  valid_to: string | null;
}

const GRADIENTS = [
  "linear-gradient(135deg, #92654B 0%, #4A2E1C 100%)",
  "linear-gradient(135deg, #3E7C89 0%, #1F4A54 100%)",
  "linear-gradient(135deg, #6B3A82 0%, #3B1E49 100%)",
  "linear-gradient(135deg, #3730A3 0%, #1E1B4B 100%)",
];

function discountLabel(coupon: CouponRow): string {
  return coupon.discount_type === "percentage"
    ? `Get ${coupon.discount_value}% Off`
    : `Get ₹${coupon.discount_value} Off`;
}

export default function OffersSection() {
  const [offers, setOffers] = useState<CouponRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiGet<CouponRow[]>("/coupons/active")
      .then((rows) => {
        if (!cancelled) setOffers(rows);
      })
      .catch(() => {
        if (!cancelled) setOffers([]);
      });
    return () => { cancelled = true; };
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="w-full bg-[#FFF7ED] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
          Offers &amp; discounts
        </h2>
        <p className="mt-3 max-w-xl text-base text-[#64748B] sm:text-lg">
          Unlock exclusive savings across hotels, coworking spaces and meeting rooms.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((offer, i) => (
            <div
              key={offer.id}
              className="group relative h-[170px] overflow-hidden rounded-2xl shadow-soft transition-transform duration-300 hover:-translate-y-1"
              style={{ background: GRADIENTS[i % GRADIENTS.length] }}
            >
              <div className="relative z-10 flex h-full max-w-[68%] flex-col justify-center gap-1.5 p-5">
                <p className="text-lg font-bold text-white">{discountLabel(offer)}</p>
                <p className="text-xs leading-relaxed text-white/85">
                  {offer.description} <span className="font-bold text-white">{offer.code}</span>
                </p>
                {offer.valid_to && (
                  <p className="mt-0.5 text-[10px] text-white/60">
                    Valid till {new Date(offer.valid_to).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>

              {offer.image_url ? (
                <div className="absolute inset-y-0 right-0 w-[34%]">
                  <img
                    src={offer.image_url}
                    alt=""
                    className="h-full w-full object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                </div>
              ) : (
                <div className="absolute inset-y-0 right-0 flex w-[34%] items-center justify-center overflow-hidden">
                  <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-white/50" />
                  <span className="absolute right-10 top-8 h-1 w-1 rounded-full bg-white/40" />
                  <span className="absolute right-6 bottom-6 h-1 w-1 rounded-full bg-white/40" />
                  <Gift size={56} strokeWidth={1.4} className="text-white/70" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
