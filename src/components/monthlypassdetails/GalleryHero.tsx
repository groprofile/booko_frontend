import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Heart, Share2, Video, X } from "lucide-react";

interface GalleryHeroProps {
  images: string[];
  name: string;
}

export default function GalleryHero({ images, name }: GalleryHeroProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [shared, setShared] = useState(false);

  const thumbs = images.slice(1, 5);

  function openLightbox(index: number) {
    setActiveIndex(index);
    setLightboxOpen(true);
  }

  function showPrev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function showNext() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function handleShare() {
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_240px]">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group relative aspect-[16/10] w-full overflow-hidden rounded-[20px] shadow-soft-lg sm:aspect-auto sm:h-[420px]"
        >
          <img
            src={images[0]}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#0F172A]/70 px-3 py-1.5 text-xs font-semibold text-white">
            <Camera size={13} />
            {images.length} Photos
          </span>
        </button>

        <div className="hidden grid-rows-4 gap-3 sm:grid">
          {thumbs.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => openLightbox(index + 1)}
              className="group relative overflow-hidden rounded-[16px] shadow-soft"
            >
              <img
                src={src}
                alt={`${name} photo ${index + 2}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
              {index === thumbs.length - 1 && (
                <span className="absolute inset-0 flex items-center justify-center bg-[#0F172A]/45 text-sm font-semibold text-white">
                  View All Photos
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto sm:hidden">
          {images.slice(1, 6).map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => openLightbox(index + 1)}
              className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[14px]"
            >
              <img src={src} alt={`${name} photo ${index + 2}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-soft hover:border-[#94A3B8]"
        >
          360° Tour
        </button>
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-soft hover:border-[#94A3B8]"
        >
          <Video size={15} />
          Video Walkthrough
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-soft hover:border-[#94A3B8]"
        >
          <Share2 size={15} />
          {shared ? "Link Copied!" : "Share"}
        </button>
        <button
          type="button"
          onClick={() => setWishlisted((v) => !v)}
          className={
            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-soft transition-colors " +
            (wishlisted ? "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]" : "border-[#E2E8F0] bg-white text-[#334155] hover:border-[#94A3B8]")
          }
        >
          <Heart size={15} className={wishlisted ? "fill-[#DC2626]" : ""} />
          {wishlisted ? "Saved" : "Wishlist"}
        </button>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#0F172A]/95">
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-semibold text-white">
              {activeIndex + 1} / {images.length}
            </p>
            <button
              type="button"
              aria-label="Close gallery"
              onClick={() => setLightboxOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
            <img
              src={images[activeIndex]}
              alt={`${name} photo ${activeIndex + 1}`}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
            <button
              type="button"
              aria-label="Previous photo"
              onClick={showPrev}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:left-6"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={showNext}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:right-6"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
