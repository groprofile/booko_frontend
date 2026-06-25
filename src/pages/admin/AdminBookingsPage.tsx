import { useState } from "react";
import { Search, Download, X, RefreshCw, CheckCircle, Phone, Mail, FileText } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin, type BookingStatus, type PaymentStatus, type ProductType } from "../../context/AdminContext";

const PRODUCTS: Array<ProductType | "All"> = ["All", "Day Pass", "Meeting Room", "Monthly Pass", "Virtual Office", "Hotel Room", "Hourly Stay", "Full Day Stay"];

export default function AdminBookingsPage() {
  const { bookings, cancelBooking, refundBooking } = useAdmin();
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<ProductType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [payFilter, setPayFilter] = useState<PaymentStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchQ = !q || b.id.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q) || b.customerMobile.includes(q) || b.vendorName.toLowerCase().includes(q) || b.centerName.toLowerCase().includes(q) || b.city.toLowerCase().includes(q);
    const matchP = productFilter === "All" || b.product === productFilter;
    const matchS = statusFilter === "all" || b.bookingStatus === statusFilter;
    const matchPay = payFilter === "all" || b.paymentStatus === payFilter;
    return matchQ && matchP && matchS && matchPay;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const selectedBooking = selected ? bookings.find((b) => b.id === selected) : null;

  const totalAmount = bookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.amount, 0);
  const totalCommission = bookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.commission, 0);

  return (
    <AdminLayout title="Booking Management" subtitle={`${bookings.length} total bookings`}>
      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Bookings", value: bookings.length, color: "#2563EB" },
          { label: "Paid Bookings", value: bookings.filter(b => b.paymentStatus === "paid").length, color: "#16A34A" },
          { label: "Gross Revenue", value: `₹${(totalAmount / 1000).toFixed(1)}K`, color: "#7C3AED" },
          { label: "Commission Earned", value: `₹${(totalCommission / 1000).toFixed(1)}K`, color: "#D97706" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#64748B]">{m.label}</p>
            <p className="mt-1 text-xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search booking ID, customer, vendor…"
            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <select value={productFilter} onChange={(e) => { setProductFilter(e.target.value as ProductType | "All"); setPage(1); }}
          className="h-9 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm outline-none focus:border-[#2563EB]">
          {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as BookingStatus | "all"); setPage(1); }}
          className="h-9 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm outline-none focus:border-[#2563EB]">
          <option value="all">All Status</option>
          {(["confirmed", "completed", "cancelled", "pending", "no_show"] as BookingStatus[]).map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select value={payFilter} onChange={(e) => { setPayFilter(e.target.value as PaymentStatus | "all"); setPage(1); }}
          className="h-9 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm outline-none focus:border-[#2563EB]">
          <option value="all">All Payment</option>
          {(["paid", "pending", "refunded", "failed"] as PaymentStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="flex h-9 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#64748B] hover:bg-[#F8FAFC]">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                {["Booking ID", "Customer", "Product", "Vendor · Center", "City", "Date", "Amount", "Payment", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((b) => (
                <tr key={b.id}
                  onClick={() => setSelected(b.id === selected ? null : b.id)}
                  className={`cursor-pointer border-b border-[#F8FAFC] transition-colors ${selected === b.id ? "bg-[#EFF6FF]" : "hover:bg-[#F8FAFC]"}`}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[#2563EB]">{b.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0F172A]">{b.customerName}</p>
                    <p className="text-xs text-[#94A3B8]">{b.customerMobile}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#475569]">{b.product}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-[#0F172A]">{b.vendorName}</p>
                    <p className="text-[11px] text-[#94A3B8]">{b.centerName}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">{b.city}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">{b.date}</td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0F172A]">₹{b.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} size="sm" /></td>
                  <td className="px-4 py-3"><StatusBadge status={b.bookingStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {b.bookingStatus !== "cancelled" && (
                        <button onClick={(e) => { e.stopPropagation(); cancelBooking(b.id); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#FEE2E2] text-[#DC2626]" title="Cancel">
                          <X size={13} />
                        </button>
                      )}
                      {b.paymentStatus === "paid" && (
                        <button onClick={(e) => { e.stopPropagation(); refundBooking(b.id); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F3E8FF] text-[#7C3AED]" title="Refund">
                          <RefreshCw size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-[#94A3B8]">No bookings match the selected filters.</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#F1F5F9] px-4 py-3">
            <p className="text-xs text-[#94A3B8]">{filtered.length} bookings · Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium ${page === i + 1 ? "bg-[#2563EB] text-white" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selectedBooking && (
        <div className="fixed inset-y-0 right-0 z-40 flex w-[360px] flex-col border-l border-[#E2E8F0] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
            <div>
              <p className="font-bold text-[#0F172A]">Booking Details</p>
              <p className="text-xs font-mono text-[#2563EB]">{selectedBooking.id}</p>
            </div>
            <button onClick={() => setSelected(null)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
              <X size={15} className="text-[#64748B]" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4 flex gap-2">
              <StatusBadge status={selectedBooking.bookingStatus} />
              <StatusBadge status={selectedBooking.paymentStatus} />
              {selectedBooking.refundStatus && <StatusBadge status={selectedBooking.refundStatus} size="sm" />}
            </div>

            {[
              { section: "Customer", rows: [
                { label: "Name", value: selectedBooking.customerName },
                { label: "Mobile", value: selectedBooking.customerMobile },
                { label: "Email", value: selectedBooking.customerEmail },
              ]},
              { section: "Booking", rows: [
                { label: "Product", value: selectedBooking.product },
                { label: "Vendor", value: selectedBooking.vendorName },
                { label: "Center", value: selectedBooking.centerName },
                { label: "City", value: selectedBooking.city },
                { label: "Date", value: selectedBooking.date },
                { label: "Time", value: selectedBooking.time },
                { label: "Check-in OTP", value: selectedBooking.checkinOtp || "—" },
              ]},
              { section: "Financials", rows: [
                { label: "Amount", value: `₹${selectedBooking.amount.toLocaleString("en-IN")}` },
                { label: "Commission", value: `₹${selectedBooking.commission}` },
                { label: "Invoice", value: selectedBooking.invoiceGenerated ? "Generated" : "Pending" },
              ]},
            ].map((sec) => (
              <div key={sec.section} className="mb-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{sec.section}</p>
                <div className="rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] divide-y divide-[#F1F5F9]">
                  {sec.rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between px-3 py-2.5">
                      <span className="text-xs text-[#94A3B8]">{r.label}</span>
                      <span className="text-xs font-semibold text-[#0F172A]">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Actions</p>
              <button className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-xs hover:bg-[#F8FAFC]">
                <FileText size={13} className="text-[#64748B]" /> Download Invoice
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-xs hover:bg-[#F8FAFC]">
                <Mail size={13} className="text-[#64748B]" /> Resend Confirmation
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-xs hover:bg-[#F8FAFC]">
                <Phone size={13} className="text-[#64748B]" /> Contact Customer
              </button>
              {selectedBooking.bookingStatus !== "cancelled" && (
                <button onClick={() => { cancelBooking(selectedBooking.id); setSelected(null); }}
                  className="flex items-center gap-2 rounded-xl bg-[#FEE2E2] px-3 py-2.5 text-xs font-bold text-[#DC2626] hover:bg-[#FECACA]">
                  <X size={13} /> Cancel Booking
                </button>
              )}
              {selectedBooking.paymentStatus === "paid" && (
                <button onClick={() => { refundBooking(selectedBooking.id); setSelected(null); }}
                  className="flex items-center gap-2 rounded-xl bg-[#F3E8FF] px-3 py-2.5 text-xs font-bold text-[#7C3AED] hover:bg-[#EDE9FE]">
                  <RefreshCw size={13} /> Process Refund
                </button>
              )}
              {selectedBooking.bookingStatus === "confirmed" && (
                <button className="flex items-center gap-2 rounded-xl bg-[#DCFCE7] px-3 py-2.5 text-xs font-bold text-[#15803D] hover:bg-[#BBF7D0]">
                  <CheckCircle size={13} /> Mark Checked-In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
