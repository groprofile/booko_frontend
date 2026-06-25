import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowUpCircle,
  Clock,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";

type RequestStatus = "pending" | "in_progress" | "resolved";
type Priority = "high" | "medium" | "low";
type FilterTab = "all" | RequestStatus;

interface SpecialRequest {
  id: string;
  bookingId: string;
  guest: string;
  type: string;
  request: string;
  priority: Priority;
  status: RequestStatus;
  time: string;
  avatar: string;
}

const INITIAL_REQUESTS: SpecialRequest[] = [
  { id: "SR001", bookingId: "BK8824", guest: "Priya Mehta", type: "Meeting Room", request: "Need projector + whiteboard setup before 10 AM", priority: "high", status: "pending", time: "09:15 AM", avatar: "P" },
  { id: "SR002", bookingId: "BK8826", guest: "Neha Singh", type: "Meeting Room", request: "Please arrange 3 chairs in Focus Room 1", priority: "medium", status: "pending", time: "09:45 AM", avatar: "N" },
  { id: "SR003", bookingId: "BK8829", guest: "Rohit Kumar", type: "Meeting Room", request: "Team lunch arrangement — need 8 chairs and a side table", priority: "high", status: "in_progress", time: "08:30 AM", avatar: "R" },
  { id: "SR004", bookingId: "BK8810", guest: "Kavita Sharma", type: "Day Pass", request: "Quiet zone desk preferred — working on an important deadline", priority: "low", status: "resolved", time: "Yesterday", avatar: "K" },
  { id: "SR005", bookingId: "BK8812", guest: "Aditya Rao", type: "Meeting Room", request: "Video conferencing setup needed — international call at 3 PM", priority: "high", status: "resolved", time: "Yesterday", avatar: "A" },
  { id: "SR006", bookingId: "BK8815", guest: "Meera Joshi", type: "Day Pass", request: "Ergonomic chair if available", priority: "low", status: "resolved", time: "25 Jun", avatar: "M" },
  { id: "SR007", bookingId: "BK8818", guest: "Suresh Nair", type: "Meeting Room", request: "Tea and coffee for 5 people at 11 AM", priority: "medium", status: "resolved", time: "25 Jun", avatar: "S" },
];

const PRIORITY_BORDER: Record<Priority, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-400",
  low: "border-l-slate-400",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const AVATAR_BG: Record<string, string> = {
  P: "bg-pink-400",
  N: "bg-blue-400",
  R: "bg-orange-400",
  K: "bg-purple-400",
  A: "bg-teal-400",
  M: "bg-rose-400",
  S: "bg-indigo-400",
};

export default function SpecialRequestsPage() {
  const [requests, setRequests] = useState<SpecialRequest[]>(INITIAL_REQUESTS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const inProgressCount = requests.filter((r) => r.status === "in_progress").length;
  const resolvedCount = requests.filter((r) => r.status === "resolved").length;

  const filtered = activeFilter === "all"
    ? requests
    : requests.filter((r) => r.status === activeFilter);

  function updateStatus(id: string, status: RequestStatus) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  return (
    <CenterLayout title="Special Requests" subtitle="Manage guest requests and arrangements">
      {/* Header summary */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
          {pendingCount} Pending
        </span>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
          {inProgressCount} In Progress
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
          {resolvedCount} Resolved
        </span>
        <span className="ml-auto text-xs text-[#94A3B8]">{requests.length} total requests</span>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1.5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeFilter === tab.value
                ? "bg-[#2563EB] text-white shadow-sm"
                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {tab.label}
            {tab.value !== "all" && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeFilter === tab.value ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#64748B]"
              }`}>
                {tab.value === "pending" ? pendingCount : tab.value === "in_progress" ? inProgressCount : resolvedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-[#94A3B8]">No requests in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className={`rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border-l-4 ${PRIORITY_BORDER[req.priority]} overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${AVATAR_BG[req.avatar] ?? "bg-slate-400"}`}>
                    {req.avatar}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-[#0F172A]">{req.guest}</p>
                          <span className="font-mono text-[10px] font-semibold text-[#94A3B8]">{req.bookingId}</span>
                          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#64748B]">
                            {req.type}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#64748B] leading-relaxed">{req.request}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${PRIORITY_STYLE[req.priority]}`}>
                          {PRIORITY_LABEL[req.priority]} Priority
                        </span>
                        {req.status === "resolved" && (
                          <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-700">Resolved</span>
                          </div>
                        )}
                        {req.status === "in_progress" && (
                          <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5">
                            <Clock size={11} className="text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-700">In Progress</span>
                          </div>
                        )}
                        {req.status === "pending" && (
                          <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5">
                            <AlertTriangle size={11} className="text-amber-600" />
                            <span className="text-[10px] font-bold text-amber-700">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1 text-[#94A3B8]">
                        <Clock size={11} />
                        <span className="text-[11px]">Received at {req.time}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(req.id, "in_progress")}
                              className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8]"
                            >
                              <Clock size={12} />
                              Start Working
                            </button>
                            <button
                              onClick={() => updateStatus(req.id, "resolved")}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
                            >
                              <CheckCircle2 size={12} />
                              Mark Resolved
                            </button>
                          </>
                        )}

                        {req.status === "in_progress" && (
                          <>
                            <button
                              onClick={() => updateStatus(req.id, "resolved")}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
                            >
                              <CheckCircle2 size={12} />
                              Mark Resolved
                            </button>
                            <button
                              className="flex items-center gap-1.5 rounded-xl border border-red-300 px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
                            >
                              <ArrowUpCircle size={12} />
                              Escalate
                            </button>
                          </>
                        )}

                        {req.status === "resolved" && (
                          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700">Resolved</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CenterLayout>
  );
}
