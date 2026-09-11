import React, { useState, useEffect } from 'react';
import { 
  Car, Filter, Search, SlidersHorizontal, Scale, Heart, Shield, 
  CheckCircle2, PlusCircle, Sparkles, LayoutGrid, List, ArrowUpDown, X, RotateCcw,
  Database, CloudCheck, Tag, Share2
} from 'lucide-react';

import { Vehicle, Lead, DealershipInfo, VehicleStatus, VehicleFilterState, DealershipAccount, Invoice, SubscriptionStatus, SubscriptionPlan, GarageSubscriptionPlan, SiteAdminInfo, GarageProfile, BreakdownRequest } from './types';
import { INITIAL_VEHICLES } from './data/mockVehicles';
import { INITIAL_LEADS, DEFAULT_DEALERSHIP_INFO } from './data/mockLeads';
import { INITIAL_DEALERSHIP_ACCOUNTS, SUBSCRIPTION_PLANS, GARAGE_SUBSCRIPTION_PLANS, DEFAULT_SITE_ADMIN_INFO } from './data/mockSaas';
import { INITIAL_GARAGES } from './data/mockGarages';

import { 
  subscribeVehicles, 
  saveVehicleToFirestore, 
  deleteVehicleFromFirestore,
  subscribeLeads,
  saveLeadToFirestore,
  deleteLeadFromFirestore,
  subscribeAccounts,
  saveAccountToFirestore,
  deleteAccountFromFirestore,
  deleteDealershipAndVehicles
} from './lib/firebase';

import { Header, AppViewMode } from './components/Header';
import { VehicleCard } from './components/VehicleCard';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { TestDriveModal } from './components/TestDriveModal';
import { CompareModal } from './components/CompareModal';
import { SocialShareModal } from './components/SocialShareModal';
import { Footer } from './components/Footer';
import { GarageDirectory } from './components/garages/GarageDirectory';

// MOTORS Theme Components (Exact Layout from Video)
import { MotorsHeader } from './components/motors/MotorsHeader';
import { MotorsHeroSearch } from './components/motors/MotorsHeroSearch';
import { MotorsBrowseSections } from './components/motors/MotorsBrowseSections';
import { MotorsVehicleCard } from './components/motors/MotorsVehicleCard';
import { MotorsDetailModal } from './components/motors/MotorsDetailModal';
import { MotorsAuthModal } from './components/motors/MotorsAuthModal';
import { MotorsFooter } from './components/motors/MotorsFooter';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StockTable } from './components/admin/StockTable';
import { VehicleFormModal } from './components/admin/VehicleFormModal';
import { LeadManagement } from './components/admin/LeadManagement';
import { DealershipSettings } from './components/admin/DealershipSettings';
import { DealershipAnalytics } from './components/admin/DealershipAnalytics';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { TrialNotificationBanner } from './components/admin/TrialNotificationBanner';
import { RegisterDealershipModal } from './components/auth/RegisterDealershipModal';
import { SuperAdminAuthModal } from './components/auth/SuperAdminAuthModal';
import { DealershipAuthModal } from './components/auth/DealershipAuthModal';
import { InvoiceModal } from './components/admin/InvoiceModal';
import { QuickNavigation } from './components/QuickNavigation';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { 
  initGoogleAnalytics, 
  trackPageView, 
  trackVehicleView, 
  trackTestDriveRequest, 
  trackLeadSubmitted 
} from './lib/analytics';
import { 
  initMetaPixel, 
  initTikTokPixel, 
  initGoogleAds 
} from './lib/pixels';
import {
  safeGetStorage,
  safeSetStorage,
  safeGetString,
  safeSetString,
  safeRemoveStorage,
  safeGetSession,
  safeSetSession,
  safeRemoveSession,
} from './lib/storage';

