import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { showToast } from "../../components/admin/Toast";
import { apiPost, getAdminToken, ApiError } from "../../lib/api";

const inputCls =
  "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 placeholder:text-[#94A3B8]";

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<"admin_announcement" | "promo">("admin_announcement");
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  async function handleSend() {
    const token = getAdminToken();
    if (!token) return;
    if (!title.trim() || !body.trim()) {
      showToast("Title and message are required", "error");
      return;
    }
    if (!window.confirm(`Send this ${type === "promo" ? "promo" : "announcement"} to ALL active users? This will push to every registered device.`)) {
      return;
    }
    setSending(true);
    try {
      const res = await apiPost<{ message: string; recipients: number }>(
        "/admin/announcements",
        { title: title.trim(), body: body.trim(), type, imageUrl: imageUrl.trim() || undefined },
        token,
      );
      showToast(`Sent to ${res.recipients} users`, "success");
      setLastResult(`"${title.trim()}" sent to ${res.recipients} users`);
      setTitle("");
      setBody("");
      setImageUrl("");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to send announcement", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminLayout title="Announcements" subtitle="Broadcast a notification to all app users">
      <div className="max-w-xl">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <Megaphone size={18} className="text-[#2563EB]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">New Announcement</p>
              <p className="text-xs text-[#94A3B8]">
                Creates an in-app notification and a push for every active user
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={inputCls}>
                <option value="admin_announcement">Announcement</option>
                <option value="promo">Promo / Offer</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                maxLength={80} placeholder="e.g. Weekend Offer: 20% off coworking day passes" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Message</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                maxLength={300} placeholder="The notification body shown in the app and on the device…"
                className={`${inputCls} resize-none`} />
              <p className="mt-1 text-right text-[10px] text-[#94A3B8]">{body.length}/300</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Image URL (optional)</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…" className={inputCls} />
            </div>
          </div>

          <button onClick={handleSend} disabled={sending}
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60">
            <Send size={13} /> {sending ? "Sending…" : "Send to All Users"}
          </button>

          {lastResult && (
            <p className="mt-3 text-xs font-medium text-emerald-600">✓ {lastResult}</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
