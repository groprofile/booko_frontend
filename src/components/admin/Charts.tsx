import { type MonthlyPoint } from "../../context/AdminContext";

// ─── Line Area Chart ─────────────────────────────────────────────────────────

interface LineChartProps {
  data: MonthlyPoint[];
  color?: string;
  height?: number;
  yLabel?: string;
  prefix?: string;
  suffix?: string;
}

export function LineAreaChart({ data, color = "#2563EB", height = 180, yLabel, prefix = "", suffix = "" }: LineChartProps) {
  const W = 600; const H = height;
  const PAD = { top: 16, bottom: 28, left: 48, right: 16 };
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals) * 0.9;
  const max = Math.max(...vals) * 1.05;
  const cx = (i: number) => PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right);
  const cy = (v: number) => PAD.top + ((max - v) / (max - min)) * (H - PAD.top - PAD.bottom);
  const pts = data.map((d, i) => `${cx(i)},${cy(d.value)}`).join(" ");
  const area = `M${cx(0)},${cy(data[0].value)} ${data.map((d, i) => `L${cx(i)},${cy(d.value)}`).join(" ")} L${cx(data.length - 1)},${H - PAD.bottom} L${cx(0)},${H - PAD.bottom} Z`;

  const yTicks = 4;
  const step = (max - min) / yTicks;

  return (
    <div className="w-full">
      {yLabel && <p className="mb-1 text-xs text-[#94A3B8]">{yLabel}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = min + step * (yTicks - i);
          const y = cy(v);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94A3B8">
                {prefix}{v.toFixed(v < 10 ? 1 : 0)}{suffix}
              </text>
            </g>
          );
        })}
        {/* Area */}
        <path d={area} fill={`url(#grad-${color.replace("#", "")})`} />
        {/* Line */}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i} cx={cx(i)} cy={cy(d.value)} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
        ))}
        {/* X-axis labels */}
        {data.map((d, i) => {
          if (data.length > 8 && i % 2 !== 0) return null;
          return (
            <text key={i} x={cx(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#94A3B8">
              {d.month}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

interface BarItem { label: string; value: number; color: string; }

interface BarChartProps { data: BarItem[]; total?: number; }

export function BarChart({ data, total }: BarChartProps) {
  const max = total ?? Math.max(...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-[#0F172A]">{item.label}</span>
            </div>
            <span className="font-bold text-[#0F172A]">{item.value}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

interface DonutItem { label: string; value: number; color: string; }

interface DonutChartProps { data: DonutItem[]; size?: number; }

export function DonutChart({ data, size = 140 }: DonutChartProps) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const R = 50; const CX = 60; const CY = 60; const stroke = 14;
  let cumulative = -90;

  const slices = data.map((item) => {
    const pct = item.value / total;
    const angle = pct * 360;
    const start = cumulative;
    cumulative += angle;
    const end = cumulative;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const sx = CX + R * Math.cos(toRad(start));
    const sy = CY + R * Math.sin(toRad(start));
    const ex = CX + R * Math.cos(toRad(end - 0.5));
    const ey = CY + R * Math.sin(toRad(end - 0.5));
    const large = angle > 180 ? 1 : 0;
    return { ...item, path: `M${CX} ${CY} L${sx} ${sy} A${R} ${R} 0 ${large} 1 ${ex} ${ey} Z`, pct };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 120 120" className="shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" />
        ))}
        <circle cx={CX} cy={CY} r={R - stroke} fill="white" />
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F172A">{total}%</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="8" fill="#94A3B8">Total</text>
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[#64748B]">{item.label}</span>
            <span className="ml-auto font-bold text-[#0F172A]">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sparkline (for KPI cards) ────────────────────────────────────────────────

interface SparklineProps { data: number[]; color?: string; width?: number; height?: number; }

export function Sparkline({ data, color = "#2563EB", width = 80, height = 32 }: SparklineProps) {
  const min = Math.min(...data); const max = Math.max(...data);
  const cx = (i: number) => (i / (data.length - 1)) * width;
  const cy = (v: number) => height - ((v - min) / (max - min || 1)) * height;
  const pts = data.map((v, i) => `${cx(i)},${cy(v)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
