interface Props {
  status: string;
  size?: "sm" | "md";
}

const MAP: Record<string, { label: string; bg: string; text: string }> = {
  // Vendor statuses
  approved:         { label: "Approved",       bg: "#DCFCE7", text: "#15803D" },
  pending:          { label: "Pending",         bg: "#FEF9C3", text: "#92400E" },
  under_review:     { label: "Under Review",    bg: "#DBEAFE", text: "#1D4ED8" },
  rejected:         { label: "Rejected",        bg: "#FEE2E2", text: "#B91C1C" },
  blocked:          { label: "Blocked",         bg: "#F1F5F9", text: "#475569" },
  draft:            { label: "Draft",           bg: "#F8FAFC", text: "#94A3B8" },
  // Booking statuses
  confirmed:        { label: "Confirmed",       bg: "#DCFCE7", text: "#15803D" },
  completed:        { label: "Completed",       bg: "#EFF6FF", text: "#1D4ED8" },
  cancelled:        { label: "Cancelled",       bg: "#FEE2E2", text: "#B91C1C" },
  no_show:          { label: "No Show",         bg: "#FEF3C7", text: "#92400E" },
  // Payment statuses
  paid:             { label: "Paid",            bg: "#DCFCE7", text: "#15803D" },
  refunded:         { label: "Refunded",        bg: "#F3E8FF", text: "#7C3AED" },
  failed:           { label: "Failed",          bg: "#FEE2E2", text: "#B91C1C" },
  partial_refund:   { label: "Partial Refund",  bg: "#FEF3C7", text: "#92400E" },
  // Settlement statuses
  processing:       { label: "Processing",      bg: "#DBEAFE", text: "#1D4ED8" },
  // Center statuses
  live:             { label: "Live",            bg: "#DCFCE7", text: "#15803D" },
  inactive:         { label: "Inactive",        bg: "#F1F5F9", text: "#475569" },
  pending_approval: { label: "Pending Approval",bg: "#FEF9C3", text: "#92400E" },
  // KYC / bank
  submitted:        { label: "Submitted",       bg: "#DBEAFE", text: "#1D4ED8" },
  verified:         { label: "Verified",        bg: "#DCFCE7", text: "#15803D" },
  not_submitted:    { label: "Not Submitted",   bg: "#F1F5F9", text: "#94A3B8" },
  // User statuses
  active:           { label: "Active",          bg: "#DCFCE7", text: "#15803D" },
  // Ticket statuses
  open:             { label: "Open",            bg: "#FEF3C7", text: "#92400E" },
  in_progress:      { label: "In Progress",     bg: "#DBEAFE", text: "#1D4ED8" },
  resolved:         { label: "Resolved",        bg: "#DCFCE7", text: "#15803D" },
  closed:           { label: "Closed",          bg: "#F1F5F9", text: "#64748B" },
  // Ticket priorities
  low:              { label: "Low",             bg: "#F8FAFC", text: "#64748B" },
  medium:           { label: "Medium",          bg: "#FEF9C3", text: "#92400E" },
  high:             { label: "High",            bg: "#FEE2E2", text: "#B91C1C" },
  urgent:           { label: "Urgent",          bg: "#FF000020", text: "#DC2626" },
};

export default function StatusBadge({ status, size = "md" }: Props) {
  const cfg = MAP[status] ?? { label: status, bg: "#F1F5F9", text: "#64748B" };
  const px = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${px}`}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
