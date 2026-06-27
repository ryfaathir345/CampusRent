import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import adminService from "../../../services/admin.service";

interface DemoItem {
  name: string;
  count: number;
  percentage: number;
}

// Simple color palette for bars
const COLORS = ["#465FFF", "#39D98A", "#FFBC11", "#FF6B6B", "#B57BFF"];

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<DemoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getDemographic().then((res: any) => {
      if (res?.data) {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Demographic Mahasiswa
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Distribusi jurusan pemilik item aktif
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

      {/* Visual Bar */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-brand-500 rounded-full"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
          <span className="text-4xl mb-2">📊</span>
          <p className="text-sm font-medium">Belum ada data jurusan</p>
        </div>
      ) : (
        <>
          {/* Stacked color bar */}
          <div className="flex rounded-full overflow-hidden h-3 mt-6 mb-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${item.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                title={`${item.name}: ${item.percentage}%`}
              />
            ))}
            {/* Remaining grey if < 100% */}
            {items.reduce((s, i) => s + i.percentage, 0) < 100 && (
              <div
                style={{ flex: 1, backgroundColor: "#E4E7EC" }}
                className="dark:bg-gray-700"
              />
            )}
          </div>

          {/* Legend list */}
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {item.name}
                    </p>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {item.count} mahasiswa
                    </span>
                  </div>
                </div>

                <div className="flex w-full max-w-[140px] items-center gap-3">
                  <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                    <div
                      className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm text-xs font-medium text-white"
                      style={{ width: `${item.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                  </div>
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {item.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
            Total: {total} mahasiswa pemilik item aktif
          </p>
        </>
      )}
    </div>
  );
}
