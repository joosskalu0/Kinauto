import React, { useState } from 'react';
import { 
  User, Scale, Plus, Menu, X, Home, Building2, Wrench, ShieldCheck, 
  Crown, Heart, LogOut, Phone, Search, ChevronRight, Sparkles 
} from 'lucide-react';
import { MotorsLogo } from './MotorsLogo';
import { DealershipInfo, DealershipAccount, Vehicle, GarageProfile } from '../../types';

interface MotorsHeaderProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  openAuthModal?: () => void;
  isLoggedIn?: boolean;
  onLogout: () => void;
  comparedVehicleIds: string[];
  openCompareModal: () => void;
  openAddVehicleModal: () => void;
  favoriteIds: string[];
  currency: 'USD' | 'FC';
  setCurrency: (c: 'USD' | 'FC') => void;
  isAdmin?: boolean;
  isDealershipLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  unreadLeadsCount?: number;
  dealershipName?: string;
  onOpenShare?: () => void;
  onSelectVehicle?: (v: Vehicle) => void;
  vehicles?: Vehicle[];
  isSuperAdminAuthenticated?: boolean;
  openSuperAdminAuthModal?: () => void;
  onLogoutSuperAdmin?: () => void;
  dealershipAccounts?: DealershipAccount[];
  currentAccount?: DealershipAccount;
  onSelectAccount?: (acc: DealershipAccount) => void;
}

export const MotorsHeader: React.FC<MotorsHeaderProps> = ({
  currentView,
  setCurrentView,
  openAuthModal,
  isLoggedIn,
  onLogout,
  comparedVehicleIds,
  openCompareModal,
  openAddVehicleModal,
  favoriteIds,
  currency,
  setCurrency,
  isAdmin,
  isDealershipLoggedIn,
  onOpenLogin,
  onOpenRegister,
  searchQuery,
  setSearchQuery,
  unreadLeadsCount,
  dealershipName,
  onOpenShare,
  onSelectVehicle,
  vehicles,
  isSuperAdminAuthenticated = false,
  openSuperAdminAuthModal,
  onLogoutSuperAdmin,
  dealershipAccounts = [],
  currentAccount,
  onSelectAccount,
}) => {
  const activeLoggedIn = Boolean(isLoggedIn || isDealershipLoggedIn);
  const handleOpenLoginModal = onOpenLogin || openAuthModal || (() => {});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Left: Motors Logo */}
          <div 
            onClick={() => setCurrentView('public')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <MotorsLogo size="md" />
          </div>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-bold text-slate-700">
            <button 
              onClick={() => setCurrentView('public')}
              className={`hover:text-blue-600 transition cursor-pointer ${currentView === 'public' ? 'text-blue-600' : ''}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setCurrentView('garages')}
              className={`hover:text-blue-600 transition cursor-pointer flex items-center gap-1.5 ${currentView === 'garages' ? 'text-blue-600' : ''}`}
            >
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>SOS Dépannage & Garages</span>
            </button>
            {activeLoggedIn && (
              <button 
                onClick={() => setCurrentView('admin-dashboard')}
                className={`hover:text-blue-600 transition cursor-pointer ${currentView.startsWith('admin') ? 'text-blue-600' : ''}`}
              >
                Espace Concession
              </button>
            )}
            {isSuperAdminAuthenticated && (
              <button 
                onClick={() => setCurrentView('super-admin')}
                className={`text-amber-700 hover:text-amber-800 transition cursor-pointer flex items-center gap-1 ${currentView === 'super-admin' ? 'font-black' : ''}`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Super-Admin SaaS</span>
              </button>
            )}
          </nav>

          {/* Right: Icons exactly like the video */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Currency Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded transition cursor-pointer ${currency === 'USD' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency('FC')}
                className={`px-2 py-1 rounded transition cursor-pointer ${currency === 'FC' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                FC
              </button>
            </div>

            {/* User Profile Icon */}
            <button
              id="motors-header-user-btn"
              onClick={handleOpenLoginModal}
              title={activeLoggedIn ? "Mon Compte Concession" : "Se connecter / S'inscrire"}
              className={`p-2 rounded-full transition cursor-pointer relative ${
                activeLoggedIn 
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-5 h-5 stroke-[2.2]" />
              {activeLoggedIn && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Compare Vehicles Icon with count badge */}
            <button
              id="motors-header-compare-btn"
              onClick={openCompareModal}
              title="Comparer les véhicules"
              className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition cursor-pointer relative"
            >
              <Scale className="w-5 h-5 stroke-[2.2]" />
              {comparedVehicleIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {comparedVehicleIds.length}
                </span>
              )}
            </button>

            {/* Blue Square Rounded + Button (Add listing) */}
            <button
              id="motors-header-add-btn"
              onClick={openAddVehicleModal}
              title="Publier un véhicule / Add car"
              className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-sm transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              id="motors-header-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-800 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 animate-slideLeft">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <MotorsLogo size="sm" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Currency on Mobile */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-2">Devise d'affichage</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`py-2 rounded-xl transition ${currency === 'USD' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                  >
                    $ USD
                  </button>
                  <button
                    onClick={() => setCurrency('FC')}
                    className={`py-2 rounded-xl transition ${currency === 'FC' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                  >
                    FC Congolais
                  </button>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-2 text-sm font-bold text-slate-800">
                <button
                  onClick={() => {
                    setCurrentView('public');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-blue-600" />
                    <span>Catalogue / Inventory</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setCurrentView('garages');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-rose-600" />
                    <span>SOS Dépannage & Garages</span>
                  </div>
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">Kinshasa</span>
                </button>

                <button
                  onClick={() => {
                    openCompareModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <span>Véhicules Comparés</span>
                  </div>
                  <span className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded-full">{comparedVehicleIds.length}</span>
                </button>

                <button
                  onClick={() => {
                    openAddVehicleModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-600 font-black transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Publier un véhicule</span>
                  </div>
                </button>
              </div>

              {/* Account / Admin shortcuts */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Espaces Dédiés</p>
                
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setCurrentView('admin-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between"
                  >
                    <span>Tableau de Bord Concession</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      openAuthModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full p-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <User className="w-4 h-4" />
                    <span>Connexion Concession / Vendeur</span>
                  </button>
                )}

                {isSuperAdminAuthenticated ? (
                  <button
                    onClick={() => {
                      setCurrentView('super-admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span>Administration SaaS</span>
                    </div>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      openSuperAdminAuthModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-2"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>Accès Super-Admin SaaS</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
              <p>© 2025 AutoConcession Kinshasa. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
