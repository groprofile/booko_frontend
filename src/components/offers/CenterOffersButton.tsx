import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Tag, Percent, X } from "lucide-react";
import { useActiveOffers } from "../../hooks/useActiveOffers";
import { offersForCheckout, offerHeadline, type Vertical } from "../../lib/offers";

interface CenterOffersButtonProps {
  vertical: Vertical;
  centerId: string;
  centerName: string;
}

/**
 * MyHQ-style "N Offers" entry point on a detail page: a pill button that opens
 * a modal listing every coupon that applies to this specific center, each with
 * its code, discount and terms. The code is shown here for transparency/parity
 * with how customers expect offers to look — it still auto-applies the best
 * one at checkout, this is purely informational.
 */
export default function CenterOffersButton({ vertical, centerId, centerName }: CenterOffersButtonProps) {
  const [open, setOpen] = useState(false);
  const offers = offersForCheckout(useActiveOffers(), vertical, centerId);

  if (offers.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-success/40 bg-success/5 px-3 py-1.5 text-xs font-bold text-success transition-colors hover:bg-success/10"
      >
        <Tag size={13} />
        {offers.length} Offer{offers.length > 1 ? "s" : ""}
        <ChevronDown size={13} />
      </button>

      {/* Rendered via a portal straight into <body> — a fixed-position modal
          anchors to the nearest ancestor with a `transform` set (e.g. any
          animate-fade-in-up wrapper keeps `transform: translateY(0)` after it
          finishes), which silently turns "fixed" into "relative to that box"
          and makes the modal appear off-screen, needing a scroll to find it. */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0F172A]/50 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-[440px] overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
              <div className="flex items-center gap-2 min-w-0">
                <Percent size={16} className="shrink-0 text-success" />
                <p className="truncate text-sm font-bold text-primary-text">Offers at {centerName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-lg p-1 text-muted-text hover:bg-[#F1F5F9]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[calc(80vh-64px)] overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {offers.map((offer) => (
                  <OfferRow key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function OfferRow({ offer }: { offer: ReturnType<typeof offersForCheckout>[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary-text">
            {offer.description ?? offerHeadline(offer)}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-success">{offerHeadline(offer)}</p>
          {!!offer.min_booking_paise && (
            <p className="mt-0.5 text-[11px] text-muted-text">
              On orders above ₹{(offer.min_booking_paise / 100).toLocaleString()}
            </p>
          )}
          <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-dashed border-[#CBD5E1] bg-white px-2 py-1 font-mono text-[11px] font-extrabold tracking-wide text-primary-text">
            {offer.code}
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="mt-0.5 shrink-0 text-muted-text" />
        ) : (
          <ChevronDown size={16} className="mt-0.5 shrink-0 text-muted-text" />
        )}
      </button>
      {expanded && offer.terms && (
        <p className="mt-2.5 border-t border-[#E2E8F0] pt-2.5 text-[11px] leading-relaxed text-muted-text">
          {offer.terms}
        </p>
      )}
    </div>
  );
}
