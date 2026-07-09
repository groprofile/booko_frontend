import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 1;
let listeners: Array<(toasts: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function showToast(message: string, type: ToastType = "success") {
  const toast: ToastItem = { id: nextId++, message, type };
  toasts = [...toasts, toast];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id);
    emit();
  }, 3000);
}

export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
            t.type === "success" ? "bg-[#0F172A] text-white" : "bg-[#DC2626] text-white"
          }`}
        >
          {t.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
