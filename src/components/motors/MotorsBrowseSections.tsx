import React, { useState } from 'react';
import { ChevronRight, Sparkles, X, Compass, CheckCircle2 } from 'lucide-react';
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
  const [brandFilterMode, setBrandFilterMode] = useState<'all' | 'rdc' | 'prestige'>('all');

  // Filter brands according to selected filter tab
  let filteredBrands = MOTORS_BRANDS;
  if (brandFilterMode === 'rdc') {
    filteredBrands = MOTORS_BRANDS.filter(b => b.popularInRdc);
  } else if (brandFilterMode === 'prestige') {
    filteredBrands = MOTORS_BRANDS.filter(b => 
      ['Mercedes-Benz', 'Land Rover', 'Lexus', 'Porsche', 'BMW', 'Audi'].includes(b.name)
    );
  }

  const displayedBrands = showAllMakes ? filteredBrands : filteredBrands.slice(0, 8);
  const displayedBodies = showAllBodies ? MOTORS_BODY_STYLES : MOTORS_BODY_STYLES.slice(0, 8);

  return (
    <div className="space-y-12">
      {/* 1. BROWSE BY MAKE / MARQUES */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Explorer par <span className="text-blue-600">Marque Officielle</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Accédez directement aux constructeurs automobiles les plus réputés et demandés.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
              <button
                onClick={() => setBrandFilterMode('all')}
                className={`px-3 py-1 rounded-lg transition ${brandFilterMode === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'}`}
              >
                Toutes
              </button>
              <button
                onClick={() => setBrandFilterMode('rdc')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${brandFilterMode === 'rdc' ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'}`}
              >
                <span>⭐ RDC Top</span>
              </button>
              <button
                onClick={() => setBrandFilterMode('prestige')}
                className={`px-3 py-1 rounded-lg transition ${brandFilterMode === 'prestige' ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'}`}
              >
                Prestige
              </button>
            </div>

            <button
              onClick={() => setShowAllMakes(!showAllMakes)}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer py-1.5 px-3 bg-blue-50/80 hover:bg-blue-100/70 rounded-xl"
            >
              <span>{showAllMakes ? 'Afficher moins' : `Toutes (${filteredBrands.length})`}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Brand Notice */}
        {selectedBrand && selectedBrand !== 'ALL' && (
          <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold w-fit">
            <span>Filtre actif : <strong>{selectedBrand}</strong></span>
            <button 
              onClick={() => onSelectBrand('ALL')}
              className="p-1 hover:bg-blue-200 rounded-full cursor-pointer transition text-blue-700"
              title="Réinitialiser"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Brand Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
          {displayedBrands.map((b) => {
            const isSelected = selectedBrand === b.name;
            const LogoComponent = b.Component;
            const liveCount = countsByBrand ? countsByBrand[b.name] : undefined;

            return (
              <button
                key={b.id}
                onClick={() => {
                  onSelectBrand(isSelected ? 'ALL' : b.name);
                }}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between gap-3 cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                    : 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {/* Active check indicator */}
                {isSelected && (
                  <span className="absolute top-2 right-2 text-blue-600">
                    <CheckCircle2 className="w-4 h-4 fill-blue-100" />
                  </span>
                )}

                {/* Brand Logo Container */}
                <div className="w-full h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 p-1">
                  <LogoComponent className="max-h-12 max-w-full object-contain" />
                </div>

                {/* Brand Details */}
                <div className="text-center w-full pt-1 border-t border-slate-100">
                  <span className={`block text-xs sm:text-sm font-bold truncate transition-colors ${
                    isSelected ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'
                  }`}>
                    {b.name}
                  </span>

                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {liveCount !== undefined ? (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        liveCount > 0 
                          ? 'bg-blue-100/70 text-blue-800' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {liveCount} {liveCount > 1 ? 'autos' : 'auto'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">{b.country}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. BROWSE BY BODY STYLE / CARROSSERIES */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Explorer par <span className="text-indigo-600">Type de Carrosserie</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Trouvez le véhicule parfaitement adapté à vos trajets, à votre famille ou à votre profession.
            </p>
          </div>

          <button
            onClick={() => setShowAllBodies(!showAllBodies)}
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition cursor-pointer py-1.5 px-3 bg-indigo-50/80 hover:bg-indigo-100/70 rounded-xl self-start sm:self-auto"
          >
            <span>{showAllBodies ? 'Afficher moins' : 'Toutes les carrosseries'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Category Notice */}
        {selectedCategory && selectedCategory !== 'ALL' && (
          <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-semibold w-fit">
            <span>Carrosserie filtrée : <strong>{selectedCategory}</strong></span>
            <button 
              onClick={() => onSelectCategory('ALL')}
              className="p-1 hover:bg-indigo-200 rounded-full cursor-pointer transition text-indigo-700"
              title="Réinitialiser"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Styles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayedBodies.map((body) => {
            const isSelected = selectedCategory === body.filterCategory;
            const IconComponent = body.Component;
            const liveCount = countsByCategory ? countsByCategory[body.filterCategory] : undefined;

            return (
              <button
                key={body.id}
                onClick={() => {
                  onSelectCategory(isSelected ? 'ALL' : body.filterCategory);
                }}
                className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer text-left ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {/* Active check indicator */}
                {isSelected && (
                  <span className="absolute top-3 right-3 text-indigo-600">
                    <CheckCircle2 className="w-4 h-4 fill-indigo-100" />
                  </span>
                )}

                {/* Carrosserie Vector Illustration */}
                <div className="w-full h-16 sm:h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <IconComponent className="w-full max-h-16 sm:max-h-20 drop-shadow-xs" />
                </div>

                {/* Text Info */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className={`block text-xs sm:text-sm font-black transition-colors ${
                      isSelected ? 'text-indigo-700' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}>
                      {body.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {body.subTitle}
                    </span>
                  </div>

                  {liveCount !== undefined && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      liveCount > 0 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {liveCount} {liveCount > 1 ? 'disp.' : 'disp.'}
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
