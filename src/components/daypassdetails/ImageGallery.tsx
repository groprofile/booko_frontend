import { useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Show the hero + at most two supporting thumbnails. Everything beyond that
  // collapses into a "+N more" tile that opens the full lightbox.
  const thumbs = images.slice(1, 3);
  const remaining = images.length - 3;

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

  return (
    <div>
      <div className={`grid grid-cols-1 gap-3 ${thumbs.length > 0 ? "sm:grid-cols-[minmax(0,1fr)_260px]" : ""}`}>
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group relative aspect-[16/10] w-full overflow-hidden rounded-[22px] shadow-soft-lg ring-1 ring-[#1D4ED8]/10 sm:aspect-auto sm:h-[440px]"
        >
          <img
            src={images[0]}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* Soft blue wash for depth + legibility of any overlaid chrome. */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F172A]/25 via-transparent to-transparent" />
        </button>

        {thumbs.length > 0 && (
          <div className="hidden grid-rows-2 gap-3 sm:grid">
            {thumbs.map((src, index) => {
              const isLastVisible = index === thumbs.length - 1;
              const showMore = isLastVisible && remaining > 0;
              return (
                <button
                  key={src + index}
                  type="button"
                  onClick={() => openLightbox(showMore ? 3 : index + 1)}
                  className="group relative overflow-hidden rounded-[18px] shadow-soft ring-1 ring-[#1D4ED8]/10"
                >
                  <img
                    src={src}
                    alt={`${name} photo ${index + 2}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  {showMore && (
                    // Blue glassmorphism "+N more" tile.
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 border border-white/20 bg-gradient-to-br from-[#1D4ED8]/70 to-[#2563EB]/40 backdrop-blur-md">
                      <Images size={20} className="text-white/90" />
                      <span className="text-base font-bold text-white">+{remaining} More</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile: horizontal strip of the same first few frames. */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:hidden">
            {images.slice(1, 6).map((src, index) => (
              <button
                key={src + index}
                type="button"
                onClick={() => openLightbox(index + 1)}
                className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[14px] ring-1 ring-[#1D4ED8]/10"
              >
                <img src={src} alt={`${name} photo ${index + 2}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#2563EB]/25 bg-[#2563EB]/10 px-4 py-2 text-sm font-semibold text-[#1D4ED8] backdrop-blur-sm transition-colors hover:border-[#2563EB]/40 hover:bg-[#2563EB]/15"
        >
          <Images size={16} />
          View all {images.length} photos
        </button>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#0B1220]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <p className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur-md">
              {activeIndex + 1} / {images.length}
            </p>
            <button
              type="button"
              aria-label="Close gallery"
              onClick={() => setLightboxOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
            <img
              src={images[activeIndex]}
              alt={`${name} photo ${activeIndex + 1}`}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              aria-label="Previous photo"
              onClick={showPrev}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-[#2563EB]/40 sm:left-6"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={showNext}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-[#2563EB]/40 sm:right-6"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
