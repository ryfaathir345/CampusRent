import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { useAuth } from '../../context/AuthContext';

const AdminOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col gap-stack-xs">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Admin Overview</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Halo {user?.name || 'Admin'}, ini adalah ringkasan performa platform hari ini.</p>
      </header>

      {/* BENTO GRID STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Card 1 */}
        <div className="glass-panel p-stack-lg rounded-xl border border-white/20 shadow-md bg-surface-container-lowest flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-primary font-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> Aktif: {stats?.onlineUsers || 0}
            </span>
          </div>
          <div className="mt-4">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Pengguna</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{stats?.totalUsers || 0}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[120px]">group</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-stack-lg rounded-xl border border-white/20 shadow-md bg-surface-container-lowest flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-error/10 rounded-lg text-error">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <span className="text-on-surface-variant font-label-sm">Aktif: {stats?.activeItems || 0}</span>
          </div>
          <div className="mt-4">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Barang</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{stats?.totalItems || 0}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[120px]">inventory_2</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-stack-lg rounded-xl border border-white/20 shadow-md bg-surface-container-lowest flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <span className="text-secondary font-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">payments</span> Avg: Rp {(stats?.averageSpending || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-4">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Pendapatan</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">Rp {(stats?.totalRevenue || 0).toLocaleString()}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[120px]">payments</span>
          </div>
        </div>
      </div>

      {/* MAIN DATA AREA (ASYMMETRIC) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Quick Actions / Recent Activity (Left/Center) */}
        <div className="lg:col-span-2 flex flex-col gap-stack-lg">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-title-md text-title-md text-on-surface">Akses Cepat</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/items" className="bg-surface-container-lowest rounded-xl p-stack-md flex items-center gap-4 border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-title-md text-sm text-on-surface">Moderasi Barang</h4>
                <p className="text-xs text-on-surface-variant">Kelola barang sewaan</p>
              </div>
            </Link>
            <Link to="/admin/ktm" className="bg-surface-container-lowest rounded-xl p-stack-md flex items-center gap-4 border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">id_card</span>
              </div>
              <div className="flex-1">
                <h4 className="font-title-md text-sm text-on-surface">Verifikasi KTM</h4>
                <p className="text-xs text-on-surface-variant">Tinjau mahasiswa baru</p>
              </div>
            </Link>
            <Link to="/admin/reports" className="bg-surface-container-lowest rounded-xl p-stack-md flex items-center gap-4 border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">report</span>
              </div>
              <div className="flex-1">
                <h4 className="font-title-md text-sm text-on-surface">Laporan</h4>
                <p className="text-xs text-on-surface-variant">Lihat keluhan & masukan</p>
              </div>
            </Link>
            <Link to="/admin/users" className="bg-surface-container-lowest rounded-xl p-stack-md flex items-center gap-4 border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div className="flex-1">
                <h4 className="font-title-md text-sm text-on-surface">Kelola Pengguna</h4>
                <p className="text-xs text-on-surface-variant">Manajemen akun</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Platform Activity/Health (Right) */}
        <div className="flex flex-col gap-stack-lg">
          <h3 className="font-title-md text-title-md text-on-surface px-2">Kesehatan Platform</h3>
          <div className="bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant/10 shadow-sm flex flex-col gap-stack-md">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-on-surface-variant">Server Status</span>
              <span className="flex items-center gap-1.5 text-secondary font-bold text-xs">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span> Optimal
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">API Response Time</span>
                  <span className="font-bold">120ms</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">Keamanan Transaksi</span>
                  <span className="font-bold">99.9%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">System maintenance dijadwalkan pada hari Minggu, 02:00 WIB.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOverview;
