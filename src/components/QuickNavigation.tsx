import React, { useState, useEffect } from 'react';
import { 
  Home, X, ArrowUp, Zap, Sparkles, Scale, Heart, Search, 
  Database, UserCheck, Crown, LayoutDashboard, Settings, PlusCircle, Building2, BarChart3
} from 'lucide-react';
import { AppViewMode } from './Header';

interface QuickNavigationProps {
  currentView: AppViewMode;
  onNavigateHome: () => void;
  onCloseCurrentPage: () => void;
  isAdmin: boolean;
  isSuperAdminAuthenticated: boolean;
  onNavigateView: (view: AppViewMode) => void;
  onOpenCompare: () => void;
  comparedCount: number;
  onOpenAddVehicle: () => void;
  onOpenSearch?: () => void;
  hasActiveModal?: boolean;
}

export const QuickNavigation: React.FC<QuickNavigationProps> = ({
  currentView,
  onNavigateHome,
  onCloseCurrentPage,
  isAdmin,
  isSuperAdminAuthenticated,
  onNavigateView,
  onOpenCompare,
  comparedCount,
  onOpenAddVehicle,
  onOpenSearch,
  hasActiveModal = false
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Track scroll position to display "Scroll to top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNotInHome = currentView !== 'public' || hasActiveModal;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    onNavigateHome();
    scrollToTop();
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 print:hidden pointer-events-none">
      {/* Quick Menu Popover */}
      {isMenuOpen && (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3 w-64 space-y-2 mb-1 animate-fadeIn text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
            <span className="font-black text-amber-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-amber-400" /> Raccourcis Rapides
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Fermer le menu rapide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {/* Home / Vitrine */}
            <button
              onClick={handleGoHome}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer font-bold ${
                currentView === 'public'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>🏠 Accueil (Catalogue Public)</span>
            </button>

            {/* Garages & SOS Panne Kinshasa */}
            <button
              onClick={() => {
                onNavigateView('garages');
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer font-bold ${
                currentView === 'garages'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-amber-400">🔧</span>
                <span>Garages & SOS Panne Kinshasa</span>
              </span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                24/7
              </span>
            </button>

            {/* Quick compare */}
            <button
              onClick={() => {
                onOpenCompare();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Comparer des véhicules</span>
              </span>
              {comparedCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {comparedCount}
                </span>
              )}
            </button>

            {/* Admin Shortcuts if logged in */}
            {isAdmin && (
              <>
                <div className="pt-1 pb-0.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Espace Gestion Concession
                </div>

                <button
                  onClick={() => {
                    onNavigateView('admin-dashboard');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                    currentView === 'admin-dashboard'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-sky-400" />
                  <span>Tableau de Bord</span>
                </button>

                <button
                  onClick={() => {
                    onNavigateView('admin-stock');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                    currentView === 'admin-stock'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Gestion du Stock</span>
                </button>

                <button
                  onClick={() => {
                    onNavigateView('admin-leads');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                    currentView === 'admin-leads'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-violet-400" />
                  <span>Demandes Clients</span>
                </button>

                <button
                  onClick={() => {
                    onNavigateView('admin-settings');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                    currentView === 'admin-settings'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Paramètres Concession</span>
                </button>

                <button
                  onClick={() => {
                    onNavigateView('admin-analytics');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                    currentView === 'admin-analytics'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Google Analytics 4</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAddVehicle();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold transition cursor-pointer border border-amber-500/30"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>+ Publier un Véhicule</span>
                </button>
              </>
            )}

            {/* Super Admin Shortcut */}
            {isSuperAdminAuthenticated && (
              <button
                onClick={() => {
                  onNavigateView('super-admin');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition cursor-pointer font-bold ${
                  currentView === 'super-admin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/30'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Super-Admin SaaS</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Bar Pill */}
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
        
        {/* Main "Accueil" Button - 1 click to home */}
        <button
          id="floating-home-button"
          onClick={handleGoHome}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer shadow-lg ${
            currentView === 'public' && !hasActiveModal
              ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-amber-500/30'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-400/50 animate-pulse'
          }`}
          title="Revenir directement à l'accueil (Catalogue Public)"
        >
          <Home className="w-4 h-4" />
          <span className="font-extrabold">Accueil</span>
        </button>

        {/* If user is inside an Admin page or sub-page, show explicit "Fermer la page" */}
        {isNotInHome && (
          <button
            id="floating-close-page-button"
            onClick={onCloseCurrentPage}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer border border-rose-500/40"
            title="Fermer la vue en cours et revenir à la vitrine"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Fermer la page</span>
            <span className="sm:hidden">Fermer</span>
          </button>
        )}

        {/* Quick Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            isMenuOpen 
              ? 'bg-amber-500 text-slate-950' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
          }`}
          title="Menu de navigation rapide"
        >
          <Zap className="w-4 h-4 text-amber-400" />
        </button>

        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition cursor-pointer"
            title="Remonter en haut de la page"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
