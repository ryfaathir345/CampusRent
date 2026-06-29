import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminTopNav from '../admin/AdminTopNav';
import AdminSidebar from '../admin/AdminSidebar';

const AdminLayout = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme from document class or localStorage
    const hasDark = document.documentElement.classList.contains('dark');
    setIsDark(hasDark);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen transition-colors duration-500">
      <AdminSidebar />
      <main className="md:ml-64 min-h-screen flex flex-col">
        <AdminTopNav toggleTheme={toggleTheme} />
        <div className="pt-24 px-gutter pb-stack-xl flex-1 flex flex-col gap-gutter max-w-container-max mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
