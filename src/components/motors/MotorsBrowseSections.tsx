import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { MOTORS_BRANDS } from './MotorsBrandIcons';
import { MOTORS_BODY_STYLES } from './MotorsBodyIcons';

interface MotorsBrowseSectionsProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  availableBrands?: string[];
  countsByBrand?: Record<string, number>;
  countsByCategory?: Record<string, number>;
}

export const MotorsBrowseSections: React.FC<MotorsBrowseSectionsProps> = ({
  selectedBrand,
  onSelectBrand,
  selectedCategory,
  onSelectCategory,
  availableBrands,
  countsByBrand,
  countsByCategory,
}) => {
  const [showAllMakes, setShowAllMakes] = useState(false);
  const [showAllBodies, setShowAllBodies] = useState(false);

  const displayedBrands = showAllMakes ? MOTORS_BRANDS : MOTORS_BRANDS.slice(0, 8);
  const displayedBodies = showAllBodies ? MOTORS_BODY_STYLES : MOTORS_BODY_STYLES.slice(0, 8);

  return (
    <div className="space-y-12">
      {/* 1. BROWSE BY MAKE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Browse by <span className="text-blue-600">Make</span>
          </h2>
          <button
            onClick={() => setShowAllMakes(!showAllMakes)}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
          >
            <span>{showAllMakes ? 'Show Less' : 'Show all Makes'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
          {displayedBrands.map((b) => {
            const isSelected = selectedBrand === b.name;
            const LogoComponent = b.Component;
            return (
              <button
                key={b.id}
                onClick={() => {
                  onSelectBrand(isSelected ? 'ALL' : b.name);
                }}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="h-14 flex items-center justify-center transition-transform group-hover:scale-110">
                  <LogoComponent className="max-h-12 max-w-full" />
                </div>
                <div className="text-center">
                  <span className={`block text-xs sm:text-sm font-bold transition-colors ${
                    isSelected ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'
                  }`}>
                    {b.name}
                  </span>
                  {countsByBrand && countsByBrand[b.name] !== undefined && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {countsByBrand[b.name]} {countsByBrand[b.name] > 1 ? 'cars' : 'car'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. BROWSE BY BODY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Browse by <span className="text-blue-600">Body</span>
          </h2>
          <button
            onClick={() => setShowAllBodies(!showAllBodies)}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
          >
            <span>{showAllBodies ? 'Show Less' : 'Show all Bodies'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
          {displayedBodies.map((body) => {
            const isSelected = selectedCategory === body.filterCategory;
            const IconComponent = body.Component;
            return (
              <button
                key={body.id}
                onClick={() => {
                  onSelectCategory(isSelected ? 'ALL' : body.filterCategory);
                }}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="h-14 flex items-center justify-center transition-transform group-hover:scale-105">
                  <IconComponent className="w-20 h-10 sm:w-24 sm:h-12 text-slate-700" />
                </div>
                <div className="text-center">
                  <span className={`block text-xs sm:text-sm font-bold transition-colors ${
                    isSelected ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'
                  }`}>
                    {body.name}
                  </span>
                  {countsByCategory && countsByCategory[body.filterCategory] !== undefined && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {countsByCategory[body.filterCategory]} {countsByCategory[body.filterCategory] > 1 ? 'cars' : 'car'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
