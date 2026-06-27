import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import adminService from "../../../services/admin.service";

const ADMIN_FEE = 5000;
const TARGET_COUNT = 200;
const TARGET_REVENUE = TARGET_COUNT * ADMIN_FEE; // Rp 1.000.000

export default function MonthlyTarget() {
  const [data, setData] = useState<{
    completedThisMonth: number;
    revenueThisMonth: number;
    percentage: number;
    targetCount: number;
    targetRevenue: number;
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("1000000");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = () => {
    adminService.getMonthlyTarget().then((res: any) => {
      if (res?.data) {
        setData(res.data);
        setEditValue(res.data.targetRevenue.toString());
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTarget = async () => {
    setIsLoading(true);
    try {
      await adminService.setMonthlyTarget(parseInt(editValue));
      setIsEditing(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const percentage = data?.percentage ?? 0;
  const completedThisMonth = data?.completedThisMonth ?? 0;
  const revenueThisMonth = data?.revenueThisMonth ?? 0;
  const currentTargetCount = data?.targetCount ?? 200;
  const currentTargetRevenue = data?.targetRevenue ?? 1000000;

  const options: ApexOptions = {
    colors: ["#c026d3"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 250,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => val + "%",
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#c026d3"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  const formatRpCompact = (num: number) => {
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)} Juta`;
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}K`;
    return "Rp " + num.toLocaleString("id-ID");
  };

  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  const progressLabel = percentage >= 100
    ? "🎉 Target bulan ini tercapai!"
    : `${completedThisMonth} dari ${currentTargetCount} transaksi selesai bulan ini`;

  return (
    <div className="rounded-2xl border border-[#2d2e42] bg-[#1a1b2e] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="px-5 pt-5 bg-transparent rounded-2xl pb-11 sm:px-6 sm:pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">🎯</span> Monthly Target
            </h3>
            <p className="mt-1 text-purple-300 text-theme-sm">
              Target: {formatRpCompact(currentTargetRevenue)}/bulan
            </p>
          </div>
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Rp</span>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md outline-none focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700"
                  step="1000"
                />
                <button 
                  onClick={handleSaveTarget}
                  disabled={isLoading}
                  className="text-xs px-2 py-1 bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-brand-500"
                title="Edit Target (Total Revenue Rp)"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[250px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={[percentage]}
              type="radialBar"
              height={250}
            />
          </div>

          <span className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-full rounded-full px-3 py-1 text-[10px] font-medium ${
            percentage >= 100
              ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
              : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
          }`}>
            {percentage >= 100 ? "100% Tercapai ✓" : `${percentage}% dari target`}
          </span>
        </div>

        <p className="mx-auto mt-6 w-full max-w-[380px] text-center text-sm text-gray-400">
          {progressLabel}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-4 bg-black/10 rounded-b-2xl border-t border-[#2d2e42]">
        <div>
          <p className="mb-1 text-center text-gray-400 text-theme-xs sm:text-sm">
            Target
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-white sm:text-lg">
            {formatRpCompact(currentTargetRevenue)}
          </p>
        </div>

        <div className="w-px bg-[#2d2e42] h-7"></div>

        <div>
          <p className="mb-1 text-center text-gray-400 text-theme-xs sm:text-sm">
            Revenue
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-white sm:text-lg">
            {formatRpCompact(revenueThisMonth)}
          </p>
        </div>

        <div className="w-px bg-[#2d2e42] h-7"></div>

        <div>
          <p className="mb-1 text-center text-gray-400 text-theme-xs sm:text-sm">
            Transaksi
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-white sm:text-lg">
            {completedThisMonth}
          </p>
        </div>
      </div>
    </div>
  );
}
