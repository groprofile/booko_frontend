import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface CouponImagePickerProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

// Required banner-image picker used by every coupon create form (Admin,
// vendor owner, center manager) — a coupon only appears in the customer
// app's banner carousel once it has an image, so this is enforced here
// rather than as a DB constraint (existing imageless coupons stay valid,
// just non-promotional).
export default function CouponImagePicker({ file, onChange, error }: CouponImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");

  function handleFile(f: File | null) {
    setLocalError("");
    if (!f) {
      onChange(null);
      setPreview(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setLocalError("Only JPEG and PNG images are allowed");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setLocalError("Image must be under 5MB");
      return;
    }
    onChange(f);
    setPreview(URL.createObjectURL(f));
  }

  function clear() {
    handleFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#0F172A]">Banner Image *</label>
      <p className="text-[11px] text-[#94A3B8]">Shown as a banner in the customer app. Required to publish this coupon.</p>

      {preview || file ? (
        <div className="relative overflow-hidden rounded-xl border border-[#E2E8F0]">
          <img src={preview ?? undefined} alt="Coupon banner preview" className="h-32 w-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] py-6 text-[#94A3B8] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
        >
          <ImagePlus size={20} />
          <span className="text-xs font-semibold">Click to upload banner image</span>
          <span className="text-[10px]">JPEG or PNG, up to 5MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {(localError || error) && <p className="text-xs text-red-600">{localError || error}</p>}
    </div>
  );
}
