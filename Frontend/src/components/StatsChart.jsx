// ─────────────────────────────────────────
// components/StatsChart.jsx
// Displays monthly report stats as a
// bar chart using Chart.js via
// react-chartjs-2.
// Shows total, pending, resolved counts
// for the last 6 months.
//
// Used in:
// - AuthorityDashboard.jsx
// - AdminDashboard.jsx
// ─────────────────────────────────────────

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { BarChart2 } from "lucide-react";

// ── Register Chart.js modules ───────────
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatsChart = ({ monthlyData = [], title = "Monthly Report Overview" }) => {

  // ── Empty state ─────────────────────────
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold text-base">{title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <BarChart2 className="w-10 h-10 text-gray-700" />
          <p className="text-gray-500 text-sm">
            No report data available yet
          </p>
          <p className="text-gray-700 text-xs">
            Data will appear once reports are submitted
          </p>
        </div>
      </div>
    );
  }

  // ── Extract labels and datasets ─────────
  const labels   = monthlyData.map((d) => d.month);
  const total    = monthlyData.map((d) => Number(d.total    || 0));
  const pending  = monthlyData.map((d) => Number(d.pending  || 0));
  const resolved = monthlyData.map((d) => Number(d.resolved || 0));

  // ── Chart data config ───────────────────
  const data = {
    labels,
    datasets: [
      {
        label:           "Total",
        data:            total,
        backgroundColor: "rgba(99, 102, 241, 0.7)",  // indigo
        borderColor:     "rgba(99, 102, 241, 1)",
        borderWidth:     1,
        borderRadius:    6,
        borderSkipped:   false,
      },
      {
        label:           "Pending",
        data:            pending,
        backgroundColor: "rgba(234, 179, 8, 0.7)",   // yellow
        borderColor:     "rgba(234, 179, 8, 1)",
        borderWidth:     1,
        borderRadius:    6,
        borderSkipped:   false,
      },
      {
        label:           "Resolved",
        data:            resolved,
        backgroundColor: "rgba(34, 197, 94, 0.7)",   // green
        borderColor:     "rgba(34, 197, 94, 1)",
        borderWidth:     1,
        borderRadius:    6,
        borderSkipped:   false,
      },
    ],
  };

  // ── Chart options ───────────────────────
  const options = {
    responsive:          true,
    maintainAspectRatio: true,
    aspectRatio:         2,
    interaction: {
      mode:      "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        align:    "end",
        labels: {
          color:      "#9ca3af",
          boxWidth:   12,
          boxHeight:  12,
          borderRadius: 4,
          padding:    16,
          font: {
            size:   12,
            family: "Inter, sans-serif",
          },
          usePointStyle: true,
          pointStyle:    "rectRounded",
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        borderColor:     "#374151",
        borderWidth:     1,
        titleColor:      "#f9fafb",
        bodyColor:       "#9ca3af",
        padding:         12,
        cornerRadius:    10,
        callbacks: {
          label: (context) =>
            `  ${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color:   "rgba(55, 65, 81, 0.5)",
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size:   11,
            family: "Inter, sans-serif",
          },
        },
        border: {
          color: "#374151",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color:       "rgba(55, 65, 81, 0.5)",
          borderDash:  [4, 4],
        },
        ticks: {
          color: "#6b7280",
          font: {
            size:   11,
            family: "Inter, sans-serif",
          },
          stepSize: 1,
          callback: (value) =>
            Number.isInteger(value) ? value : null,
        },
        border: {
          color: "#374151",
          dash:  [4, 4],
        },
      },
    },
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">

      {/* ── Chart Header ─────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base leading-tight">
              {title}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Last {monthlyData.length} months
            </p>
          </div>
        </div>

        {/* Quick summary pills */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
            {total.reduce((a, b) => a + b, 0)} Total
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-medium">
            {pending.reduce((a, b) => a + b, 0)} Pending
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
            {resolved.reduce((a, b) => a + b, 0)} Resolved
          </span>
        </div>
      </div>

      {/* ── Chart ────────────────────────── */}
      <div className="w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default StatsChart;