import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import adminService from "../../../services/admin.service";

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

interface Transaction {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  item: { namaBarang: string; fotoBarang: string | null; kategori: string };
  borrower: { nama: string; jurusan: string };
  payment: { status: string } | null;
}

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "info"> = {
  COMPLETED: "success",
  APPROVED: "info",
  BORROWED: "warning",
  PENDING: "warning",
  REJECTED: "error",
  CANCELLED: "error",
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "Selesai",
  APPROVED: "Disetujui",
  BORROWED: "Dipinjam",
  PENDING: "Menunggu",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

export default function RecentOrders() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getRecentTransactions(5).then((res: any) => {
      if (res?.data) setTransactions(res.data);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const getPhoto = (fotoBarang: string | null) => {
    if (!fotoBarang) return null;
    const first = fotoBarang.split(",")[0].trim();
    return first.startsWith("http") ? first : `${UPLOADS_URL}${first}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2d2e42] bg-[#1a1b2e] shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-5 sm:p-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">5 transaksi terbaru</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin h-7 w-7 border-b-2 border-brand-500 rounded-full"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
          <p className="text-sm font-medium">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Item
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Peminjam
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Tanggal
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Harga
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((tx) => {
                const photo = getPhoto(tx.item?.fotoBarang ?? null);
                return (
                  <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 shrink-0">
                          {photo ? (
                            <img src={photo} className="h-[50px] w-[50px] object-cover" alt={tx.item?.namaBarang} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-400 text-[22px]">image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 max-w-[130px] truncate">
                            {tx.item?.namaBarang ?? "—"}
                          </p>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {tx.item?.kategori ?? "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <p className="font-medium text-gray-700 dark:text-gray-300">{tx.borrower?.nama ?? "—"}</p>
                      <span className="text-xs text-gray-400">{tx.borrower?.jurusan ?? ""}</span>
                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(tx.createdAt)}
                    </TableCell>

                    <TableCell className="py-3 text-theme-sm font-medium text-brand-600 dark:text-brand-400">
                      Rp {(tx.totalPrice ?? 0).toLocaleString("id-ID")}
                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={STATUS_COLOR[tx.status] ?? "info"}>
                        {STATUS_LABEL[tx.status] ?? tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
