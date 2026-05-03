"use client";

/**
 * Kid-friendly inline chart for questions whose visual is data
 * (bar / line / pie). Used when the format-rescue judge picks
 * render_chart_via_css — Imagen can't reliably render numerical
 * labels, so we draw the chart with SVG instead.
 *
 * The chart_data field on a question gets surfaced here. The
 * practice runner renders <QuestionChart> wherever it would have
 * rendered <img src={q.image_url}>.
 */

type ChartSpec = {
  kind: "bar" | "line" | "pie";
  title: string;
  xLabel?: string;
  yLabel?: string;
  series: { label: string; value: number }[];
};

const PALETTE = [
  "#7c3aed", // violet-600
  "#4f46e5", // indigo-600
  "#0ea5e9", // sky-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
];

export default function QuestionChart({ chart }: { chart: ChartSpec }) {
  const series = (chart.series ?? []).filter((s) => Number.isFinite(s.value));
  if (series.length === 0) return null;

  const maxValue = Math.max(...series.map((s) => s.value), 1);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-md dark:border-violet-900/40 dark:bg-slate-900">
      <div className="mb-3 text-center text-base font-extrabold text-zinc-900 dark:text-white">
        {chart.title}
      </div>

      {chart.kind === "bar" && (
        <BarChart series={series} maxValue={maxValue} />
      )}
      {chart.kind === "line" && (
        <LineChart series={series} maxValue={maxValue} />
      )}
      {chart.kind === "pie" && <PieChart series={series} />}

      {(chart.xLabel || chart.yLabel) && (
        <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-zinc-500">
          <span>{chart.xLabel ?? ""}</span>
          <span>{chart.yLabel ? `(${chart.yLabel})` : ""}</span>
        </div>
      )}
    </div>
  );
}

function BarChart({
  series,
  maxValue,
}: {
  series: ChartSpec["series"];
  maxValue: number;
}) {
  const W = 320;
  const H = 200;
  const PADDING = 28;
  const innerW = W - PADDING * 2;
  const innerH = H - PADDING * 2;
  const gap = 8;
  const barW = (innerW - gap * (series.length - 1)) / series.length;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto w-full"
      role="img"
      aria-label="bar chart"
    >
      {/* y-axis grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = PADDING + innerH * (1 - t);
        return (
          <g key={i}>
            <line
              x1={PADDING}
              x2={W - PADDING}
              y1={y}
              y2={y}
              stroke="#e4e4e7"
              strokeDasharray={i === 0 ? "" : "3 3"}
              strokeWidth={i === 0 ? 1.5 : 1}
            />
            <text
              x={PADDING - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-zinc-500"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
            >
              {Math.round(maxValue * t)}
            </text>
          </g>
        );
      })}
      {/* bars */}
      {series.map((s, i) => {
        const x = PADDING + i * (barW + gap);
        const h = (s.value / maxValue) * innerH;
        const y = PADDING + innerH - h;
        const color = PALETTE[i % PALETTE.length];
        return (
          <g key={`${i}-${s.label}`}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={4}
              fill={color}
            />
            <text
              x={x + barW / 2}
              y={y - 4}
              textAnchor="middle"
              className="fill-zinc-900 font-bold"
              fontSize="11"
              fontFamily="system-ui, sans-serif"
            >
              {s.value}
            </text>
            <text
              x={x + barW / 2}
              y={H - 8}
              textAnchor="middle"
              className="fill-zinc-700"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({
  series,
  maxValue,
}: {
  series: ChartSpec["series"];
  maxValue: number;
}) {
  const W = 320;
  const H = 200;
  const PADDING = 28;
  const innerW = W - PADDING * 2;
  const innerH = H - PADDING * 2;
  const stepX = innerW / Math.max(1, series.length - 1);
  const points = series.map((s, i) => {
    const x = PADDING + i * stepX;
    const y = PADDING + innerH - (s.value / maxValue) * innerH;
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = PADDING + innerH * (1 - t);
        return (
          <line
            key={i}
            x1={PADDING}
            x2={W - PADDING}
            y1={y}
            y2={y}
            stroke="#e4e4e7"
            strokeDasharray={i === 0 ? "" : "3 3"}
            strokeWidth={i === 0 ? 1.5 : 1}
          />
        );
      })}
      <path d={path} fill="none" stroke="#7c3aed" strokeWidth={3} strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={5} fill="#7c3aed" />
          <text
            x={x}
            y={y - 10}
            textAnchor="middle"
            className="fill-zinc-900 font-bold"
            fontSize="11"
            fontFamily="system-ui, sans-serif"
          >
            {series[i].value}
          </text>
          <text
            x={x}
            y={H - 8}
            textAnchor="middle"
            className="fill-zinc-700"
            fontSize="10"
            fontFamily="system-ui, sans-serif"
          >
            {series[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function PieChart({ series }: { series: ChartSpec["series"] }) {
  const total = series.reduce((acc, s) => acc + s.value, 0);
  if (total <= 0) return null;
  const W = 280;
  const H = 220;
  const cx = 90;
  const cy = H / 2;
  const r = 80;
  let startAngle = -Math.PI / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full" role="img">
      {series.map((s, i) => {
        const portion = s.value / total;
        const endAngle = startAngle + portion * 2 * Math.PI;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = portion > 0.5 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
        const color = PALETTE[i % PALETTE.length];
        const slice = (
          <path key={`s-${i}`} d={d} fill={color} stroke="#fff" strokeWidth={2} />
        );
        startAngle = endAngle;
        return slice;
      })}
      {/* legend */}
      {series.map((s, i) => (
        <g
          key={`l-${i}`}
          transform={`translate(${cx + r + 20}, ${20 + i * 22})`}
        >
          <rect width={14} height={14} rx={3} fill={PALETTE[i % PALETTE.length]} />
          <text
            x={20}
            y={11}
            className="fill-zinc-900 font-semibold"
            fontSize="11"
            fontFamily="system-ui, sans-serif"
          >
            {s.label} ({s.value})
          </text>
        </g>
      ))}
    </svg>
  );
}
