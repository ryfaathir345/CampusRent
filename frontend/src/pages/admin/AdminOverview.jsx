import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';

const AdminOverview = () => {
  const [stats, setStats] = useState({ totalUsers: 0, onlineUsers: 0, totalItems: 0, activeTransactions: 0, totalRevenue: 0, averageSpending: 0 });
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
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-stack-lg">
        <h2 className="font-display-lg text-display-lg text-on-surface">Dashboard Overview</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time performance metrics for the CampusRent ecosystem.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-gutter mb-stack-lg">
        {/* Card 1: Total Students */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[28px]">group</span>
            </div>
            <span className="text-tertiary font-label-sm bg-tertiary-fixed-dim/20 px-2 py-1 rounded flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {stats.onlineUsers} Online
            </span>
          </div>
          <h3 className="font-body-md text-body-md text-on-surface-variant">Total Students</h3>
          <p className="font-display-lg text-display-lg text-on-surface mt-1">{stats.totalUsers}</p>
        </div>

        {/* Card 2: Total Items */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </div>
            <span className="text-primary font-label-sm bg-primary-fixed/30 px-2 py-1 rounded">Registered</span>
          </div>
          <h3 className="font-body-md text-body-md text-on-surface-variant">Total Items</h3>
          <p className="font-display-lg text-display-lg text-on-surface mt-1">{stats.totalItems}</p>
        </div>

        {/* Card 3: Active Transactions */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <span className="text-error font-label-sm bg-error-container/40 px-2 py-1 rounded">Ongoing</span>
          </div>
          <h3 className="font-body-md text-body-md text-on-surface-variant">Active Transactions</h3>
          <p className="font-display-lg text-display-lg text-on-surface mt-1">{stats.activeTransactions}</p>
        </div>

        {/* Card 4: Average Spending */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[28px]">trending_up</span>
            </div>
            <span className="text-primary font-label-sm bg-primary-fixed/30 px-2 py-1 rounded">Rata-Rata</span>
          </div>
          <h3 className="font-body-md text-body-md text-on-surface-variant">Pengeluaran Penyewa</h3>
          <p className="font-display-sm text-display-sm text-on-surface mt-1 truncate" title={`Rp ${stats.averageSpending.toLocaleString('id-ID')}`}>
            Rp {stats.averageSpending.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Card 5: Total Revenue */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
            </div>
            <span className="text-tertiary font-label-sm bg-tertiary-fixed-dim/20 px-2 py-1 rounded">Laba</span>
          </div>
          <h3 className="font-body-md text-body-md text-on-surface-variant">Laba Platform</h3>
          <p className="font-display-sm text-display-sm text-on-surface mt-1 truncate" title={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}>
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Bento Grid Layout for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Chart Section: Weekly Transaction Volume */}
        <div className="lg:col-span-8 bg-white p-gutter rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Weekly Transaction Volume</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Transaction density monitored across 7 days</p>
            </div>
            <div className="flex gap-2">
              <select className="bg-surface-container border border-outline-variant rounded-full px-4 py-1 text-label-sm focus:ring-primary outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
              <button className="bg-primary text-white font-label-sm px-4 py-1 rounded-full hover:shadow-md transition-shadow">Download CSV</button>
            </div>
          </div>

          {/* Custom Bar Chart UI (Static placeholder from template) */}
          <div className="h-[300px] flex items-end justify-between gap-4 pt-10 border-b border-outline-variant pb-2 relative">
            <div className="absolute inset-x-0 bottom-[25%] border-t border-outline-variant/30 h-px"></div>
            <div className="absolute inset-x-0 bottom-[50%] border-t border-outline-variant/30 h-px"></div>
            <div className="absolute inset-x-0 bottom-[75%] border-t border-outline-variant/30 h-px"></div>
            
            {[
              { day: 'Mon', h: '60%' }, { day: 'Tue', h: '45%' }, { day: 'Wed', h: '80%' }, 
              { day: 'Thu', h: '65%' }, { day: 'Fri', h: '95%', active: true }, 
              { day: 'Sat', h: '35%' }, { day: 'Sun', h: '50%' }
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                <div 
                  className={`w-full max-w-[48px] rounded-t-lg transition-all duration-1000 ease-out relative overflow-hidden ${
                    d.active ? 'bg-primary-container' : 'bg-secondary-container/50 group-hover:bg-primary-container'
                  }`} 
                  style={{ height: d.h }}
                >
                  {!d.active && <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                </div>
                <span className={`font-label-sm text-label-sm ${d.active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Card: Quick Actions / Distribution */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden shadow-[0_4px_10px_rgba(99,14,212,0.3)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h3 className="font-headline-sm text-headline-sm mb-4 relative z-10">Admin Quick Access</h3>
            <div className="space-y-3 relative z-10">
              <button className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg flex items-center justify-between transition-colors border border-white/20">
                <span className="font-body-md">Verify KTM Batch</span>
                <span className="material-symbols-outlined">arrow_forward_ios</span>
              </button>
              <button className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg flex items-center justify-between transition-colors border border-white/20">
                <span className="font-body-md">Flag Irregular Item</span>
                <span className="material-symbols-outlined">report</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-outline-variant flex-1 flex flex-col">
            <h3 className="font-label-md text-label-md text-on-surface mb-4">Item Status Distribution</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label-sm text-label-sm">Available</span>
                  <span className="font-label-sm text-label-sm">74%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-tertiary h-2 rounded-full" style={{ width: '74%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label-sm text-label-sm">In Rent</span>
                  <span className="font-label-sm text-label-sm">21%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '21%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