export default function App() {
  // Database Connection Status
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  // Currency & Rate Configuration ($ USD / FC Franc Congolais)
  const [currency, setCurrency] = useState<'USD' | 'FC'>(() => {
    return safeGetString('autoconcession_currency', 'USD') as 'USD' | 'FC';
  });
  const [usdToFcRate] = useState<number>(2850);

  // Layout View Mode (Grid vs List)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>(() => {
    return safeGetString('autoconcession_layout', 'grid') as 'grid' | 'list';
  });

  useEffect(() => {
    safeSetString('autoconcession_currency', currency);
  }, [currency]);

  useEffect(() => {
    safeSetString('autoconcession_layout', layoutMode);
  }, [layoutMode]);

  // Multi-Tenant Dealership Accounts state
  const [dealershipAccounts, setDealershipAccounts] = useState<DealershipAccount[]>(() => {
    const saved = safeGetStorage<DealershipAccount[]>('autoconcession_accounts', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return INITIAL_DEALERSHIP_ACCOUNTS;
  });

  const [currentAccountId, setCurrentAccountId] = useState<string>(() => {
    return safeGetString('autoconcession_current_account_id', 'dealership-1');
  });

  // Current active account & dealership info
  const currentAccount = dealershipAccounts.find((a) => a.id === currentAccountId) || dealershipAccounts[0] || INITIAL_DEALERSHIP_ACCOUNTS[0];
  const dealership = currentAccount?.info || DEFAULT_DEALERSHIP_INFO;

  // Real-Time Vehicles, Leads & Accounts from Firestore
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = safeGetStorage<Vehicle[]>('autoconcession_vehicles', []);
    if (Array.isArray(saved) && saved.length > 0) {
      const parsedIds = new Set(saved.map((p) => p.id));
      const missing = INITIAL_VEHICLES.filter((iv) => !parsedIds.has(iv.id));
      return [...saved, ...missing];
    }
    return INITIAL_VEHICLES;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = safeGetStorage<Lead[]>('autoconcession_leads', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return INITIAL_LEADS;
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = safeGetStorage<string[]>('autoconcession_favorites', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return ['car-1', 'car-3'];
  });

  // Kinshasa Garages & Breakdown Requests State
  const [garages, setGarages] = useState<GarageProfile[]>(() => {
    const saved = safeGetStorage<GarageProfile[]>('autoconcession_garages', []);
    if (Array.isArray(saved) && saved.length > 0) {
      const parsedIds = new Set(saved.map(g => g.id));
      const missing = INITIAL_GARAGES.filter(ig => !parsedIds.has(ig.id));
      return [...saved, ...missing];
    }
    return INITIAL_GARAGES;
  });

  const [breakdownRequests, setBreakdownRequests] = useState<BreakdownRequest[]>(() => {
    return safeGetStorage<BreakdownRequest[]>('autoconcession_breakdown_requests', []);
  });

  useEffect(() => {
    safeSetStorage('autoconcession_garages', garages);
  }, [garages]);

  useEffect(() => {
    safeSetStorage('autoconcession_breakdown_requests', breakdownRequests);
  }, [breakdownRequests]);

  const handleAddGarage = (newGarage: GarageProfile) => {
    setGarages(prev => [newGarage, ...prev]);
  };

  const handleSaveGarage = (savedGarage: GarageProfile) => {
    setGarages(prev => {
      const exists = prev.some(g => g.id === savedGarage.id);
      if (exists) {
        return prev.map(g => (g.id === savedGarage.id ? savedGarage : g));
      }
      return [savedGarage, ...prev];
    });
  };

  const handleDeleteGarage = (garageId: string) => {
    setGarages(prev => prev.filter(g => g.id !== garageId));
  };

  const handleToggleCertifieGarage = (garageId: string) => {
    setGarages(prev => prev.map(g => g.id === garageId ? { ...g, estCertifie: !g.estCertifie } : g));
  };

  const handleToggleDepannage24hGarage = (garageId: string) => {
    setGarages(prev => prev.map(g => g.id === garageId ? { ...g, estDepannageMobile24h: !g.estDepannageMobile24h } : g));
  };

  const handleBreakdownRequestSubmit = (request: BreakdownRequest) => {
    setBreakdownRequests(prev => [request, ...prev]);
  };

  const handleUpdateBreakdownStatus = (requestId: string, status: BreakdownRequest['statut']) => {
    setBreakdownRequests(prev => prev.map(r => r.id === requestId ? { ...r, statut: status } : r));
  };

  const handleDeleteBreakdownRequest = (requestId: string) => {
    setBreakdownRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // Connect Real-Time Firestore Listeners
  useEffect(() => {
    const unsubVehicles = subscribeVehicles((data) => {
      setVehicles(data);
      setIsFirestoreConnected(true);
    });

    const unsubLeads = subscribeLeads((data) => {
      setLeads(data);
    });

    const unsubAccounts = subscribeAccounts((data) => {
      setDealershipAccounts(data);
    });

    return () => {
      unsubVehicles();
      unsubLeads();
      unsubAccounts();
    };
  }, []);

  // UI & View state
  const [currentView, setCurrentView] = useState<AppViewMode>('public');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Super Admin Security & PIN Authentication State
  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState<boolean>(() => {
    return safeGetSession('autoconcession_superadmin_auth', 'false') === 'true';
  });
  const [superAdminPin, setSuperAdminPin] = useState<string>(() => {
    return safeGetString('autoconcession_superadmin_pin', '2026');
  });
  const [isSuperAdminAuthModalOpen, setIsSuperAdminAuthModalOpen] = useState(false);

  const handleAuthenticateSuperAdmin = (pinEntered: string): boolean => {
    if (pinEntered === superAdminPin) {
      setIsSuperAdminAuthenticated(true);
      safeSetSession('autoconcession_superadmin_auth', 'true');
      setIsSuperAdminAuthModalOpen(false);
      setCurrentView('super-admin');
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleLogoutSuperAdmin = () => {
    setIsSuperAdminAuthenticated(false);
    safeRemoveSession('autoconcession_superadmin_auth');
    if (currentView === 'super-admin') {
      setCurrentView('admin-dashboard');
    }
  };

  const handleUpdateSuperAdminPin = (newPin: string) => {
    setSuperAdminPin(newPin);
    safeSetString('autoconcession_superadmin_pin', newPin);
  };

  // SaaS Subscription Plans state (Concessions)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = safeGetStorage<SubscriptionPlan[]>('autoconcession_subscription_plans', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return SUBSCRIPTION_PLANS;
  });

  // SaaS Subscription Plans state (Garages)
  const [garagePlans, setGaragePlans] = useState<GarageSubscriptionPlan[]>(() => {
    const saved = safeGetStorage<GarageSubscriptionPlan[]>('autoconcession_garage_subscription_plans', []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return GARAGE_SUBSCRIPTION_PLANS;
  });

  useEffect(() => {
    safeSetStorage('autoconcession_garage_subscription_plans', garagePlans);
  }, [garagePlans]);

  // Site Administrator Official Information State
  const [siteAdminInfo, setSiteAdminInfo] = useState<SiteAdminInfo>(() => {
    const saved = safeGetStorage<SiteAdminInfo | null>('autoconcession_site_admin_info', null);
    if (saved && typeof saved === 'object') return saved;
    return DEFAULT_SITE_ADMIN_INFO;
  });

  useEffect(() => {
    safeSetStorage('autoconcession_site_admin_info', siteAdminInfo);
  }, [siteAdminInfo]);

  useEffect(() => {
    safeSetStorage('autoconcession_subscription_plans', subscriptionPlans);
  }, [subscriptionPlans]);

  // Initialize Google Tag Manager, Meta Pixel, TikTok Pixel & Google Ads
  useEffect(() => {
    const adminGtm = siteAdminInfo.googleTagManagerId || siteAdminInfo.googleAnalyticsId?.replace('G-', 'GTM-');
    const dealerGtm = dealership.googleTagManagerId || dealership.googleAnalyticsId?.replace('G-', 'GTM-');

    if (adminGtm && (siteAdminInfo.googleTagManagerEnabled ?? siteAdminInfo.googleAnalyticsEnabled ?? true)) {
      initGoogleAnalytics(adminGtm, true);
    }
    if (dealerGtm && (dealership.googleTagManagerEnabled ?? dealership.googleAnalyticsEnabled ?? true) && dealerGtm !== adminGtm) {
      initGoogleAnalytics(dealerGtm, false);
    }

    // Meta Pixel
    const metaId = dealership.metaPixelId || siteAdminInfo.metaPixelId;
    const metaActive = (dealership.metaPixelEnabled ?? true) && (siteAdminInfo.metaPixelEnabled ?? true);
    if (metaId && metaActive) {
      initMetaPixel(metaId);
    }

    // TikTok Pixel
    const tikTokId = dealership.tikTokPixelId || siteAdminInfo.tikTokPixelId;
    const tikTokActive = (dealership.tikTokPixelEnabled ?? true) && (siteAdminInfo.tikTokPixelEnabled ?? true);
    if (tikTokId && tikTokActive) {
      initTikTokPixel(tikTokId);
    }

    // Google Ads
    const adsId = dealership.googleAdsId || siteAdminInfo.googleAdsId;
    const adsLabel = dealership.googleAdsConversionLabel || siteAdminInfo.googleAdsConversionLabel;
    const adsActive = (dealership.googleAdsEnabled ?? true) && (siteAdminInfo.googleAdsEnabled ?? true);
    if (adsId && adsActive) {
      initGoogleAds(adsId, adsLabel);
    }
  }, [
    siteAdminInfo.googleTagManagerId, 
    siteAdminInfo.googleAnalyticsId, 
    siteAdminInfo.googleTagManagerEnabled, 
    siteAdminInfo.googleAnalyticsEnabled,
    siteAdminInfo.metaPixelId,
    siteAdminInfo.metaPixelEnabled,
    siteAdminInfo.tikTokPixelId,
    siteAdminInfo.tikTokPixelEnabled,
    siteAdminInfo.googleAdsId,
    siteAdminInfo.googleAdsConversionLabel,
    siteAdminInfo.googleAdsEnabled,
    dealership.googleTagManagerId, 
    dealership.googleAnalyticsId, 
    dealership.googleTagManagerEnabled, 
    dealership.googleAnalyticsEnabled,
    dealership.metaPixelId,
    dealership.metaPixelEnabled,
    dealership.tikTokPixelId,
    dealership.tikTokPixelEnabled,
    dealership.googleAdsId,
    dealership.googleAdsConversionLabel,
    dealership.googleAdsEnabled
  ]);

  // Track Page Views across views
  useEffect(() => {
    const pageTitles: Record<AppViewMode, string> = {
      'public': 'Catalogue Véhicules & Concessions',
      'garages': 'Garages & SOS Dépannage Kinshasa 24/7',
      'admin-dashboard': `Tableau de Bord - ${dealership.nom}`,
      'admin-stock': `Gestion Stock - ${dealership.nom}`,
      'admin-leads': `Demandes & Essais - ${dealership.nom}`,
      'admin-settings': `Paramètres - ${dealership.nom}`,
      'admin-analytics': `Google Tag Manager - ${dealership.nom}`,
      'super-admin': 'Plateforme Super-Admin SaaS'
    };
    trackPageView(`/${currentView}`, pageTitles[currentView] || 'AutoConcession', dealership.nom);
  }, [currentView, dealership.nom]);

  const handleUpdateSubscriptionPlan = (updatedPlan: SubscriptionPlan) => {
    setSubscriptionPlans((prev) =>
      prev.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
  };

  const handleUpdateGaragePlan = (updatedPlan: GarageSubscriptionPlan) => {
    setGaragePlans((prev) =>
      prev.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
  };

  const handleUpdateAccountPrice = (accountId: string, newPrice: number) => {
    const target = dealershipAccounts.find((a) => a.id === accountId);
    if (target) {
      const updated = { ...target, prixFactureMensuel: newPrice };
      handleUpdateAccountStatus(updated);
    }
  };

  const handleUpdateGaragePrice = (garageId: string, newPrice: number) => {
    setGarages((prev) =>
      prev.map((g) => (g.id === garageId ? { ...g, prixFactureMensuel: newPrice } : g))
    );
  };

  const handleUpdateGarageStatus = (updatedGarage: GarageProfile) => {
    setGarages((prev) =>
      prev.map((g) => (g.id === updatedGarage.id ? updatedGarage : g))
    );
  };

  const handleToggleMaskGarage = (garageId: string) => {
    setGarages((prev) =>
      prev.map((g) => (g.id === garageId ? { ...g, estMasque: !g.estMasque } : g))
    );
  };

  // Dealership & User Auth (Node.js + MySQL) State
  const [isDealershipAuthModalOpen, setIsDealershipAuthModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('congocar_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [isDealershipLoggedIn, setIsDealershipLoggedIn] = useState<boolean>(() => {
    return safeGetString('autoconcession_dealership_auth', 'false') === 'true' || Boolean(localStorage.getItem('congocar_token'));
  });

  const handleLoginDealershipSuccess = (account: DealershipAccount, userProfile?: any) => {
    if (userProfile) {
      setAuthUser(userProfile);
      localStorage.setItem('congocar_user', JSON.stringify(userProfile));
    }
    setCurrentAccountId(account.id);
    setIsDealershipLoggedIn(true);
    safeSetString('autoconcession_dealership_auth', 'true');

    // Navigation adaptative selon le rôle CONGOCAR
    const userRole = userProfile?.role || (account as any).role || 'dealer';
    if (userRole === 'admin') {
      setIsAdmin(true);
      setIsSuperAdminAuthenticated(true);
      setCurrentView('super-admin');
    } else if (userRole === 'dealer' || userRole === 'seller') {
      setIsAdmin(true);
      setCurrentView('admin-dashboard');
    } else if (userRole === 'garage') {
      setIsAdmin(false);
      setCurrentView('garages');
    } else {
      setIsAdmin(false);
      setCurrentView('public');
    }
  };

  const handleLogoutDealership = () => {
    setIsDealershipLoggedIn(false);
    setAuthUser(null);
    safeRemoveStorage('autoconcession_dealership_auth');
    localStorage.removeItem('congocar_token');
    localStorage.removeItem('congocar_user');
    setIsAdmin(false);
    setIsSuperAdminAuthenticated(false);
    setCurrentView('public');
  };

  // SaaS Registration & Invoice Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);

  // Public Filter state
  const [filterDealership, setFilterDealership] = useState('ALL');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterFuel, setFilterFuel] = useState('ALL');
  const [filterTransmission, setFilterTransmission] = useState('ALL');
  const [filterCondition, setFilterCondition] = useState('ALL');
  const [filterPromo, setFilterPromo] = useState<'ALL' | 'PROMO'>('ALL');
  const [priceMax, setPriceMax] = useState<number>(350000);
  const [kmMax, setKmMax] = useState<number>(250000);
  const [sortBy, setSortBy] = useState<'recent' | 'prix-asc' | 'prix-desc' | 'km-asc' | 'annee-desc'>('recent');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [motorsListingTab, setMotorsListingTab] = useState<'popular' | 'recent' | 'featured'>('popular');

  // Vehicle Modals
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [selectedVehicleForTestDrive, setSelectedVehicleForTestDrive] = useState<Vehicle | null>(null);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

  // Social Share Modal State
  const [selectedVehicleForShare, setSelectedVehicleForShare] = useState<Vehicle | null>(null);
  const [isShareDealershipModalOpen, setIsShareDealershipModalOpen] = useState(false);

  // Comparison state
  const [comparedVehicleIds, setComparedVehicleIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // LocalStorage Sync
  useEffect(() => {
    safeSetStorage('autoconcession_accounts', dealershipAccounts);
  }, [dealershipAccounts]);

  useEffect(() => {
    safeSetString('autoconcession_current_account_id', currentAccountId);
  }, [currentAccountId]);

  useEffect(() => {
    safeSetStorage('autoconcession_vehicles', vehicles);
  }, [vehicles]);

  useEffect(() => {
    safeSetStorage('autoconcession_leads', leads);
  }, [leads]);

  useEffect(() => {
    safeSetStorage('autoconcession_favorites', favoriteIds);
  }, [favoriteIds]);

  // Global Quick Navigation & Page Closing Handlers
  const closeAllModals = () => {
    setSelectedVehicleForModal(null);
    setSelectedVehicleForTestDrive(null);
    setSelectedVehicleForShare(null);
    setIsShareDealershipModalOpen(false);
    setIsCompareModalOpen(false);
    setIsAddVehicleModalOpen(false);
    setIsRegisterModalOpen(false);
    setSelectedInvoiceForModal(null);
    setIsSuperAdminAuthModalOpen(false);
    setIsDealershipAuthModalOpen(false);
  };

  const handleNavigateHome = () => {
    closeAllModals();
    setCurrentView('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveModal = !!(
    selectedVehicleForModal ||
    selectedVehicleForTestDrive ||
    selectedVehicleForShare ||
    isShareDealershipModalOpen ||
    isCompareModalOpen ||
    isAddVehicleModalOpen ||
    isRegisterModalOpen ||
    selectedInvoiceForModal ||
    isSuperAdminAuthModalOpen ||
    isDealershipAuthModalOpen
  );

  const handleCloseCurrentPage = () => {
    if (hasActiveModal) {
      closeAllModals();
    } else {
      setCurrentView('public');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard shortcut: Escape closes modal or returns to home page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasActiveModal) {
          closeAllModals();
        } else if (currentView !== 'public') {
          setCurrentView('public');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasActiveModal, currentView]);

  // Derived Lists
  // Dealerships visible in the public catalogue (not masked by administrator)
  const visibleDealershipAccounts = dealershipAccounts.filter((acc) => !acc.estMasque);
  const visibleDealershipIds = new Set(visibleDealershipAccounts.map((acc) => acc.id));

  const availableBrands = Array.from(new Set(vehicles.map((v) => v.marque)));
  const availableCategories = Array.from(new Set(vehicles.map((v) => v.categorie)));

  // Filter logic - Public Client View aggregates all vehicles from all visible dealerships
  const publicFilteredVehicles = vehicles.filter((v) => {
    // If vehicle belongs to a dealership that has been masked by super-admin, hide it from public catalog
    if (v.dealershipId && !visibleDealershipIds.has(v.dealershipId)) {
      return false;
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      v.marque.toLowerCase().includes(q) ||
      v.modele.toLowerCase().includes(q) ||
      v.finition.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q);

    const matchesDealership = filterDealership === 'ALL' || v.dealershipId === filterDealership;
    const matchesBrand = filterBrand === 'ALL' || v.marque === filterBrand;
    const matchesCategory = filterCategory === 'ALL' || v.categorie === filterCategory;
    const matchesFuel = filterFuel === 'ALL' || v.carburant === filterFuel;
    const matchesTransmission = filterTransmission === 'ALL' || v.transmission === filterTransmission;
    const matchesCondition = filterCondition === 'ALL' || v.etat === filterCondition;
    const isPromoVehicle = Boolean(v.enPromo) || 
                           Boolean(v.remiseInstantanee && v.remiseInstantanee > 0) || 
                           Boolean(v.ancienPrix && v.ancienPrix > v.prix) || 
                           Boolean(v.msrp && v.msrp > v.prix);

    const matchesPromo = filterPromo === 'ALL' || isPromoVehicle;
    const matchesPrice = v.prix <= priceMax;
    const matchesKm = v.kilometrage <= kmMax;
    const matchesFavorites = !onlyFavorites || favoriteIds.includes(v.id);

    return (
      matchesSearch &&
      matchesDealership &&
      matchesBrand &&
      matchesCategory &&
      matchesFuel &&
      matchesTransmission &&
      matchesCondition &&
      matchesPromo &&
      matchesPrice &&
      matchesKm &&
      matchesFavorites
    );
  }).sort((a, b) => {
    if (sortBy === 'prix-asc') return a.prix - b.prix;
    if (sortBy === 'prix-desc') return b.prix - a.prix;
    if (sortBy === 'km-asc') return a.kilometrage - b.kilometrage;
    if (sortBy === 'annee-desc') return b.annee - a.annee;

    // Default sorting guided by Motors tab (Popular, Recent, Featured)
    if (motorsListingTab === 'featured') {
      if (a.enVedette && !b.enVedette) return -1;
      if (!a.enVedette && b.enVedette) return 1;
    } else if (motorsListingTab === 'popular') {
      const aSavings = (a.remiseInstantanee || 0) + ((a.msrp && a.msrp > a.prix) ? a.msrp - a.prix : 0);
      const bSavings = (b.remiseInstantanee || 0) + ((b.msrp && b.msrp > b.prix) ? b.msrp - b.prix : 0);
      if (aSavings !== bSavings) return bSavings - aSavings;
    }

    return new Date(b.dateAjout).getTime() - new Date(a.dateAjout).getTime();
  });

  // Multi-Tenant SaaS Handlers
  const handleRegisterDealership = (newAccount: DealershipAccount) => {
    setDealershipAccounts([newAccount, ...dealershipAccounts]);
    saveAccountToFirestore(newAccount).catch(console.error);
    setCurrentAccountId(newAccount.id);
    setIsRegisterModalOpen(false);
    setIsAdmin(true);
    setCurrentView('admin-dashboard');
  };

  const handleUpdateAccountStatus = (updatedAccount: DealershipAccount) => {
    setDealershipAccounts(
      dealershipAccounts.map((a) => (a.id === updatedAccount.id ? updatedAccount : a))
    );
    saveAccountToFirestore(updatedAccount).catch(console.error);
  };

  const handleToggleMaskAccount = (accountId: string) => {
    const updated = dealershipAccounts.map((a) => {
      if (a.id === accountId) {
        const accUpdated = { ...a, estMasque: !a.estMasque };
        saveAccountToFirestore(accUpdated).catch(console.error);
        return accUpdated;
      }
      return a;
    });
    setDealershipAccounts(updated);
  };

  const handleUpdateAccountPassword = (accountId: string, newPassword: string) => {
    const updated = dealershipAccounts.map((a) => {
      if (a.id === accountId) {
        const accUpdated = { ...a, motDePasse: newPassword };
        saveAccountToFirestore(accUpdated).catch(console.error);
        return accUpdated;
      }
      return a;
    });
    setDealershipAccounts(updated);
  };

  const handleIssueInvoice = (dealershipId: string, description: string, amountHT: number) => {
    const targetAccount = dealershipAccounts.find((a) => a.id === dealershipId);
    if (!targetAccount) return;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 15);

    const newInvoice: Invoice = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      dealershipId,
      dealershipNom: targetAccount.info.nom,
      typeEntite: 'concession',
      montantHT: amountHT,
      tva: amountHT * 0.16,
      montantTTC: amountHT * 1.16,
      dateEmission: today.toISOString().split('T')[0],
      dateEcheance: dueDate.toISOString().split('T')[0],
      statut: 'en_attente',
      periode: `${today.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`,
      description
    };

    const updatedAccount: DealershipAccount = {
      ...targetAccount,
      statutAbonnement: 'facture_en_attente',
      invoices: [newInvoice, ...targetAccount.invoices]
    };

    handleUpdateAccountStatus(updatedAccount);
    setSelectedInvoiceForModal(newInvoice);
  };

  const handleIssueGarageInvoice = (garageId: string, description: string, amountHT: number) => {
    const targetGarage = garages.find((g) => g.id === garageId);
    if (!targetGarage) return;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 15);

    const newInvoice: Invoice = {
      id: `INV-GAR-${Math.floor(100 + Math.random() * 900)}`,
      garageId,
      garageNom: targetGarage.nom,
      typeEntite: 'garage',
      montantHT: amountHT,
      tva: amountHT * 0.16,
      montantTTC: amountHT * 1.16,
      dateEmission: today.toISOString().split('T')[0],
      dateEcheance: dueDate.toISOString().split('T')[0],
      statut: 'en_attente',
      periode: `${today.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`,
      description
    };

    const updatedGarage: GarageProfile = {
      ...targetGarage,
      statutAbonnement: 'facture_en_attente',
      invoices: [newInvoice, ...(targetGarage.invoices || [])]
    };

    handleUpdateGarageStatus(updatedGarage);
    setSelectedInvoiceForModal(newInvoice);
  };

  const handleMarkInvoicePaid = (invoiceId: string) => {
    // Check dealerships
    dealershipAccounts.forEach((acc) => {
      const hasInv = acc.invoices.some((inv) => inv.id === invoiceId);
      if (hasInv) {
        const updatedInvoices = acc.invoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, statut: 'payee' as const, moyenPaiement: 'Carte / Virement' } : inv
        );

        const updatedAcc: DealershipAccount = {
          ...acc,
          statutAbonnement: 'actif' as SubscriptionStatus,
          invoices: updatedInvoices
        };
        handleUpdateAccountStatus(updatedAcc);
      }
    });

    // Check garages
    garages.forEach((g) => {
      const hasInv = (g.invoices || []).some((inv) => inv.id === invoiceId);
      if (hasInv) {
        const updatedInvoices = (g.invoices || []).map((inv) =>
          inv.id === invoiceId ? { ...inv, statut: 'payee' as const, moyenPaiement: 'Carte / Virement' } : inv
        );

        const updatedGarage: GarageProfile = {
          ...g,
          statutAbonnement: 'actif' as SubscriptionStatus,
          invoices: updatedInvoices
        };
        handleUpdateGarageStatus(updatedGarage);
      }
    });
  };

  const handleExtendTrialDays = (account: DealershipAccount, daysToAdd: number) => {
    const currentEnd = new Date(account.finEssaiGratuit);
    currentEnd.setDate(currentEnd.getDate() + daysToAdd);

    const updated: DealershipAccount = {
      ...account,
      finEssaiGratuit: currentEnd.toISOString().split('T')[0],
      statutAbonnement: 'essai_gratuit'
    };

    handleUpdateAccountStatus(updated);
  };

  const handleExtendGarageTrialDays = (garage: GarageProfile, daysToAdd: number) => {
    const currentEnd = new Date(garage.finEssaiGratuit || '2026-08-31');
    currentEnd.setDate(currentEnd.getDate() + daysToAdd);

    const updated: GarageProfile = {
      ...garage,
      finEssaiGratuit: currentEnd.toISOString().split('T')[0],
      statutAbonnement: 'essai_gratuit'
    };

    handleUpdateGarageStatus(updated);
  };

  const handleDeleteAccount = (accountId: string) => {
    const remainingAccounts = dealershipAccounts.filter((a) => a.id !== accountId);
    setDealershipAccounts(remainingAccounts);

    // Also remove vehicles belonging to this dealership locally and in Firestore
    const remainingVehicles = vehicles.filter((v) => v.dealershipId !== accountId);
    setVehicles(remainingVehicles);

    deleteDealershipAndVehicles(accountId, vehicles).catch(console.error);

    if (currentAccountId === accountId && remainingAccounts.length > 0) {
      setCurrentAccountId(remainingAccounts[0].id);
    }
  };

  const handleSaveDealershipInfo = (newInfo: DealershipInfo) => {
    const updated = dealershipAccounts.map((acc) => {
      if (acc.id === currentAccountId) {
        const accUpdated = { ...acc, info: newInfo };
        saveAccountToFirestore(accUpdated).catch(console.error);
        return accUpdated;
      }
      return acc;
    });
    setDealershipAccounts(updated);
  };

  // Standard Handlers
  const handleOpenVehicleModal = (v: Vehicle) => {
    setSelectedVehicleForModal(v);
    const dName = dealershipAccounts.find(a => a.id === v.dealershipId)?.info.nom || dealership.nom;
    trackVehicleView(v.id, `${v.marque} ${v.modele}`, dName, v.prix);
  };

  const handleToggleFavorite = (id: string) => {
    if (favoriteIds.includes(id)) {
      setFavoriteIds(favoriteIds.filter((fav) => fav !== id));
    } else {
      setFavoriteIds([...favoriteIds, id]);
    }
  };

  const handleToggleCompare = (id: string) => {
    if (comparedVehicleIds.includes(id)) {
      setComparedVehicleIds(comparedVehicleIds.filter((c) => c !== id));
    } else {
      if (comparedVehicleIds.length >= 3) {
        alert('Vous pouvez comparer jusqu\'à 3 véhicules simultanément.');
        return;
      }
      setComparedVehicleIds([...comparedVehicleIds, id]);
    }
  };

  const handleSaveVehicle = (data: Omit<Vehicle, 'id' | 'dateAjout'>, editId?: string) => {
    if (editId) {
      const existing = vehicles.find((v) => v.id === editId);
      if (existing) {
        const updatedVehicle: Vehicle = { ...existing, ...data };
        setVehicles(vehicles.map((v) => (v.id === editId ? updatedVehicle : v)));
        saveVehicleToFirestore(updatedVehicle).catch(console.error);
      }
    } else {
      const newVehicle: Vehicle = {
        ...data,
        id: `car-${Date.now()}`,
        dateAjout: new Date().toISOString().split('T')[0]
      };
      setVehicles([newVehicle, ...vehicles]);
      saveVehicleToFirestore(newVehicle).catch(console.error);

      // Update vehicle counter on account
      if (currentAccount) {
        const updatedAcc = { ...currentAccount, nbVehiculesActifs: currentAccount.nbVehiculesActifs + 1 };
        handleUpdateAccountStatus(updatedAcc);
      }
    }
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
    deleteVehicleFromFirestore(id).catch(console.error);
    setComparedVehicleIds(comparedVehicleIds.filter((c) => c !== id));
    setFavoriteIds(favoriteIds.filter((f) => f !== id));
  };

  const handleDuplicateVehicle = (v: Vehicle) => {
    const dup: Vehicle = {
      ...v,
      id: `car-${Date.now()}`,
      modele: `${v.modele} (Copie)`,
      vin: `WBA${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      dateAjout: new Date().toISOString().split('T')[0]
    };
    setVehicles([dup, ...vehicles]);
    saveVehicleToFirestore(dup).catch(console.error);
  };

  const handleUpdateStatus = (id: string, status: VehicleStatus) => {
    const target = vehicles.find((v) => v.id === id);
    if (target) {
      const updated = { ...target, status };
      setVehicles(vehicles.map((v) => (v.id === id ? updated : v)));
      saveVehicleToFirestore(updated).catch(console.error);
    }
  };

  const handleToggleVedette = (id: string) => {
    const target = vehicles.find((v) => v.id === id);
    if (target) {
      const updated = { ...target, enVedette: !target.enVedette };
      setVehicles(vehicles.map((v) => (v.id === id ? updated : v)));
      saveVehicleToFirestore(updated).catch(console.error);
    }
  };

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'dateDemande' | 'statut'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      dateDemande: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      statut: 'nouveau'
    };
    setLeads([newLead, ...leads]);
    saveLeadToFirestore(newLead).catch(console.error);

    // Track in Google Analytics
    if (leadData.typeDemande === 'essai') {
      trackTestDriveRequest(
        leadData.vehicleId, 
        leadData.vehicleTitle, 
        leadData.nomClient, 
        dealership.nom
      );
    } else {
      trackLeadSubmitted(
        leadData.typeDemande,
        leadData.vehicleId,
        leadData.vehicleTitle,
        dealership.nom,
        leadData.nomClient
      );
    }
  };

  const handleUpdateLeadStatus = (id: string, statut: Lead['statut'], notesAdmin?: string) => {
    const target = leads.find((l) => l.id === id);
    if (target) {
      const updated = { ...target, statut, notesAdmin };
      setLeads(leads.map((l) => (l.id === id ? updated : l)));
      saveLeadToFirestore(updated).catch(console.error);
    }
  };

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter((l) => l.id !== id));
    deleteLeadFromFirestore(id).catch(console.error);
  };

  const resetFilterOptions = () => {
    setFilterDealership('ALL');
    setFilterBrand('ALL');
    setFilterCategory('ALL');
    setFilterFuel('ALL');
    setFilterTransmission('ALL');
    setFilterCondition('ALL');
    setFilterPromo('ALL');
    setPriceMax(350000);
    setKmMax(250000);
    setSearchQuery('');
    setOnlyFavorites(false);
  };

  const comparedVehiclesList = vehicles.filter((v) => comparedVehicleIds.includes(v.id));
  const unreadLeadsCount = leads.filter((l) => l.statut === 'nouveau').length;

  // Counts for MOTORS Browse Sections
  const countsByBrand: Record<string, number> = {};
  vehicles.forEach((v) => {
    countsByBrand[v.marque] = (countsByBrand[v.marque] || 0) + 1;
  });

  const countsByCategory: Record<string, number> = {};
  vehicles.forEach((v) => {
    countsByCategory[v.categorie] = (countsByCategory[v.categorie] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top MOTORS Header with Live Search, Nav, and Currency Switcher */}
      <MotorsHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        isAdmin={isAdmin}
        isDealershipLoggedIn={isDealershipLoggedIn}
        onOpenLogin={() => setIsDealershipAuthModalOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onLogout={handleLogoutDealership}
        currency={currency}
        setCurrency={setCurrency}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        comparedVehicleIds={comparedVehicleIds}
        openCompareModal={() => setIsCompareModalOpen(true)}
        favoriteIds={favoriteIds}
        openAddVehicleModal={() => {
          setVehicleToEdit(null);
          setIsAddVehicleModalOpen(true);
        }}
        unreadLeadsCount={unreadLeadsCount}
        dealershipName={dealership.nom}
        onOpenShare={() => {
          setSelectedVehicleForShare(null);
          setIsShareDealershipModalOpen(true);
        }}
        onSelectVehicle={handleOpenVehicleModal}
        vehicles={vehicles}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Real Firestore Database Banner Status */}
        {isAdmin && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="font-extrabold text-slate-900">Base de Données Firestore Cloud :</span>
              <span className="text-emerald-700 font-bold">
                {isFirestoreConnected ? 'Connectée en Direct (Stock & Prospects Temps Réel)' : 'Connexion en cours...'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
              ID Firestore : turnkey-physics-n9v0l
            </div>
          </div>
        )}

        {/* Trial Notification Banner for Dealership Pro Admin Views */}
        {isAdmin && currentView !== 'super-admin' && currentAccount && (
          <TrialNotificationBanner
            account={currentAccount}
            subscriptionPlans={subscriptionPlans}
            onRequestInvoice={() => {
              if (currentAccount.invoices.length > 0) {
                setSelectedInvoiceForModal(currentAccount.invoices[0]);
              } else {
                handleIssueInvoice(currentAccount.id, "Activating Paid Subscription (Post Trial)", currentAccount.prixFactureMensuel);
              }
            }}
            onOpenSuperAdmin={() => {
              if (isSuperAdminAuthenticated) {
                setCurrentView('super-admin');
              } else {
                setIsSuperAdminAuthModalOpen(true);
              }
            }}
          />
        )}

        {/* SUPER ADMIN SAAS BILLING & GARAGES VIEW */}
        {currentView === 'super-admin' && (
          isSuperAdminAuthenticated ? (
            <SuperAdminDashboard
              dealershipAccounts={dealershipAccounts}
              subscriptionPlans={subscriptionPlans}
              garagePlans={garagePlans}
              siteAdminInfo={siteAdminInfo}
              garages={garages}
              breakdownRequests={breakdownRequests}
              onSaveGarage={handleSaveGarage}
              onDeleteGarage={handleDeleteGarage}
              onToggleCertifieGarage={handleToggleCertifieGarage}
              onToggleDepannage24hGarage={handleToggleDepannage24hGarage}
              onUpdateBreakdownRequestStatus={handleUpdateBreakdownStatus}
              onDeleteBreakdownRequest={handleDeleteBreakdownRequest}
              onUpdateSiteAdminInfo={(updated) => setSiteAdminInfo(updated)}
              onUpdateSubscriptionPlan={handleUpdateSubscriptionPlan}
              onUpdateGaragePlan={handleUpdateGaragePlan}
              onUpdateAccountPrice={handleUpdateAccountPrice}
              onUpdateGaragePrice={handleUpdateGaragePrice}
              onUpdateAccountStatus={handleUpdateAccountStatus}
              onUpdateGarageStatus={handleUpdateGarageStatus}
              onToggleMaskAccount={handleToggleMaskAccount}
              onToggleMaskGarage={handleToggleMaskGarage}
              onUpdateAccountPassword={handleUpdateAccountPassword}
              onIssueInvoice={handleIssueInvoice}
              onIssueGarageInvoice={handleIssueGarageInvoice}
              onMarkInvoicePaid={handleMarkInvoicePaid}
              onExtendTrialDays={handleExtendTrialDays}
              onExtendGarageTrialDays={handleExtendGarageTrialDays}
              onSelectDealershipContext={(acc) => {
                setCurrentAccountId(acc.id);
                setCurrentView('admin-dashboard');
              }}
              onDeleteAccount={handleDeleteAccount}
              onViewInvoice={(inv) => setSelectedInvoiceForModal(inv)}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onLogoutSuperAdmin={handleLogoutSuperAdmin}
              onNavigateHome={handleNavigateHome}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-md my-12">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Espace Super-Administrateur Verrouillé
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cet espace est réservé au gestionnaire de la plateforme SaaS. Veuillez entrer votre code PIN administrateur pour déverrouiller la gestion globale des concessions.
              </p>
              <button
                onClick={() => setIsSuperAdminAuthModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                <span>S'authentifier avec mon Code PIN</span>
              </button>
            </div>
          )
        )}

        {/* KINSHASA GARAGES & BREAKDOWN DIRECTORY VIEW */}
        {currentView === 'garages' && (
          <GarageDirectory
            garages={garages}
            onAddGarage={handleAddGarage}
            onSubmitBreakdownRequest={handleBreakdownRequestSubmit}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* PUBLIC CATALOGUE VIEW - MOTORS SHOWCASE THEME */}
        {currentView === 'public' && (
          <div className="space-y-10">

            {/* 1. HERO SEARCH (Exact Video Layout: Blue Tabs, Dropdowns, '🔍 X Cars' CTA) */}
            <MotorsHeroSearch
              vehicles={vehicles}
              onSearch={(filters) => {
                if (filters.condition === 'ALL') {
                  setFilterCondition('ALL');
                } else {
                  setFilterCondition(filters.condition);
                }
                if (filters.make && filters.make !== 'ALL') {
                  setFilterBrand(filters.make);
                }
                if (filters.model && filters.model !== 'ALL') {
                  setSearchQuery(filters.model);
                }
                const target = document.getElementById('motors-cars-section');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />

            {/* 2. BROWSE BY MAKE & BROWSE BY BODY (Exact Video Layout with Icons & Badges) */}
            <MotorsBrowseSections
              availableBrands={availableBrands}
              selectedBrand={filterBrand}
              onSelectBrand={(brand) => {
                setFilterBrand(filterBrand === brand ? 'ALL' : brand);
                const target = document.getElementById('motors-cars-section');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              selectedCategory={filterCategory}
              onSelectCategory={(category) => {
                setFilterCategory(filterCategory === category ? 'ALL' : category);
                const target = document.getElementById('motors-cars-section');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              countsByBrand={countsByBrand}
              countsByCategory={countsByCategory}
            />

            {/* 3. SOS KINSHASA SERVICE & GARAGES SHORTCUT BANNER */}
            <div className="bg-gradient-to-r from-rose-50 via-amber-50/40 to-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <span className="text-xl">🔧</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Urgence Kinshasa 24/7
                    </span>
                    <span className="text-xs text-amber-800 font-bold">Réseau Garages & Dépanneurs</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    Besoin d'un mécanicien, remorquage ou dépannage immédiat à Kinshasa ?
                  </h3>
                  <p className="text-xs text-slate-600">
                    Trouvez un garage certifié ou déclenchez une intervention mobile d'urgence dans les 24 communes (Gombe, Limete, Ngaliema...).
                  </p>
                </div>
              </div>
              <button
                id="btn-public-goto-garages"
                onClick={() => setCurrentView('garages')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              >
                <span>Trouver un Garage / Dépanneur</span>
                <span>→</span>
              </button>
            </div>

            {/* 4. NEW / USED CARS SHOWCASE SECTION */}
            <div id="motors-cars-section" className="space-y-6 pt-2">
              
              {/* Section Header with exact video Sub-tabs */}
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-4 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    New/Used Cars
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Explore all inspected premium vehicles available across our dealership network
                  </p>
                </div>

                {/* Sub-tabs matching video: Popular items | Recent items | Featured items */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMotorsListingTab('popular')}
                    className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      motorsListingTab === 'popular'
                        ? 'bg-[#1c71d8] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                  >
                    <span>Popular items</span>
                    {motorsListingTab === 'popular' && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1c71d8]" />
                    )}
                  </button>

                  <button
                    onClick={() => setMotorsListingTab('recent')}
                    className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      motorsListingTab === 'recent'
                        ? 'bg-[#1c71d8] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                  >
                    <span>Recent items</span>
                    {motorsListingTab === 'recent' && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1c71d8]" />
                    )}
                  </button>

                  <button
                    onClick={() => setMotorsListingTab('featured')}
                    className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      motorsListingTab === 'featured'
                        ? 'bg-[#1c71d8] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                  >
                    <span>Featured items</span>
                    {motorsListingTab === 'featured' && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1c71d8]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Refined Quick Filter & Control Bar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                    <SlidersHorizontal className="w-4 h-4 text-[#1c71d8]" />
                    <span>Affiner la sélection</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs">
                    <button
                      onClick={() => setFilterPromo(filterPromo === 'PROMO' ? 'ALL' : 'PROMO')}
                      className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
                        filterPromo === 'PROMO'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Tag className={`w-3.5 h-3.5 ${filterPromo === 'PROMO' ? 'fill-current text-white' : 'text-rose-500'}`} />
                      <span>Promotions / Ventes Flash</span>
                    </button>

                    <button
                      onClick={() => setOnlyFavorites(!onlyFavorites)}
                      className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        onlyFavorites
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-white' : 'text-rose-500'}`} />
                      <span>Favoris ({favoriteIds.length})</span>
                    </button>

                    <button
                      onClick={resetFilterOptions}
                      className="text-slate-500 hover:text-[#1c71d8] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
                    </button>
                  </div>
                </div>

                {/* Filter Selects Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs">
                  {/* Concession */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Concession</label>
                    <select
                      value={filterDealership}
                      onChange={(e) => setFilterDealership(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-lg p-2 focus:outline-none focus:border-[#1c71d8]"
                    >
                      <option value="ALL">🌟 Tout le réseau ({publicFilteredVehicles.length})</option>
                      {visibleDealershipAccounts.map((acc) => {
                        const count = vehicles.filter((v) => v.dealershipId === acc.id).length;
                        return (
                          <option key={acc.id} value={acc.id}>
                            🏢 {acc.info.nom} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Marque</label>
                    <select
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-[#1c71d8] font-medium"
                    >
                      <option value="ALL">Toutes marques</option>
                      {availableBrands.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Carrosserie</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-[#1c71d8] font-medium"
                    >
                      <option value="ALL">Toutes carrosseries</option>
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fuel */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Carburant</label>
                    <select
                      value={filterFuel}
                      onChange={(e) => setFilterFuel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-[#1c71d8] font-medium"
                    >
                      <option value="ALL">Tous carburants</option>
                      <option value="Essence">Essence</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybride">Hybride</option>
                      <option value="Électrique">Électrique</option>
                    </select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Boîte</label>
                    <select
                      value={filterTransmission}
                      onChange={(e) => setFilterTransmission(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-[#1c71d8] font-medium"
                    >
                      <option value="ALL">Toutes boîtes</option>
                      <option value="Automatique">Automatique</option>
                      <option value="Manuelle">Manuelle</option>
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">État</label>
                    <select
                      value={filterCondition}
                      onChange={(e) => setFilterCondition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-[#1c71d8] font-medium"
                    >
                      <option value="ALL">Neuf & Occasion</option>
                      <option value="occasion">Occasions certifiées</option>
                      <option value="neuf">Véhicules neufs</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Trier par</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-[#1c71d8] font-bold rounded-lg p-2 focus:outline-none"
                    >
                      <option value="recent">Pertinence / Récents</option>
                      <option value="prix-asc">Prix : croissant</option>
                      <option value="prix-desc">Prix : décroissant</option>
                      <option value="km-asc">Kilométrage : croissant</option>
                      <option value="annee-desc">Année récente</option>
                    </select>
                  </div>
                </div>

                {/* Sliders for Price & Mileage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Prix maximum</span>
                      <span className="text-[#1c71d8] font-bold">
                        {priceMax >= 350000 ? 'Illimité (350 000+ €)' : `${priceMax.toLocaleString('fr-FR')} €`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="350000"
                      step="5000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1c71d8]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Kilométrage maximum</span>
                      <span className="text-[#1c71d8] font-bold">
                        {kmMax >= 250000 ? 'Illimité (250 000+ km)' : `${kmMax.toLocaleString('fr-FR')} km`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="250000"
                      step="5000"
                      value={kmMax}
                      onChange={(e) => setKmMax(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1c71d8]"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filter Chips */}
              <ActiveFilterChips
                filterBrand={filterBrand}
                setFilterBrand={setFilterBrand}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterFuel={filterFuel}
                setFilterFuel={setFilterFuel}
                filterTransmission={filterTransmission}
                setFilterTransmission={setFilterTransmission}
                filterCondition={filterCondition}
                setFilterCondition={setFilterCondition}
                filterPromo={filterPromo}
                setFilterPromo={setFilterPromo}
                filterDealership={filterDealership}
                setFilterDealership={setFilterDealership}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                kmMax={kmMax}
                setKmMax={setKmMax}
                onlyFavorites={onlyFavorites}
                setOnlyFavorites={setOnlyFavorites}
                dealershipAccounts={dealershipAccounts}
                onResetAll={resetFilterOptions}
                totalResults={publicFilteredVehicles.length}
                currency={currency}
                usdToFcRate={usdToFcRate}
              />

              {/* Results Counter & Layout Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                <p>
                  Affichage de <span className="text-[#1c71d8] font-bold">{publicFilteredVehicles.length}</span> véhicule(s) disponible(s)
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg shadow-xs">
                    <button
                      onClick={() => setLayoutMode('grid')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        layoutMode === 'grid' ? 'bg-[#1c71d8] text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Grille</span>
                    </button>
                    <button
                      onClick={() => setLayoutMode('list')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        layoutMode === 'list' ? 'bg-[#1c71d8] text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Liste</span>
                    </button>
                  </div>

                  <button
                    id="share-stock-button"
                    onClick={() => {
                      setSelectedVehicleForShare(null);
                      setIsShareDealershipModalOpen(true);
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    title="Partager le stock de la concession"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#1c71d8]" />
                    <span>Partager</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setVehicleToEdit(null);
                        setIsAddVehicleModalOpen(true);
                      }}
                      className="text-[#1c71d8] hover:underline flex items-center gap-1 font-bold"
                    >
                      <PlusCircle className="w-4 h-4" /> Publier
                    </button>
                  )}
                </div>
              </div>

              {/* MOTORS Vehicle Showcase Cards Grid (Exact Design from Video) */}
              {publicFilteredVehicles.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
                  <Car className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">Aucun véhicule ne correspond aux filtres</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Essayez d'élargir vos critères de recherche ou réinitialisez les filtres.
                  </p>
                  <button
                    onClick={resetFilterOptions}
                    className="bg-[#1c71d8] text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow-xs cursor-pointer hover:bg-[#1558b0] transition"
                  >
                    Réinitialiser tous les filtres
                  </button>
                </div>
              ) : layoutMode === 'list' ? (
                <div className="flex flex-col space-y-4">
                  {publicFilteredVehicles.map((vehicle) => {
                    const ownerAcc = dealershipAccounts.find((a) => a.id === vehicle.dealershipId);
                    return (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        dealershipName={ownerAcc?.info.nom || (vehicle.dealershipId ? undefined : dealership.nom)}
                        onSelectVehicle={handleOpenVehicleModal}
                        onRequestTestDrive={(v) => setSelectedVehicleForTestDrive(v)}
                        isCompared={comparedVehicleIds.includes(vehicle.id)}
                        onToggleCompare={handleToggleCompare}
                        isFavorite={favoriteIds.includes(vehicle.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onShareVehicle={(v) => setSelectedVehicleForShare(v)}
                        isAdmin={isAdmin}
                        onEditVehicle={(v) => {
                          setVehicleToEdit(v);
                          setIsAddVehicleModalOpen(true);
                        }}
                        currency={currency}
                        usdToFcRate={usdToFcRate}
                        layoutMode="list"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicFilteredVehicles.map((vehicle) => {
                    return (
                      <MotorsVehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onSelectVehicle={handleOpenVehicleModal}
                        onRequestTestDrive={(v) => setSelectedVehicleForTestDrive(v)}
                        isCompared={comparedVehicleIds.includes(vehicle.id)}
                        onToggleCompare={handleToggleCompare}
                        isFavorite={favoriteIds.includes(vehicle.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onShareVehicle={(v) => setSelectedVehicleForShare(v)}
                        isAdmin={isAdmin}
                        onEditVehicle={(v) => {
                          setVehicleToEdit(v);
                          setIsAddVehicleModalOpen(true);
                        }}
                        currency={currency}
                        usdToFcRate={usdToFcRate}
                      />
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            vehicles={vehicles}
            leads={leads}
            onNavigateToStock={() => setCurrentView('admin-stock')}
            onNavigateToLeads={() => setCurrentView('admin-leads')}
            onOpenAddVehicle={() => {
              setVehicleToEdit(null);
              setIsAddVehicleModalOpen(true);
            }}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* ADMIN STOCK MANAGEMENT VIEW */}
        {currentView === 'admin-stock' && (
          <StockTable
            vehicles={vehicles}
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
            onEditVehicle={(v) => {
              setVehicleToEdit(v);
              setIsAddVehicleModalOpen(true);
            }}
            onDuplicateVehicle={handleDuplicateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateStatus={handleUpdateStatus}
            onToggleVedette={handleToggleVedette}
            onOpenAddModal={() => {
              setVehicleToEdit(null);
              setIsAddVehicleModalOpen(true);
            }}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* ADMIN LEADS / TEST DRIVE MANAGEMENT VIEW */}
        {currentView === 'admin-leads' && (
          <LeadManagement
            leads={leads}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onDeleteLead={handleDeleteLead}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* ADMIN DEALERSHIP SETTINGS VIEW */}
        {currentView === 'admin-settings' && (
          <DealershipSettings
            dealership={dealership}
            onSaveDealership={handleSaveDealershipInfo}
            onResetStock={() => {
              setVehicles(INITIAL_VEHICLES);
              setLeads(INITIAL_LEADS);
              alert("Stock réinitialisé avec succès !");
            }}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* ADMIN DEALERSHIP GOOGLE ANALYTICS 4 VIEW */}
        {currentView === 'admin-analytics' && (
          <DealershipAnalytics
            dealership={dealership}
            vehicles={vehicles}
            leads={leads}
            onSaveDealership={handleSaveDealershipInfo}
            onNavigateHome={handleNavigateHome}
          />
        )}

      </main>

      {/* MOTORS Footer (Matching exact Video Layout) */}
      <MotorsFooter
        onNavigate={(view) => setCurrentView(view as any)}
        openAuthModal={() => setIsDealershipAuthModalOpen(true)}
      />

      {/* Quick Navigation Floating Action Bar */}
      <QuickNavigation
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onCloseCurrentPage={handleCloseCurrentPage}
        isAdmin={isAdmin}
        isSuperAdminAuthenticated={isSuperAdminAuthenticated}
        onNavigateView={(view) => setCurrentView(view)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        comparedCount={comparedVehicleIds.length}
        onOpenAddVehicle={() => {
          setVehicleToEdit(null);
          setIsAddVehicleModalOpen(true);
        }}
        hasActiveModal={hasActiveModal}
      />

      {/* MODALS */}

      {/* SaaS Register Dealership Modal */}
      {isRegisterModalOpen && (
        <RegisterDealershipModal
          subscriptionPlans={subscriptionPlans}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegister={handleRegisterDealership}
        />
      )}

      {/* SaaS Invoice Printable/View Modal */}
      {selectedInvoiceForModal && (
        <InvoiceModal
          invoice={selectedInvoiceForModal}
          dealershipAccount={dealershipAccounts.find((a) => a.id === selectedInvoiceForModal.dealershipId)}
          garageProfile={garages.find((g) => g.id === selectedInvoiceForModal.garageId)}
          onClose={() => setSelectedInvoiceForModal(null)}
          onMarkPaid={handleMarkInvoicePaid}
        />
      )}

      {/* MOTORS Vehicle Detail Modal (Exact Video Layout: High-res Gallery, Specs, Dealer Info, Test Drive) */}
      {selectedVehicleForModal && (
        <MotorsDetailModal
          vehicle={selectedVehicleForModal}
          allVehicles={vehicles}
          onClose={() => setSelectedVehicleForModal(null)}
          onRequestTestDrive={(v) => {
            setSelectedVehicleForModal(null);
            setSelectedVehicleForTestDrive(v);
          }}
          dealership={
            dealershipAccounts.find((a) => a.id === selectedVehicleForModal.dealershipId)?.info || dealership
          }
          isFavorite={favoriteIds.includes(selectedVehicleForModal.id)}
          onToggleFavorite={handleToggleFavorite}
          isCompared={comparedVehicleIds.includes(selectedVehicleForModal.id)}
          onToggleCompare={handleToggleCompare}
          onSubmitLead={handleAddLead}
          onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
          currency={currency}
          usdToFcRate={usdToFcRate}
        />
      )}

      {/* Test Drive Request Modal */}
      {selectedVehicleForTestDrive && (
        <TestDriveModal
          vehicle={selectedVehicleForTestDrive}
          dealership={
            dealershipAccounts.find((a) => a.id === selectedVehicleForTestDrive.dealershipId)?.info || dealership
          }
          onClose={() => setSelectedVehicleForTestDrive(null)}
          onSubmitLead={handleAddLead}
        />
      )}

      {/* Side-by-Side Compare Modal */}
      {isCompareModalOpen && (
        <CompareModal
          vehicles={comparedVehiclesList}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveVehicle={(id) => setComparedVehicleIds(comparedVehicleIds.filter((c) => c !== id))}
          onRequestTestDrive={(v) => setSelectedVehicleForTestDrive(v)}
        />
      )}

      {/* Add / Edit Vehicle Modal */}
      {isAddVehicleModalOpen && (
        <VehicleFormModal
          vehicleToEdit={vehicleToEdit}
          onClose={() => setIsAddVehicleModalOpen(false)}
          onSave={handleSaveVehicle}
        />
      )}

      {/* Super Admin Security Auth Modal */}
      <SuperAdminAuthModal
        isOpen={isSuperAdminAuthModalOpen}
        onClose={() => setIsSuperAdminAuthModalOpen(false)}
        onAuthenticate={handleAuthenticateSuperAdmin}
        currentPin={superAdminPin}
        onUpdatePin={handleUpdateSuperAdminPin}
      />

      {/* MOTORS Dealership & User Auth Modal (Exact Video Layout with Sign In / Register Tabs) */}
      <MotorsAuthModal
        isOpen={isDealershipAuthModalOpen}
        onClose={() => setIsDealershipAuthModalOpen(false)}
        dealershipAccounts={dealershipAccounts}
        onLoginSuccess={handleLoginDealershipSuccess}
        onRegisterAccount={(accData) => {
          handleRegisterDealership(accData);
        }}
        isLoggedIn={isDealershipLoggedIn}
        currentUser={authUser}
        onLogout={handleLogoutDealership}
        onGoHome={() => {
          setIsDealershipAuthModalOpen(false);
          setCurrentView('public');
        }}
      />

      {/* Social Media Share Modal */}
      {(selectedVehicleForShare || isShareDealershipModalOpen) && (
        <SocialShareModal
          isOpen={Boolean(selectedVehicleForShare || isShareDealershipModalOpen)}
          onClose={() => {
            setSelectedVehicleForShare(null);
            setIsShareDealershipModalOpen(false);
          }}
          vehicle={selectedVehicleForShare}
          dealership={
            selectedVehicleForShare
              ? (dealershipAccounts.find((a) => a.id === selectedVehicleForShare.dealershipId)?.info || dealership)
              : dealership
          }
        />
      )}

    </div>
  );
}
