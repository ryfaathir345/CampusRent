import React from "react";

interface CountryMapProps {
  mapColor?: string;
}

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  return (
    <div 
      className="w-full h-full flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/50"
      style={{ minHeight: '200px' }}
    >
      <span className="text-gray-400 font-medium text-sm">Interactive Map Unavailable in Dev Build</span>
    </div>
  );
};

export default CountryMap;
