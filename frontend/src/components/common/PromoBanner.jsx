import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import promoService from '../../services/promo.service';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const PromoBanner = () => {
  const [promos, setPromos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await promoService.getActivePromos();
        const promosData = res.data?.data || res.data;
        if (promosData && Array.isArray(promosData) && promosData.length > 0) {
          setPromos(promosData);
        }
      } catch (err) {
        console.error('Failed to load promos', err);
      }
    };
    fetchPromos();
  }, []);

  useEffect(() => {
    if (promos.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % promos.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [promos.length]);

  if (promos.length === 0) return null;

  const promo = promos[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2f3a] to-[#0f172a] p-8 md:p-10 mb-8 border border-white/5 shadow-xl transition-all duration-500 min-h-[220px] flex items-center">
      {promo.bannerImage && (
        <div 
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${UPLOADS_URL}${promo.bannerImage})` }}
        ></div>
      )}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
        <div className="flex-1">
          <div className="inline-block px-3 py-1 rounded-full bg-[#f8a849] text-[#1a1a1a] text-xs font-bold tracking-wider mb-4 uppercase shadow-sm">
            Promo Spesial
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight transition-all duration-300 leading-tight">
            {promo.title}
          </h2>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
            {promo.description} <br className="hidden md:block"/>
            Gunakan kode <span className="inline-block bg-white/20 px-2 py-0.5 rounded text-white font-mono text-sm mx-1 tracking-wider shadow-inner">{promo.code}</span> saat checkout.
          </p>
        </div>
        
        <div className="shrink-0 mt-4 md:mt-0">
          <Link to="/items" className="inline-block px-6 py-3 rounded-xl bg-[#a6c1ee] hover:bg-[#92addc] text-[#0f172a] font-bold transition-all shadow-lg hover:shadow-[#a6c1ee]/30 hover:-translate-y-1 active:translate-y-0">
            Cari Barang
          </Link>
        </div>
      </div>

      {promos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {promos.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-[#f8a849] w-6' : 'bg-white/30 hover:bg-white/50 w-2'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoBanner;
