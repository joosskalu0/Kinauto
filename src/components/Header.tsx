import React from 'react';
import { 
  Car, ShieldCheck, LayoutDashboard, Database, UserCheck, Settings, Scale, Heart, Search, 
  PlusCircle, Sparkles, Building2, Crown, ChevronDown, CheckCircle2, Clock, UserPlus,
  Lock, KeyRound, LogOut, Home, ArrowLeft, X, BarChart3, Share2, Layers, Wrench, AlertTriangle,
  Coins, LayoutGrid, List
} from 'lucide-react';
import { DealershipInfo, DealershipAccount, Vehicle, GarageProfile } from '../types';
import { InteractiveSearchBar } from './InteractiveSearchBar';

export type AppViewMode = 'public' | 'garages' | 'admin-dashboard' | 'admin-stock' | 'admin-leads' | 'admin-settings' | 'admin-analytics' | 'super-admin';

interface HeaderProps {
  currentView: AppViewMode;
  setCurrentView: (view: AppViewMode) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  isSuperAdminAuthenticated: boolean;
  openSuperAdminAuthModal: () => void;
  onLogoutSuperAdmin: () => void;
  isDealershipLoggedIn: boolean;
  openDealershipAuthModal: () => void;
  onLogoutDealership: () => void;
  dealership: DealershipInfo;
  dealershipAccounts: DealershipAccount[];
  currentAccount?: DealershipAccount;
  onSelectAccount: (acc: DealershipAccount) => void;
  comparedVehicleIds: string[];
  openCompareModal: () => void;
  favoriteIds: string[];
  openAddVehicleModal: () => void;
  openRegisterModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  unreadLeadsCount: number;
  onOpenShare?: () => void;
  currency: 'USD' | 'FC';
  setCurrency: (c: 'USD' | 'FC') => void;
  usdToFcRate: number;
  vehicles: Vehicle[];
  garages: GarageProfile[];
  onSelectVehicle: (v: Vehicle) => void;
  onSelectGarage: (g: GarageProfile) => void;
  layoutMode: 'grid' | 'list';
  setLayoutMode: (m: 'grid' | 'list') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  isAdmin,
  setIsAdmin,
  isSuperAdminAuthenticated,
  openSuperAdminAuthModal,
  onLogoutSuperAdmin,
  isDealershipLoggedIn,
  openDealershipAuthModal,
  onLogoutDealership,
  dealership,
  dealershipAccounts,
  currentAccount,
  onSelectAccount,
  comparedVehicleIds,
  openCompareModal,
  favoriteIds,
  openAddVehicleModal,
  openRegisterModal,
  searchQuery,
  setSearchQuery,
  unreadLeadsCount,
  onOpenShare,
  currency,
  setCurrency,
  usdToFcRate,
  vehicles,
  garages,
  onSelectVehicle,
  onSelectGarage,
  layoutMode,
  setLayoutMode,
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Notification Bar */}
      <div className="bg-slate-50 text-slate-700 text-xs py-1.5 px-4 flex flex-wrap justify-between items-center border-b border-slate-200 gap-2">
        <div className="flex flex-wrap items-center gap-3 text-slate-700">
          
          {/* Concession Display or Super-Admin Switcher */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold text-slate-500 hidden sm:inline">Réseau :</span>
            
            {isSuperAdminAuthenticated ? (
              <select
                value={currentAccount?.id || ''}
                onChange={(e) => {
                  const found = dealershipAccounts.find((a) => a.id === e.target.value);
                  if (found) onSelectAccount(found);
                }}
                className="bg-white border border-slate-300 text-amber-600 font-extrabold text-xs rounded-lg px-2 py-0.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
              >
                {dealershipAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-white text-slate-900">
                    🏢 {acc.info.nom} ({acc.statutAbonnement === 'essai_gratuit' ? 'Essai 14j' : acc.statutAbonnement})
                  </option>
                ))}
              </select>
            ) : currentView === 'public' ? (
              <span className="text-amber-700 font-extrabold text-xs bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                Kinshasa Multi-Concessions ({dealershipAccounts.length} Partenaires)
              </span>
            ) : (
              <span className="text-amber-700 font-extrabold text-xs bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                {dealership.nom}
              </span>
            )}
          </div>

          <span className="hidden md:inline text-slate-300">|</span>

          {/* Interactive Currency Switcher Pill ($ USD ⇄ FC) */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-0.5 shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold px-1.5 hidden sm:inline">Devise :</span>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-black transition cursor-pointer ${
                currency === 'USD'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Afficher les prix en Dollars Américains ($ USD)"
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency('FC')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-black transition cursor-pointer ${
                currency === 'FC'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={`Afficher les prix en Francs Congolais (Taux : 1 $ = ${usdToFcRate.toLocaleString('fr-FR')} FC)`}
            >
              FC (CDF)
            </button>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Register New Dealership Button (Accessible to Everyone) */}
          <button
            onClick={openRegisterModal}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Inscrire ma Concession (14j gratuits)</span>
            <span className="sm:hidden">Inscription</span>
          </button>

          <span className="text-slate-300">|</span>

          {/* Super Admin Secure Access Control */}
          {isSuperAdminAuthenticated ? (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <button
                onClick={() => {
                  setIsAdmin(true);
                  setCurrentView('super-admin');
                }}
                className={`text-[11px] font-black flex items-center gap-1 transition cursor-pointer ${
                  currentView === 'super-admin' ? 'text-amber-800 font-extrabold' : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Super-Admin SaaS</span>
              </button>
              <button
                onClick={onLogoutSuperAdmin}
                title="Verrouiller la session Super-Admin"
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={openSuperAdminAuthModal}
              className="text-[11px] font-extrabold text-slate-600 hover:text-amber-700 flex items-center gap-1 transition cursor-pointer bg-white px-2.5 py-0.5 rounded-full border border-slate-200 hover:border-amber-400 shadow-xs"
            >
              <Lock className="w-3 h-3 text-amber-600" />
              <span className="hidden sm:inline">Admin SaaS</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          {/* Concession Pro Auth Status & Toggle */}
          {isDealershipLoggedIn ? (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-full px-2 py-0.5">
              <button
                id="admin-mode-toggle"
                onClick={() => {
                  const nextAdmin = !isAdmin;
                  setIsAdmin(nextAdmin);
                  if (nextAdmin && currentView === 'public') {
                    setCurrentView('admin-dashboard');
                  } else if (!nextAdmin) {
                    setCurrentView('public');
                  }
                }}
                className="text-[11px] font-black text-amber-800 hover:text-amber-900 flex items-center gap-1 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Espace Pro ({currentAccount?.responsableNom?.split(' ')[0] || 'Concession'})</span>
              </button>
              <button
                onClick={onLogoutDealership}
                title="Déconnexion du compte concessionnaire"
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                openDealershipAuthModal();
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Connexion Concession</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Dealership Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('public')}
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
            <Car className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950 group-hover:text-amber-600 transition flex items-center gap-2">
              {currentView === 'public' ? "AutoConcession Réseau" : dealership.nom}
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200 uppercase tracking-widest">
                {currentView === 'public' ? `RÉSEAU KINSHASA` : 'PRO'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {currentView === 'public' 
                ? "Plateforme Automobile & SOS Dépannage à Kinshasa" 
                : dealership.slogan}
            </p>
          </div>
        </div>

        {/* Global Interactive Search Bar with instant autocomplete popover */}
        <div className="flex-1 max-w-lg hidden md:block">
          <InteractiveSearchBar
            searchQuery={searchQuery}
            setSearchQuery={(q) => {
              setSearchQuery(q);
              if (currentView !== 'public' && currentView !== 'admin-stock' && currentView !== 'garages') {
                setCurrentView('public');
              }
            }}
            vehicles={vehicles}
            garages={garages}
            dealershipAccounts={dealershipAccounts}
            onSelectVehicle={onSelectVehicle}
            onSelectGarage={onSelectGarage}
            onSelectDealership={(accId) => {
              setCurrentView('public');
            }}
            currency={currency}
            usdToFcRate={usdToFcRate}
          />
        </div>

        {/* Action Badges & Buttons */}
        <div className="flex items-center gap-2">
          {/* Grid / List Layout Switcher in Header */}
          {currentView === 'public' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  layoutMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vue Grille (Grandes Cartes)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  layoutMode === 'list' ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vue Liste (Fiches Horizontales Détaillées)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Return to Home Button (Shown when not in public view) */}
          {currentView !== 'public' && (
            <button
              id="header-return-home-button"
              onClick={() => setCurrentView('public')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Revenir à l'accueil du catalogue public"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
          )}

          {/* Share Social Networks Button */}
          {onOpenShare && (
            <button
              id="open-share-header-button"
              onClick={onOpenShare}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Partager sur les réseaux sociaux"
            >
              <Share2 className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Partager</span>
            </button>
          )}

          {/* Compare Button */}
          <button
            id="open-compare-button"
            onClick={openCompareModal}
            className="relative bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Comparer les véhicules"
          >
            <Scale className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Comparer</span>
            {comparedVehicleIds.length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {comparedVehicleIds.length}
              </span>
            )}
          </button>

          {/* Admin Add Vehicle Button */}
          {isAdmin && (
            <button
              id="quick-add-vehicle-button"
              onClick={openAddVehicleModal}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publier Véhicule</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto py-2 no-scrollbar text-xs">
          
          <div className="flex items-center gap-1.5">
            {/* Public View / Home Tab */}
            <button
              id="nav-tab-public"
              onClick={() => setCurrentView('public')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                currentView === 'public'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>🚗 Catalogue Véhicules</span>
            </button>

            {/* Garages & SOS Dépannage Kinshasa Tab */}
            <button
              id="nav-tab-garages"
              onClick={() => setCurrentView('garages')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                currentView === 'garages'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-xs font-black'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>🔧 Garages & SOS Panne Kinshasa</span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                24/7
              </span>
            </button>

            {/* Super Admin SaaS Tab */}
            {isSuperAdminAuthenticated && (
              <button
                id="nav-tab-super-admin"
                onClick={() => {
                  setIsAdmin(true);
                  setCurrentView('super-admin');
                }}
                className={`px-4 py-2 rounded-xl font-black flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  currentView === 'super-admin'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-amber-700 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Plateforme Super-Admin SaaS</span>
              </button>
            )}

            {/* Dealership Pro Admin Tabs */}
            {isAdmin && (
              <>
                <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
                
                <button
                  id="nav-tab-admin-dashboard"
                  onClick={() => setCurrentView('admin-dashboard')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                    currentView === 'admin-dashboard'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                  <span>Tableau de Bord ({dealership.nom})</span>
                </button>

                <button
                  id="nav-tab-admin-stock"
                  onClick={() => setCurrentView('admin-stock')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                    currentView === 'admin-stock'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Gestion du Stock</span>
                </button>

                <button
                  id="nav-tab-admin-leads"
                  onClick={() => setCurrentView('admin-leads')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition relative cursor-pointer ${
                    currentView === 'admin-leads'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-violet-600" />
                  <span>Demandes & Essais</span>
                  {unreadLeadsCount > 0 && (
                    <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full">
                      {unreadLeadsCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-tab-admin-settings"
                  onClick={() => setCurrentView('admin-settings')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                    currentView === 'admin-settings'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Paramètres Concession</span>
                </button>

                <button
                  id="nav-tab-admin-analytics"
                  onClick={() => setCurrentView('admin-analytics')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                    currentView === 'admin-analytics'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  <span>Statistiques & Performances</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Exit Admin / Return Home Tab Indicator */}
          {currentView !== 'public' && (
            <button
              onClick={() => setCurrentView('public')}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition cursor-pointer shrink-0 ml-2"
              title="Fermer la vue de gestion et revenir à la vitrine"
            >
              <X className="w-3.5 h-3.5" />
              <span>Fermer la vue de gestion</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
