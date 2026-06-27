import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import adminService from "../../../services/admin.service";

export default function MonthlySalesChart() {
  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number; transactionCount: number }[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    adminService.getMonthlySales(new Date().getFullYear()).then((res: any) => {
      if (res?.data) setMonthlyData(res.data);
    }).catch(() => {});
  }, []);

  const categories = monthlyData.map((d) => d.month);
  const series = [{
    name: "Admin Fee (Rp)",
    data: monthlyData.map((d) => d.revenue),
  }];

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: categories.length > 0 ? categories : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: true, position: "top", horizontalAlign: "left", fontFamily: "Outfit" },
    yaxis: {
      title: { text: undefined },
      labels: {
        formatter: (val) => val === 0 ? "0" : `${(val / 1000).toFixed(0)}K`,
      },
    },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
      },
    },
  };

  return (
    <div className="rounded-2xl border border-[#2d2e42] bg-[#1a1b2e] px-5 pt-5 pb-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-purple-400">📈</span> Monthly Revenue
          </h3>
          <p className="mt-1 text-gray-400 text-theme-sm">
            Admin fee (Rp 5.000 × transaksi) per bulan — {new Date().getFullYear()}
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
              View More
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
