import { type LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  accent?: string;
}

export default function MetricCard({ label, value, sub, trend, icon: Icon, iconColor = "#2563EB", iconBg = "#EFF6FF", accent }: Props) {
  const up = trend !== undefined && trend >= 0;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      {accent && (
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl" style={{ backgroundColor: accent }} />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{label}</p>
          <p className="mt-2 text-2xl font-extrabold leading-none tracking-tight text-[#0F172A]">{value}</p>
          {sub && <p className="mt-1.5 text-xs text-[#94A3B8]">{sub}</p>}
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${up ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
              {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
