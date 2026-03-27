import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { BarChart2, BadgeCheck, ArrowUpRight, MapPin } from "lucide-react";
import { colors, fonts } from "../styles/designTokens";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

const truncateLabel = (value, limit = 34) => {
  if (!value) return "Untitled report";
  return value.length > limit ? `${value.slice(0, Math.max(limit - 3, 1))}...` : value;
};

const StatsChart = ({ reports = [], title = "Top Upvoted Reports", onSelectReport }) => {
  const rankedReports = [...reports]
    .filter((report) => Number(report.verification_count || 0) > 0)
    .sort((a, b) => {
      const impactDiff = Number(b.verification_count || 0) - Number(a.verification_count || 0);
      if (impactDiff !== 0) return impactDiff;
      return new Date(b.created_at) - new Date(a.created_at);
    })
    .slice(0, 6);

  if (rankedReports.length === 0) {
    return (
      <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-[2rem] p-6 sm:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF8E6] border border-[#F2DCA2] flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-[var(--c-accentGold)]" />
          </div>
          <div>
            <h3 className="text-[var(--c-charcoal)] font-black text-lg" style={{ fontFamily: fonts.heading }}>
              {title}
            </h3>
            <p className="text-[var(--c-textSecondary)] text-sm">
              This panel will surface the highest-upvoted reports in your zone.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-dashed border-[var(--c-borderLight)] bg-white min-h-[280px] flex flex-col items-center justify-center text-center px-6">
          <BadgeCheck className="w-12 h-12 text-[var(--c-accentGold)]/40 mb-4" />
          <p className="text-[var(--c-charcoal)] font-bold text-base">No upvoted reports yet</p>
          <p className="text-[var(--c-textSecondary)] text-sm mt-2 max-w-md">
            Once citizens start upvoting important issues, this board will automatically highlight the strongest community signals.
          </p>
        </div>
      </div>
    );
  }

  const labels = rankedReports.map((report) => `#${report.id} ${truncateLabel(report.description)}`);
  const upvotes = rankedReports.map((report) => Number(report.verification_count || 0));
  const maxVotes = Math.max(...upvotes, 1);

  const data = {
    labels,
    datasets: [
      {
        data: upvotes,
        backgroundColor: [
          "rgba(92, 111, 74, 0.95)",
          "rgba(161, 124, 65, 0.92)",
          "rgba(63, 79, 49, 0.88)",
          "rgba(217, 224, 201, 0.95)",
          "rgba(92, 111, 74, 0.72)",
          "rgba(161, 124, 65, 0.72)",
        ],
        borderRadius: 12,
        borderSkipped: false,
        barThickness: 24,
        hoverBackgroundColor: [
          "rgba(63, 79, 49, 1)",
          "rgba(138, 105, 54, 1)",
          "rgba(46, 42, 31, 1)",
          "rgba(196, 207, 177, 1)",
          "rgba(63, 79, 49, 0.86)",
          "rgba(138, 105, 54, 0.86)",
        ],
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.charcoal,
        borderColor: colors.borderLight,
        borderWidth: 1,
        titleColor: colors.offWhite,
        bodyColor: colors.sage,
        cornerRadius: 14,
        padding: 14,
        displayColors: false,
        callbacks: {
          title: (items) => {
            const report = rankedReports[items[0].dataIndex];
            return `Report #${report.id}`;
          },
          label: (context) => {
            const report = rankedReports[context.dataIndex];
            return `${report.verification_count} upvotes`;
          },
          afterLabel: (context) => {
            const report = rankedReports[context.dataIndex];
            return truncateLabel(report.description, 56);
          },
        },
      },
    },
    onClick: (_, elements) => {
      if (!elements.length || typeof onSelectReport !== "function") return;
      const index = elements[0].index;
      onSelectReport(rankedReports[index]);
    },
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: maxVotes + 1,
        grid: {
          color: "rgba(207, 197, 179, 0.45)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.textSecondary,
          stepSize: 1,
          font: {
            family: fonts.body,
            size: 11,
            weight: 600,
          },
          callback: (value) => `${value}`,
        },
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.charcoal,
          font: {
            family: fonts.body,
            size: 11,
            weight: 700,
          },
          callback: (_, index) => {
            const report = rankedReports[index];
            return report ? `#${report.id}` : "";
          },
        },
      },
    },
  };

  const totalUpvotes = upvotes.reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-[2rem] p-6 sm:p-7 flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF8E6] border border-[#F2DCA2] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-[var(--c-accentGold)]" />
          </div>
          <div>
            <h3 className="text-[var(--c-charcoal)] font-black text-lg" style={{ fontFamily: fonts.heading }}>
              {title}
            </h3>
            <p className="text-[var(--c-textSecondary)] text-sm mt-1">
              Highest community-signal reports in your zone. Click any bar to open the full report.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-white border border-[var(--c-borderLight)] text-[var(--c-charcoal)] font-bold">
            {rankedReports.length} highlighted
          </span>
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#FFF8E6] border border-[#F2DCA2] text-[var(--c-accentGold)] font-bold">
            {totalUpvotes} total upvotes
          </span>
        </div>
      </div>

      <div className="bg-white border border-[var(--c-borderLight)] rounded-[1.5rem] p-3 sm:p-5">
        <div className="overflow-x-auto overflow-y-hidden hide-scrollbar">
          <div className="min-w-[560px] sm:min-w-0">
            <div className="h-[280px] sm:h-[320px] md:h-[340px]">
              <Bar data={data} options={options} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {rankedReports.slice(0, 3).map((report, index) => (
          <button
            key={report.id}
            type="button"
            onClick={() => onSelectReport?.(report)}
            className="text-left bg-white border border-[var(--c-borderLight)] rounded-2xl p-4 hover:border-[var(--c-olive)] hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--c-accentGold)]">
                <BadgeCheck className="w-3.5 h-3.5" />
                Rank {index + 1}
              </span>
              <span className="text-sm font-black text-[var(--c-charcoal)]">
                {report.verification_count} upvote{report.verification_count === 1 ? "" : "s"}
              </span>
            </div>

            <p className="text-sm font-bold text-[var(--c-charcoal)] leading-relaxed">
              {truncateLabel(report.description, 72)}
            </p>

            <div className="mt-4 flex items-center justify-between text-xs text-[var(--c-textSecondary)] font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--c-olive)]" />
                {report.pincode}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--c-oliveDark)]">
                Open report
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatsChart;
