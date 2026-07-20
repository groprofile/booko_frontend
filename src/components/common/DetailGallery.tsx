import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface DetailGalleryProps {
  images: string[];
  name: string;
  badge?: string;
}

/**
 * Shared myHQ-style detail gallery: one large image + up to 3 stacked
 * thumbnails, all sharing the same rounded-sm radius, with "View all N
 * photos" overlaid on the image itself rather than as a separate row below.
 */
export default function DetailGallery({ images, name, badge }: DetailGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Always render the same two-column frame regardless of how many real
  // photos a center has: pad with the main photo when there aren't enough
  // extras, so the gallery never collapses to a different shape/height.
  const extraImages = images.slice(1, 4);
  const displayThumbs = extraImages.length > 0 ? extraImages : [images[0]];
  const mobileThumbs = images.length > 1 ? images.slice(1, 6) : [images[0]];
  const photoCountLabel = `View all ${images.length} photo${images.length === 1 ? "" : "s"}`;

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
    <div className="relative">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_200px]">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group relative aspect-[16/10] w-full overflow-hidden rounded-sm sm:aspect-auto sm:h-[400px]"
        >
          <img
            src={images[0]}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>

        <div
          className="hidden gap-2 sm:grid sm:h-[400px]"
          style={{ gridTemplateRows: `repeat(${displayThumbs.length}, 1fr)` }}
        >
          {displayThumbs.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => openLightbox(extraImages.length > 0 ? index + 1 : 0)}
              className="group relative overflow-hidden rounded-sm"
            >
              <img
                src={src}
                alt={`${name} photo ${extraImages.length > 0 ? index + 2 : 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {mobileThumbs.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => openLightbox(images.length > 1 ? index + 1 : 0)}
              className="relative h-20 w-28 shrink-0 overflow-hidden rounded-sm"
            >
              <img src={src} alt={`${name} photo ${images.length > 1 ? index + 2 : 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {badge && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-bold text-danger">
          {badge}
        </span>
      )}

      <button
        type="button"
        onClick={() => openLightbox(0)}
        className="absolute bottom-3 right-3 hidden items-center gap-2 rounded-sm border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-secondary-text hover:border-muted-text sm:inline-flex"
      >
        {photoCountLabel}
      </button>
      <button
        type="button"
        onClick={() => openLightbox(0)}
        className="mt-2 inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-secondary-text sm:hidden"
      >
        {photoCountLabel}
      </button>

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
              className="max-h-full max-w-full rounded-sm object-contain"
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
