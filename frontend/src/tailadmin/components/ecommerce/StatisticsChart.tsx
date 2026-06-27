import { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import ChartTab from "../common/ChartTab"; // REMOVED to prevent confusion
import { CalenderIcon } from "../../icons";
import adminService from "../../../services/admin.service";

export default function StatisticsChart() {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [dailyData, setDailyData] = useState<{ date: string; revenue: number; transactionCount: number }[]>([]);
  const [days, setDays] = useState(30);
  const [dateRange, setDateRange] = useState<{start: string, end: string} | null>(null);

  useEffect(() => {
    if (dateRange) {
      adminService.getDailyStats(0, dateRange.start, dateRange.end).then((res: any) => {
        if (res?.data) setDailyData(res.data);
      }).catch(() => {});
    } else {
      adminService.getDailyStats(days).then((res: any) => {
        if (res?.data) setDailyData(res.data);
      }).catch(() => {});
    }
  }, [days, dateRange]);

  useEffect(() => {
    if (!datePickerRef.current) return;
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - (days - 1));

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      monthSelectorType: "static",
      dateFormat: "M d",
      defaultDate: [past, today],
      clickOpens: true,
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
           // Create local dates adjusting for timezone offset before toISOString
           const d1 = new Date(selectedDates[0].getTime() - (selectedDates[0].getTimezoneOffset() * 60000));
           const d2 = new Date(selectedDates[1].getTime() - (selectedDates[1].getTimezoneOffset() * 60000));
           setDateRange({
             start: d1.toISOString().split('T')[0],
             end: d2.toISOString().split('T')[0]
           });
        }
      },
      prevArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    });

    return () => { if (!Array.isArray(fp)) fp.destroy(); };
  }, [days]);

  const categories = dailyData.map((d) => d.date);
  const revenueSeries = dailyData.map((d) => d.revenue);
  const countSeries = dailyData.map((d) => d.transactionCount);

  const options: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: [2, 2] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    markers: { size: 0, strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      y: [
        { formatter: (val: number) => `Rp ${val.toLocaleString("id-ID")}` },
        { formatter: (val: number) => `${val} transaksi` },
      ],
    },
    xaxis: {
      type: "category",
      categories: categories.length > 0 ? categories : [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        rotate: -45,
        style: { fontSize: "10px" },
        // Tampilkan hanya setiap N label agar tidak penuh
        formatter: (val, idx) => (typeof idx === "number" && idx % 5 === 0 ? val : ""),
      },
    },
    yaxis: [
      {
        title: { text: "Revenue (Rp)", style: { fontSize: "12px" } },
        labels: {
          style: { fontSize: "12px", colors: ["#6B7280"] },
          formatter: (val) => `${(val / 1000).toFixed(0)}K`,
        },
      },
      {
        opposite: true,
        title: { text: "Transaksi", style: { fontSize: "12px" } },
        labels: {
          style: { fontSize: "12px", colors: ["#6B7280"] },
          formatter: (val) => `${val}`,
        },
      },
    ],
  };

  const series = [
    { name: "Revenue Platform", data: revenueSeries },
    { name: "Jumlah Transaksi", data: countSeries },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Revenue platform & jumlah transaksi per hari
          </p>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          {/* Days selector */}
          <div className="flex gap-1">
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => { setDays(d); setDateRange(null); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  days === d && !dateRange
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
          <div className="relative inline-flex items-center">
            <CalenderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 size-5 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-10 w-10 lg:w-40 lg:h-auto lg:pl-10 lg:pr-3 lg:py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-transparent lg:text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-300 cursor-pointer"
              placeholder="Select date range"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
