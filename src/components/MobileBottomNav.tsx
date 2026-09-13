import React from 'react';
import { Car, Search, Wrench, Heart, Sparkles, Scale } from 'lucide-react';
import { AppViewMode } from './Header';

interface MobileBottomNavProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  favoriteCount: number;
  onOpenFavorites: () => void;
  onOpenSearch: () => void;
  comparedCount?: number;
  onOpenCompare?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  favoriteCount,
  onOpenFavorites,
  onOpenSearch,
  comparedCount = 0,
  onOpenCompare,
}) => {
  return (
    <nav 
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around">
        {/* Tab 1: Catalogue Autos */}
        <button
          id="mobile-nav-catalog"
          onClick={() => {
            setCurrentView('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            currentView === 'public'
              ? 'text-blue-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${currentView === 'public' ? 'bg-blue-50 text-blue-600' : ''}`}>
            <Car className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Voitures</span>
        </button>

        {/* Tab 2: Rechercher */}
        <button
          id="mobile-nav-search"
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <div className="p-1 rounded-lg hover:bg-slate-100">
            <Search className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Rechercher</span>
        </button>

        {/* Tab 3: SOS Garages */}
        <button
          id="mobile-nav-garages"
          onClick={() => {
            setCurrentView('garages');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            currentView === 'garages'
              ? 'text-rose-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg transition relative ${currentView === 'garages' ? 'bg-rose-50 text-rose-600' : ''}`}>
            <Wrench className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">SOS 24/7</span>
        </button>

        {/* Tab 4: Favoris */}
        <button
          id="mobile-nav-favorites"
          onClick={onOpenFavorites}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer relative"
        >
          <div className="p-1 rounded-lg hover:bg-slate-100 relative">
            <Heart className={`w-5 h-5 stroke-[2.2] ${favoriteCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {favoriteCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Favoris</span>
        </button>

        {/* Tab 5: Tarifs & Monétisation Pro */}
        <button
          id="mobile-nav-monetization"
          onClick={() => {
            setCurrentView('monetization');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
            currentView === 'monetization'
              ? 'text-amber-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${currentView === 'monetization' ? 'bg-amber-50 text-amber-600' : ''}`}>
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Tarifs Pro</span>
        </button>
      </div>
    </nav>
  );
};
