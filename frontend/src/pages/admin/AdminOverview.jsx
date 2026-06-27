import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/admin.service';
import EcommerceMetrics from "../../tailadmin/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../tailadmin/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../tailadmin/components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../tailadmin/components/ecommerce/MonthlyTarget";
import RecentOrders from "../../tailadmin/components/ecommerce/RecentOrders";
import DemographicCard from "../../tailadmin/components/ecommerce/DemographicCard";
import { useAuth } from "../../context/AuthContext";

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
        <div className="animate-spin h-10 w-10 border-b-2 border-brand-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      {user?.role === 'OWNER' && (
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 p-1 shadow-2xl animate-gradient-x">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-between p-6">
            <div className="text-left text-white max-w-xl">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-lg flex items-center gap-3 mb-2">
                <span className="bg-white/20 p-2 rounded-xl border border-white/30 backdrop-blur-md shadow-lg text-2xl">👑</span> 
                Paduka Raja {user?.nama?.split(' ')[0]} <span className="animate-pulse text-xl">✨</span>
              </h2>
              <p className="text-sm md:text-base font-medium text-white/90 drop-shadow-md leading-relaxed">
                Selamat datang di Singgasana CampusRent! Jangan lupa cek cuan hari ini ya Bos! 💸💅
              </p>
            </div>
            
            {/* Crown Decoration on the right */}
            <div className="hidden md:flex relative right-2 items-center justify-center">
              <div className="absolute w-24 h-24 bg-yellow-500/30 blur-[30px] rounded-full animate-pulse"></div>
              <span className="text-[70px] leading-none drop-shadow-[0_10px_30px_rgba(255,215,0,0.5)] transform rotate-12 hover:rotate-0 transition-transform duration-500 cursor-default">
                👑
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-12 gap-4 md:gap-6 animate-fade-in">
        {/* ROW 1: 4 Metric Cards */}
        <div className="col-span-12">
          <EcommerceMetrics
            totalUsers={stats?.totalUsers}
            onlineUsers={stats?.onlineUsers}
            totalItems={stats?.totalItems}
            activeItems={stats?.activeItems}
            totalRevenue={stats?.totalRevenue}
            averageSpending={stats?.averageSpending}
          />
        </div>

        {/* ROW 2: Monthly Sales Chart (Span 8) and Quick Actions (Span 4) */}
        <div className="col-span-12 xl:col-span-8">
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="rounded-2xl border border-[#2d2e42] bg-[#1a1b2e] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <h3 className="mb-5 text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/items" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition">
                <span className="text-2xl">📦</span>
                <span className="text-xs font-semibold">Tambah Item</span>
              </Link>
              <Link to="/admin/ktm" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition">
                <span className="text-2xl">💳</span>
                <span className="text-xs font-semibold">Verifikasi KTM</span>
              </Link>
              <Link to="/admin/reports" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 hover:bg-pink-500/20 transition">
                <span className="text-2xl">📊</span>
                <span className="text-xs font-semibold">Laporan</span>
              </Link>
              <Link to="/admin/users" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition">
                <span className="text-2xl">👥</span>
                <span className="text-xs font-semibold">Kelola Users</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 3: Recent Orders (Span 8) and Monthly Target (Span 4) */}
        <div className="col-span-12 xl:col-span-8">
          <RecentOrders />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <MonthlyTarget />
        </div>

        {/* ROW 4: Extra Charts */}
        <div className="col-span-12 xl:col-span-7">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
