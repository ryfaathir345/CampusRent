import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

interface EcommerceMetricsProps {
  totalUsers?: number;
  onlineUsers?: number;
  totalItems?: number;
  activeItems?: number;
  totalRevenue?: number;
  averageSpending?: number;
}

export default function EcommerceMetrics({
  totalUsers,
  onlineUsers,
  totalItems,
  activeItems,
  totalRevenue,
  averageSpending,
}: EcommerceMetricsProps) {
  const hasRealData = totalUsers !== undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* Metric: Total Students */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#2d2e42] bg-[#1a1b2e] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-h-[140px]">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-xl mb-4 shadow-sm border border-blue-500/20">
          <GroupIcon className="size-5 text-blue-400 drop-shadow-md" />
        </div>
        <div>
          <span className="text-xs font-medium text-gray-400 block mb-1">Total Students</span>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-bold text-white leading-none">
              {hasRealData ? (totalUsers ?? 0).toLocaleString() : "3"}
            </h4>
            <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
              <span className="text-sm">↑</span> 12% bln lalu
            </span>
          </div>
        </div>
      </div>

      {/* Metric: Total Items */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#2d2e42] bg-[#1a1b2e] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-h-[140px]">
        <div className="flex items-center justify-center w-10 h-10 bg-fuchsia-500/10 rounded-xl mb-4 shadow-sm border border-fuchsia-500/20">
          <BoxIconLine className="size-5 text-fuchsia-400 drop-shadow-md" />
        </div>
        <div>
          <span className="text-xs font-medium text-gray-400 block mb-1">Total Items</span>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-bold text-white leading-none">
              {hasRealData ? (totalItems ?? 0).toLocaleString() : "1"}
            </h4>
            <span className="text-[11px] font-bold text-fuchsia-400 flex items-center gap-1">
              <span className="text-sm">↑</span> 8% bln lalu
            </span>
          </div>
        </div>
      </div>

      {/* Metric: Transactions */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#2d2e42] bg-[#1a1b2e] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-h-[140px]">
        <div className="flex items-center justify-center w-10 h-10 bg-pink-500/10 rounded-xl mb-4 shadow-sm border border-pink-500/20">
          <span className="text-lg drop-shadow-md">🛍️</span>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-400 block mb-1">Transactions</span>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-bold text-white leading-none">
              100
            </h4>
            <span className="text-[11px] font-bold text-pink-400 flex items-center gap-1">
              <span className="text-sm">↑</span> 24% bln lalu
            </span>
          </div>
        </div>
      </div>

      {/* Metric: Total Revenue */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#2d2e42] bg-[#1a1b2e] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-h-[140px]">
        <div className="flex items-center justify-center w-10 h-10 bg-orange-500/10 rounded-xl mb-4 shadow-sm border border-orange-500/20">
          <span className="text-lg font-bold text-orange-400 drop-shadow-md">$</span>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-400 block mb-1">Total Revenue</span>
          <div className="flex items-end justify-between">
            <h4 className="text-xl sm:text-2xl font-bold text-white leading-none">
              {hasRealData ? `Rp ${(totalRevenue ?? 15000).toLocaleString()}` : "Rp 15.000"}
            </h4>
            <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1">
              <span className="text-sm">↑</span> 18% bln lalu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
