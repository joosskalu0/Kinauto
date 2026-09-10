import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Vehicle } from '../../types';

interface MotorsHeroSearchProps {
  vehicles: Vehicle[];
  selectedCondition?: string;
  setSelectedCondition?: (c: string) => void;
  selectedMake?: string;
  setSelectedMake?: (m: string) => void;
  selectedModel?: string;
  setSelectedModel?: (m: string) => void;
  selectedYear?: string;
  setSelectedYear?: (y: string) => void;
  onSearchClick?: () => void;
  totalFilteredCount?: number;
  onSearch?: (filters: { condition: string; make: string; model: string; year?: string }) => void;
}

export const MotorsHeroSearch: React.FC<MotorsHeroSearchProps> = ({
  vehicles,
  selectedCondition: extCondition,
  setSelectedCondition: setExtCondition,
  selectedMake: extMake,
  setSelectedMake: setExtMake,
  selectedModel: extModel,
  setSelectedModel: setExtModel,
  selectedYear: extYear,
  setSelectedYear: setExtYear,
  onSearchClick,
  totalFilteredCount: extTotalCount,
  onSearch,
}) => {
  const [internalCondition, setInternalCondition] = useState('ALL');
  const [internalMake, setInternalMake] = useState('ALL');
  const [internalModel, setInternalModel] = useState('ALL');
  const [internalYear, setInternalYear] = useState('ALL');

  const condition = extCondition !== undefined ? extCondition : internalCondition;
  const setCondition = setExtCondition || setInternalCondition;

  const make = extMake !== undefined ? extMake : internalMake;
  const setMake = (m: string) => {
    if (setExtMake) setExtMake(m);
    setInternalMake(m);
    if (setExtModel) setExtModel('ALL');
    setInternalModel('ALL');
  };

  const model = extModel !== undefined ? extModel : internalModel;
  const setModel = setExtModel || setInternalModel;

  const year = extYear !== undefined ? extYear : internalYear;
  const setYear = setExtYear || setInternalYear;

  const calculatedCount = vehicles.filter(v => {
    if (condition !== 'ALL') {
      if (condition === 'certified') {
        if (!v.garantieMois || v.garantieMois < 12) return false;
      } else if (v.etat !== condition) {
        return false;
      }
    }
    if (make !== 'ALL' && v.marque.toLowerCase() !== make.toLowerCase()) return false;
    if (model !== 'ALL' && v.modele.toLowerCase() !== model.toLowerCase()) return false;
    if (year !== 'ALL' && v.annee.toString() !== year) return false;
    return true;
  }).length;

  const displayCount = extTotalCount !== undefined ? extTotalCount : calculatedCount;

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        condition,
        make,
        model,
        year,
      });
    }
    if (onSearchClick) {
      onSearchClick();
    }
  };
  // Available unique Makes from vehicles
  const makes = Array.from(new Set(vehicles.map(v => v.marque))).sort();
  
  // Available models based on selected make
  const models = Array.from(
    new Set(
      vehicles
        .filter(v => make === 'ALL' || v.marque === make)
        .map(v => v.modele)
    )
  ).sort();

  // Available years
  const years = Array.from(new Set(vehicles.map(v => v.annee))).sort((a, b) => b - a);

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'certified', label: 'Certified Used' },
    { id: 'neuf', label: 'New' },
    { id: 'occasion', label: 'Used' },
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 min-h-[420px] sm:min-h-[480px] flex flex-col justify-center px-4 sm:px-8 py-12 shadow-xl">
      {/* Background Image of Car Dealership Parking Lot */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1600")` 
        }}
      ></div>
      
      {/* Dark Gradient Overlay for optimal contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/80 to-slate-950/90"></div>

      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6 text-center">
        {/* Main Heading from MOTORS theme */}
        <div className="space-y-2 text-left sm:text-center">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Welcome to MOTORS!
          </h1>
          <p className="text-sm sm:lg text-slate-200 font-normal">
            The World's Largest Used & New Car Dealership
          </p>
        </div>

        {/* Tabbed Search Box */}
        <div className="max-w-3xl mx-auto pt-2">
          {/* Top Tabs */}
          <div className="flex items-end gap-1 px-2">
            {tabs.map((tab) => {
              const isActive = condition === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCondition(tab.id)}
                  className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 rounded-t-xl shadow-xs'
                      : 'bg-slate-900/90 text-white/90 hover:bg-slate-800 hover:text-white rounded-t-lg'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* White Filter Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 text-left border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Select Make */}
              <div className="relative">
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-blue-500 text-slate-800 text-sm font-semibold rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer"
                >
                  <option value="ALL">Select Make</option>
                  {makes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Select Model */}
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={make === 'ALL' && models.length > 20}
                  className="w-full bg-white border border-slate-200 hover:border-blue-500 text-slate-800 text-sm font-semibold rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="ALL">Select Model</option>
                  {models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Select Year */}
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-blue-500 text-slate-800 text-sm font-semibold rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer"
                >
                  <option value="ALL">Select Year</option>
                  {years.map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Blue Search Action Button */}
            <div className="pt-2 flex justify-center">
              <button
                id="motors-hero-search-btn"
                onClick={handleSearch}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[3]" />
                <span>{displayCount} Cars</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
