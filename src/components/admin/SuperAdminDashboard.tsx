import React, { useState, useEffect } from 'react';
import { 
  Shield, Building2, CreditCard, Clock, FileText, CheckCircle2, AlertTriangle, 
  PlusCircle, Search, RefreshCw, DollarSign, Calendar, Lock, ArrowUpRight, 
  ChevronRight, Sparkles, User, ExternalLink, Trash2, Edit3, Eye, EyeOff, KeyRound, Sliders, X,
  Home, ArrowLeft, Phone, Mail, MapPin, Headphones, Globe,
  BarChart3, Activity, Users, MousePointerClick, TrendingUp, Flame, Play, Copy, Check, HelpCircle,
  Layers, Tag, Wrench, Truck, Star, MessageSquare, Camera
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  DealershipAccount, SubscriptionStatus, SubscriptionPlanId, Invoice, SubscriptionPlan, 
  SiteAdminInfo, AnalyticsReport, GarageProfile, BreakdownRequest, KinshasaCommune, GarageSpecialty,
  GarageSubscriptionPlan, GaragePlanId 
} from '../../types';
import { SUBSCRIPTION_PLANS, DEFAULT_SITE_ADMIN_INFO, GARAGE_SUBSCRIPTION_PLANS } from '../../data/mockSaas';
import { KINSHASA_COMMUNES, GARAGE_SPECIALTY_LABELS } from '../../data/mockGarages';
import { generateAnalyticsReport, initGoogleAnalytics, trackCustomEvent } from '../../lib/analytics';
import { DealershipGTM } from './DealershipGTM';
import { GarageFormModal } from './GarageFormModal';
import { GarageDetailModal } from '../garages/GarageDetailModal';

interface SuperAdminDashboardProps {
  dealershipAccounts: DealershipAccount[];
  subscriptionPlans?: SubscriptionPlan[];
  garagePlans?: GarageSubscriptionPlan[];
  siteAdminInfo?: SiteAdminInfo;
  garages?: GarageProfile[];
  breakdownRequests?: BreakdownRequest[];
  onSaveGarage?: (garage: GarageProfile) => void;
  onDeleteGarage?: (garageId: string) => void;
  onToggleCertifieGarage?: (garageId: string) => void;
  onToggleDepannage24hGarage?: (garageId: string) => void;
  onUpdateBreakdownRequestStatus?: (requestId: string, status: BreakdownRequest['statut']) => void;
  onDeleteBreakdownRequest?: (requestId: string) => void;
  onUpdateSiteAdminInfo?: (updated: SiteAdminInfo) => void;
  onUpdateSubscriptionPlan?: (updatedPlan: SubscriptionPlan) => void;
  onUpdateGaragePlan?: (updatedPlan: GarageSubscriptionPlan) => void;
  onUpdateAccountPrice?: (accountId: string, newPrice: number) => void;
  onUpdateGaragePrice?: (garageId: string, newPrice: number) => void;
  onUpdateAccountStatus: (account: DealershipAccount) => void;
  onUpdateGarageStatus?: (garage: GarageProfile) => void;
  onToggleMaskAccount?: (accountId: string) => void;
  onToggleMaskGarage?: (garageId: string) => void;
  onUpdateAccountPassword?: (accountId: string, newPassword: string) => void;
  onIssueInvoice: (dealershipId: string, description: string, amountHT: number) => void;
  onIssueGarageInvoice?: (garageId: string, description: string, amountHT: number) => void;
  onMarkInvoicePaid: (invoiceId: string) => void;
  onExtendTrialDays: (account: DealershipAccount, days: number) => void;
  onExtendGarageTrialDays?: (garage: GarageProfile, days: number) => void;
  onSelectDealershipContext: (account: DealershipAccount) => void;
  onDeleteAccount: (accountId: string) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onOpenRegisterModal: () => void;
  onLogoutSuperAdmin?: () => void;
  onNavigateHome?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  dealershipAccounts,
  subscriptionPlans,
  garagePlans,
  siteAdminInfo = DEFAULT_SITE_ADMIN_INFO,
  garages = [],
  breakdownRequests = [],
  onSaveGarage,
  onDeleteGarage,
  onToggleCertifieGarage,
  onToggleDepannage24hGarage,
  onUpdateBreakdownRequestStatus,
  onDeleteBreakdownRequest,
  onUpdateSiteAdminInfo,
  onUpdateSubscriptionPlan,
  onUpdateGaragePlan,
  onUpdateAccountPrice,
  onUpdateGaragePrice,
  onUpdateAccountStatus,
  onUpdateGarageStatus,
  onToggleMaskAccount,
  onToggleMaskGarage,
  onUpdateAccountPassword,
  onIssueInvoice,
  onIssueGarageInvoice,
  onMarkInvoicePaid,
  onExtendTrialDays,
  onExtendGarageTrialDays,
  onSelectDealershipContext,
  onDeleteAccount,
  onViewInvoice,
  onOpenRegisterModal,
  onLogoutSuperAdmin,
  onNavigateHome
}) => {
  const [activeTab, setActiveTab] = useState<'concessions' | 'facturation' | 'formules' | 'garages' | 'contact-admin' | 'analytics'>('concessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedVisibilityFilter, setSelectedVisibilityFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');

  // Garage Management State
  const [garageSubTab, setGarageSubTab] = useState<'garages' | 'sos-demandes'>('garages');
  const [garageSearchTerm, setGarageSearchTerm] = useState('');
  const [garageCommuneFilter, setGarageCommuneFilter] = useState<string>('ALL');
  const [garageCertFilter, setGarageCertFilter] = useState<'ALL' | 'CERTIFIED' | 'NOT_CERTIFIED'>('ALL');
  const [garage24hFilter, setGarage24hFilter] = useState<'ALL' | '24H' | 'STANDARD'>('ALL');
  const [garageStatusFilter, setGarageStatusFilter] = useState<string>('ALL');
  const [garageVisibilityFilter, setGarageVisibilityFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  
  const [isGarageFormModalOpen, setIsGarageFormModalOpen] = useState(false);
  const [garageToEdit, setGarageToEdit] = useState<GarageProfile | null>(null);
  const [garageToDelete, setGarageToDelete] = useState<GarageProfile | null>(null);
  const [garageForDetail, setGarageForDetail] = useState<GarageProfile | null>(null);

  // Edit Garage Custom Price Modal State
  const [editingGaragePrice, setEditingGaragePrice] = useState<GarageProfile | null>(null);
  const [editGaragePriceVal, setEditGaragePriceVal] = useState<number>(0);

  // Site Admin Details Edit State
  const [adminForm, setAdminForm] = useState<SiteAdminInfo>(siteAdminInfo);
  const [adminSaveSuccess, setAdminSaveSuccess] = useState(false);

  // Google Analytics, GTM, Meta, TikTok & Ads State
  const [adminGaId, setAdminGaId] = useState(siteAdminInfo.googleAnalyticsId || 'G-ADMIN99X7V2');
  const [adminGaEnabled, setAdminGaEnabled] = useState(siteAdminInfo.googleAnalyticsEnabled ?? true);
  const [adminGtmId, setAdminGtmId] = useState(siteAdminInfo.googleTagManagerId || 'GTM-P8KLM22');
  const [adminMetaPixelId, setAdminMetaPixelId] = useState(siteAdminInfo.metaPixelId || '104829104928172');
  const [adminMetaPixelEnabled, setAdminMetaPixelEnabled] = useState(siteAdminInfo.metaPixelEnabled ?? true);
  const [adminTikTokPixelId, setAdminTikTokPixelId] = useState(siteAdminInfo.tikTokPixelId || 'C9AUTO82910482X');
  const [adminTikTokPixelEnabled, setAdminTikTokPixelEnabled] = useState(siteAdminInfo.tikTokPixelEnabled ?? true);
  const [adminGoogleAdsId, setAdminGoogleAdsId] = useState(siteAdminInfo.googleAdsId || 'AW-987456123');
  const [adminGoogleAdsConversionLabel, setAdminGoogleAdsConversionLabel] = useState(siteAdminInfo.googleAdsConversionLabel || 'AbC_xYz12345');
  const [adminGoogleAdsEnabled, setAdminGoogleAdsEnabled] = useState(siteAdminInfo.googleAdsEnabled ?? true);

  const [gaSaveSuccess, setGaSaveSuccess] = useState(false);
  const [gaTestSuccess, setGaTestSuccess] = useState(false);
  const [analyticsReport, setAnalyticsReport] = useState<AnalyticsReport>(() => generateAnalyticsReport(undefined));

  useEffect(() => {
    setAnalyticsReport(generateAnalyticsReport(undefined));
  }, [dealershipAccounts]);

  const handleSaveGaConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateSiteAdminInfo) return;

    const cleanGtm = adminGtmId.trim().toUpperCase();
    const updated: SiteAdminInfo = {
      ...siteAdminInfo,
      googleTagManagerId: cleanGtm,
      googleTagManagerEnabled: adminGaEnabled,
      googleAnalyticsId: adminGaId.trim().toUpperCase(),
      googleAnalyticsEnabled: adminGaEnabled,
      metaPixelId: adminMetaPixelId.trim(),
      metaPixelEnabled: adminMetaPixelEnabled,
      tikTokPixelId: adminTikTokPixelId.trim(),
      tikTokPixelEnabled: adminTikTokPixelEnabled,
      googleAdsId: adminGoogleAdsId.trim().toUpperCase(),
      googleAdsConversionLabel: adminGoogleAdsConversionLabel.trim(),
      googleAdsEnabled: adminGoogleAdsEnabled
    };

    onUpdateSiteAdminInfo(updated);
    if (updated.googleTagManagerId && updated.googleTagManagerEnabled) {
      initGoogleAnalytics(updated.googleTagManagerId, true);
    }
    setGaSaveSuccess(true);
    setTimeout(() => setGaSaveSuccess(false), 3000);
  };

  const handleTriggerAdminTestEvent = () => {
    trackCustomEvent('test_superadmin_gtm', 'traffic', {
      pagePath: '/super-admin',
      details: {
        message: 'Événement de test GTM dataLayer déclenché par le Super-Administrateur SaaS',
        gtm_container_id: adminGtmId,
        network_dealerships: dealershipAccounts.length,
        timestamp: new Date().toISOString()
      }
    });
    setGaTestSuccess(true);
    setAnalyticsReport(generateAnalyticsReport(undefined));
    setTimeout(() => setGaTestSuccess(false), 4000);
  };

  // Deletion Modal State
  const [dealershipToDelete, setDealershipToDelete] = useState<DealershipAccount | null>(null);

  // Password Edit Modal State
  const [dealershipToChangePassword, setDealershipToChangePassword] = useState<DealershipAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  const plansList = subscriptionPlans && subscriptionPlans.length > 0 ? subscriptionPlans : SUBSCRIPTION_PLANS;
  const garagePlansList = garagePlans && garagePlans.length > 0 ? garagePlans : GARAGE_SUBSCRIPTION_PLANS;

  // Formules Tab Subtab State
  const [formuleSubTab, setFormuleSubTab] = useState<'concessions' | 'garages'>('concessions');

  // Manual Invoice Creation Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceEntityType, setInvoiceEntityType] = useState<'dealership' | 'garage'>('dealership');
  const [targetDealershipId, setTargetDealershipId] = useState<string>(dealershipAccounts[0]?.id || '');
  const [targetGarageId, setTargetGarageId] = useState<string>(garages[0]?.id || '');
  const [invoiceDesc, setInvoiceDesc] = useState('Abonnement Mensuel Plateforme - Post Période d’Essai');
  const [invoiceAmountHT, setInvoiceAmountHT] = useState<number>(250000);
  const [invoiceFilterType, setInvoiceFilterType] = useState<'ALL' | 'DEALERSHIP' | 'GARAGE'>('ALL');

  // Edit Dealership Plan Modal State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPlanNom, setEditPlanNom] = useState('');
  const [editPlanPrixMensuel, setEditPlanPrixMensuel] = useState<number>(0);
  const [editPlanMaxVehicles, setEditPlanMaxVehicles] = useState<number>(20);
  const [editPlanDescription, setEditPlanDescription] = useState('');
  const [editPlanFeaturesText, setEditPlanFeaturesText] = useState('');

  // Edit Garage Plan Modal State
  const [editingGaragePlan, setEditingGaragePlan] = useState<GarageSubscriptionPlan | null>(null);
  const [editGaragePlanNom, setEditGaragePlanNom] = useState('');
  const [editGaragePlanPrixMensuel, setEditGaragePlanPrixMensuel] = useState<number>(0);
  const [editGaragePlanDescription, setEditGaragePlanDescription] = useState('');
  const [editGaragePlanFeaturesText, setEditGaragePlanFeaturesText] = useState('');
  const [editGaragePlanSos24h, setEditGaragePlanSos24h] = useState(false);

  // Edit Concession Price Modal State
  const [editingAccountPrice, setEditingAccountPrice] = useState<DealershipAccount | null>(null);
  const [editAccountPriceVal, setEditAccountPriceVal] = useState<number>(0);

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditPlanNom(plan.nom);
    setEditPlanPrixMensuel(plan.prixMensuel);
    setEditPlanMaxVehicles(plan.maxVehicles);
    setEditPlanDescription(plan.description);
    setEditPlanFeaturesText(plan.features.join('\n'));
  };

  const handleOpenEditGaragePlan = (plan: GarageSubscriptionPlan) => {
    setEditingGaragePlan(plan);
    setEditGaragePlanNom(plan.nom);
    setEditGaragePlanPrixMensuel(plan.prixMensuel);
    setEditGaragePlanDescription(plan.description);
    setEditGaragePlanFeaturesText(plan.features.join('\n'));
    setEditGaragePlanSos24h(!!plan.inclutSos24h);
  };

  const handleSavePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !onUpdateSubscriptionPlan) return;

    const featuresArr = editPlanFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const updated: SubscriptionPlan = {
      ...editingPlan,
      nom: editPlanNom,
      prixMensuel: Number(editPlanPrixMensuel),
      maxVehicles: Number(editPlanMaxVehicles),
      description: editPlanDescription,
      features: featuresArr
    };

    onUpdateSubscriptionPlan(updated);
    setEditingPlan(null);
  };

  const handleSaveGaragePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGaragePlan || !onUpdateGaragePlan) return;

    const featuresArr = editGaragePlanFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const updated: GarageSubscriptionPlan = {
      ...editingGaragePlan,
      nom: editGaragePlanNom,
      prixMensuel: Number(editGaragePlanPrixMensuel),
      description: editGaragePlanDescription,
      features: featuresArr,
      inclutSos24h: editGaragePlanSos24h
    };

    onUpdateGaragePlan(updated);
    setEditingGaragePlan(null);
  };

  const handleOpenEditAccountPrice = (acc: DealershipAccount) => {
    setEditingAccountPrice(acc);
    setEditAccountPriceVal(acc.prixFactureMensuel);
  };

  const handleOpenEditGaragePrice = (garage: GarageProfile) => {
    setEditingGaragePrice(garage);
    setEditGaragePriceVal(garage.prixFactureMensuel ?? 185000);
  };

  const handleSaveAccountPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccountPrice || !onUpdateAccountPrice) return;

    onUpdateAccountPrice(editingAccountPrice.id, Number(editAccountPriceVal));
    setEditingAccountPrice(null);
  };

  const handleSaveGaragePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGaragePrice) return;

    if (onUpdateGaragePrice) {
      onUpdateGaragePrice(editingGaragePrice.id, Number(editGaragePriceVal));
    } else if (onUpdateGarageStatus) {
      onUpdateGarageStatus({
        ...editingGaragePrice,
        prixFactureMensuel: Number(editGaragePriceVal)
      });
    }
    setEditingGaragePrice(null);
  };

  // Compute SaaS Analytics
  const totalConcessions = dealershipAccounts.length;
  const activeTrials = dealershipAccounts.filter((a) => a.statutAbonnement === 'essai_gratuit').length;
  const activeSubscribers = dealershipAccounts.filter((a) => a.statutAbonnement === 'actif').length;
  const pendingInvoicesAccounts = dealershipAccounts.filter((a) => a.statutAbonnement === 'facture_en_attente').length;
  const expiredAccounts = dealershipAccounts.filter((a) => a.statutAbonnement === 'expire' || a.statutAbonnement === 'suspendu').length;

  const totalGarages = garages.length;
  const activeGarageTrials = garages.filter((g) => (g.statutAbonnement || 'essai_gratuit') === 'essai_gratuit').length;
  const activeGarageSubscribers = garages.filter((g) => g.statutAbonnement === 'actif').length;
  const pendingInvoicesGarages = garages.filter((g) => g.statutAbonnement === 'facture_en_attente').length;

  // Monthly Recurring Revenue (MRR)
  const dealershipMrr = dealershipAccounts
    .filter((a) => a.statutAbonnement === 'actif')
    .reduce((sum, a) => sum + a.prixFactureMensuel, 0);

  const garageMrr = garages
    .filter((g) => g.statutAbonnement === 'actif')
    .reduce((sum, g) => sum + (g.prixFactureMensuel || 185000), 0);

  const mrr = dealershipMrr + garageMrr;

  // Collect all invoices across all dealerships and garages
  const allDealershipInvoices = dealershipAccounts.flatMap((a) => a.invoices || []);
  const allGarageInvoices = garages.flatMap((g) => g.invoices || []);
  const allInvoices = [...allDealershipInvoices, ...allGarageInvoices].sort((a, b) => 
    new Date(b.dateEmission || 0).getTime() - new Date(a.dateEmission || 0).getTime()
  );

  const paidInvoicesTotal = allInvoices
    .filter((inv) => inv.statut === 'payee')
    .reduce((sum, inv) => sum + inv.montantTTC, 0);

  // Filtered Accounts
  const filteredAccounts = dealershipAccounts.filter((acc) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      acc.info.nom.toLowerCase().includes(q) ||
      acc.emailLogin.toLowerCase().includes(q) ||
      acc.responsableNom.toLowerCase().includes(q) ||
      acc.info.siret.includes(q) ||
      acc.info.ville.toLowerCase().includes(q);

    const matchesStatus = selectedStatusFilter === 'ALL' || acc.statutAbonnement === selectedStatusFilter;
    
    const matchesVisibility =
      selectedVisibilityFilter === 'ALL' ||
      (selectedVisibilityFilter === 'VISIBLE' && !acc.estMasque) ||
      (selectedVisibilityFilter === 'HIDDEN' && acc.estMasque);

    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const handleOpenPasswordModal = (acc: DealershipAccount) => {
    setDealershipToChangePassword(acc);
    setNewPasswordInput('');
    setShowNewPassword(false);
    setPasswordSuccessMsg('');
  };

  const handleSavePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealershipToChangePassword || !newPasswordInput.trim()) return;

    if (onUpdateAccountPassword) {
      onUpdateAccountPassword(dealershipToChangePassword.id, newPasswordInput.trim());
    } else {
      onUpdateAccountStatus({
        ...dealershipToChangePassword,
        motDePasse: newPasswordInput.trim()
      });
    }

    setPasswordSuccessMsg('Mot de passe mis à jour avec succès !');
    setTimeout(() => {
      setDealershipToChangePassword(null);
      setPasswordSuccessMsg('');
    }, 1200);
  };

  const handleConfirmDelete = () => {
    if (!dealershipToDelete) return;
    onDeleteAccount(dealershipToDelete.id);
    setDealershipToDelete(null);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceEntityType === 'dealership') {
      if (!targetDealershipId) return;
      onIssueInvoice(targetDealershipId, invoiceDesc, invoiceAmountHT);
    } else {
      if (!targetGarageId) return;
      if (onIssueGarageInvoice) {
        onIssueGarageInvoice(targetGarageId, invoiceDesc, invoiceAmountHT);
      } else {
        onIssueInvoice(targetGarageId, invoiceDesc, invoiceAmountHT);
      }
    }
    setIsInvoiceModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-900/60 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow cursor-pointer mr-1"
                  title="Quitter l'espace super-admin et revenir à l'accueil"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Accueil / Vitrine</span>
                </button>
              )}
              <span className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md">
                <Shield className="w-4 h-4" /> Espace Administrateur Principal SaaS
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                Contrôle Facturation & Périodes d'Essai
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestion de la Facturation Multi-Concessions
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Superviser les inscriptions des concessionnaires, suivre la fin des périodes d'essai gratuit, émettre les factures d'abonnement et gérer les accès aux fonctionnalités.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Fermer l'espace Super-Admin et revenir au catalogue public"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Fermer la page</span>
              </button>
            )}
            <button
              onClick={onOpenRegisterModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Inscrire une Nouvelle Concession
            </button>
            <button
              onClick={() => {
                const target = dealershipAccounts[0];
                if (target) {
                  setTargetDealershipId(target.id);
                  setIsInvoiceModalOpen(true);
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              Créer une Facture Manuelle
            </button>
            {onLogoutSuperAdmin && (
              <button
                onClick={onLogoutSuperAdmin}
                className="bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Déconnexion et verrouillage de la session Super-Admin"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Verrouiller l'Espace</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SaaS Key Metrics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Concessions */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Concessions</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalConcessions}</p>
          <p className="text-[10px] text-slate-500 font-medium">Comptes enregistrés</p>
        </div>

        {/* MRR Recurring Revenue */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">MRR Récurrent</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">{mrr.toLocaleString('fr-FR')} FC</p>
          <p className="text-[10px] text-slate-500 font-medium">Revenu Mensuel HT</p>
        </div>

        {/* Active Trials */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Essais Gratuits</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{activeTrials}</p>
          <p className="text-[10px] text-slate-500 font-medium">Périodes d’essai 14j actives</p>
        </div>

        {/* Pending Invoices */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Factures Attente</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-300">{pendingInvoicesAccounts}</p>
          <p className="text-[10px] text-slate-500 font-medium">À encaisser par l'admin</p>
        </div>

        {/* Revenue Collected */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">CA Encaissé</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{paidInvoicesTotal.toLocaleString('fr-FR')} FC</p>
          <p className="text-[10px] text-slate-500 font-medium">Factures payées TTC</p>
        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('concessions')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'concessions'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Liste des Concessions ({dealershipAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('garages')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'garages'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Garages & SOS Panne ({garages.length})</span>
          {breakdownRequests.filter(r => r.statut === 'en_attente').length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {breakdownRequests.filter(r => r.statut === 'en_attente').length} SOS
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('facturation')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'facturation'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Journal de Facturation ({allInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('formules')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'formules'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Formules SaaS & Tarifs</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('contact-admin');
            setAdminForm(siteAdminInfo);
            setAdminSaveSuccess(false);
          }}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'contact-admin'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Coordonnées Administrateur (Pied de Page)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('analytics');
            setAdminGaId(siteAdminInfo.googleAnalyticsId || 'G-ADMIN99X7V2');
            setAdminGaEnabled(siteAdminInfo.googleAnalyticsEnabled ?? true);
            setAdminGtmId(siteAdminInfo.googleTagManagerId || 'GTM-P8KLM22');
            setGaSaveSuccess(false);
          }}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Google Tag Manager & Flux Central</span>
        </button>
      </div>

      {/* TAB 1: CONCESSIONS MANAGEMENT */}
      {activeTab === 'concessions' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom de concession, email, ville, siret..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Visibilité :</span>
                <select
                  value={selectedVisibilityFilter}
                  onChange={(e) => setSelectedVisibilityFilter(e.target.value as 'ALL' | 'VISIBLE' | 'HIDDEN')}
                  className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Toutes les concessions</option>
                  <option value="VISIBLE">👁️ Visibles (Catalogue public)</option>
                  <option value="HIDDEN">🚫 Masquées (Cachées du public)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Statut :</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="essai_gratuit">🟡 Essai Gratuit Actif</option>
                  <option value="actif">🟢 Abonnement Actif / Payé</option>
                  <option value="facture_en_attente">🟠 Facture Émise (Attente)</option>
                  <option value="expire">🔴 Essai Expiré / Suspendu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dealership Accounts Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                    <th className="p-4">Concession & Accès</th>
                    <th className="p-4">Visibilité Catalogue</th>
                    <th className="p-4">Formule & Tarif</th>
                    <th className="p-4">Période d'Essai / Échéance</th>
                    <th className="p-4">Statut Facturation</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions Administrateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Aucune concession trouvée avec ces critères.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const plan = plansList.find((p) => p.id === acc.planId) || plansList[1];
                      const isHidden = Boolean(acc.estMasque);

                      return (
                        <tr key={acc.id} className={`transition ${isHidden ? 'bg-slate-950/40 opacity-85' : 'hover:bg-slate-800/50'}`}>
                          {/* Name & Contact & Protected Password */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={acc.info.logoUrl}
                                alt={acc.info.nom}
                                className="w-10 h-10 object-cover rounded-xl border border-slate-800 shrink-0"
                              />
                              <div>
                                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                                  {acc.info.nom}
                                  {isHidden && (
                                    <span className="text-[10px] bg-slate-800 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-normal">
                                      Masqué
                                    </span>
                                  )}
                                </h3>
                                <p className="text-[11px] text-slate-400">{acc.responsableNom} • {acc.emailLogin}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-slate-500 font-mono">SIRET : {acc.info.siret} ({acc.info.ville})</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                    <Lock className="w-3 h-3 text-slate-500" /> ••••••••
                                  </span>
                                  <button
                                    onClick={() => handleOpenPasswordModal(acc)}
                                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                                    title="Modifier le mot de passe de cette concession"
                                  >
                                    Modifier
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Visibility Toggle & Badge */}
                          <td className="p-4">
                            <div className="space-y-1">
                              {isHidden ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  <EyeOff className="w-3.5 h-3.5" /> Masqué du public
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <Eye className="w-3.5 h-3.5" /> Visible (Public)
                                </span>
                              )}
                              <div>
                                <button
                                  onClick={() => {
                                    if (onToggleMaskAccount) {
                                      onToggleMaskAccount(acc.id);
                                    } else {
                                      onUpdateAccountStatus({
                                        ...acc,
                                        estMasque: !acc.estMasque
                                      });
                                    }
                                  }}
                                  className={`text-[10px] font-bold underline transition cursor-pointer flex items-center gap-1 ${
                                    isHidden ? 'text-emerald-400 hover:text-emerald-300' : 'text-amber-400 hover:text-amber-300'
                                  }`}
                                >
                                  {isHidden ? (
                                    <>
                                      <Eye className="w-3 h-3" /> Rendre visible au public
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3" /> Masquer du public
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Plan & Tariff FC */}
                          <td className="p-4">
                            <p className="font-bold text-white">{plan.nom}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-amber-400 font-black text-sm">{acc.prixFactureMensuel.toLocaleString('fr-FR')} FC HT <span className="text-[10px] text-slate-400 font-normal">/ mo</span></p>
                              {onUpdateAccountPrice && (
                                <button
                                  onClick={() => handleOpenEditAccountPrice(acc)}
                                  className="p-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded transition cursor-pointer"
                                  title="Changer le tarif pour ce concessionnaire"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Trial Period / Renewal Date */}
                          <td className="p-4">
                            {acc.statutAbonnement === 'essai_gratuit' ? (
                              <div>
                                <p className="font-bold text-amber-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Fin d'essai : {acc.finEssaiGratuit}
                                </p>
                                <button
                                  onClick={() => onExtendTrialDays(acc, 7)}
                                  className="mt-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                                >
                                  + Prolonger +7 Jours d'essai
                                </button>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-slate-300">Renouvellement : {acc.prochaineFacturation}</p>
                                <p className="text-[10px] text-slate-500">Inscrit le {acc.dateInscription}</p>
                              </div>
                            )}
                          </td>

                          {/* Status Select dropdown */}
                          <td className="p-4">
                            <select
                              value={acc.statutAbonnement}
                              onChange={(e) => {
                                onUpdateAccountStatus({
                                  ...acc,
                                  statutAbonnement: e.target.value as SubscriptionStatus
                                });
                              }}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                                acc.statutAbonnement === 'actif'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : acc.statutAbonnement === 'essai_gratuit'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : acc.statutAbonnement === 'facture_en_attente'
                                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              }`}
                            >
                              <option value="essai_gratuit" className="bg-slate-900 text-amber-400">🟡 Essai Gratuit Actif</option>
                              <option value="actif" className="bg-slate-900 text-emerald-400">🟢 Actif / Abonnement Payé</option>
                              <option value="facture_en_attente" className="bg-slate-900 text-sky-400">🟠 Facture Émise (En Attente)</option>
                              <option value="expire" className="bg-slate-900 text-rose-400">🔴 Expiré / Suspendu</option>
                            </select>
                          </td>

                          {/* Vehicle Stock Counter */}
                          <td className="p-4 font-bold text-white">
                            {acc.nbVehiculesActifs} véhicule(s)
                          </td>

                          {/* Quick Admin Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Mask Visibility Button */}
                              <button
                                onClick={() => {
                                  if (onToggleMaskAccount) {
                                    onToggleMaskAccount(acc.id);
                                  } else {
                                    onUpdateAccountStatus({
                                      ...acc,
                                      estMasque: !acc.estMasque
                                    });
                                  }
                                }}
                                className={`p-2 rounded-lg transition cursor-pointer ${
                                  isHidden 
                                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                                title={isHidden ? 'Rendre visible dans le catalogue public' : 'Masquer du catalogue public'}
                              >
                                {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>

                              {/* Change Password Button */}
                              <button
                                onClick={() => handleOpenPasswordModal(acc)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                                title="Modifier le mot de passe sécurisé"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Issue Invoice Button */}
                              <button
                                onClick={() => {
                                  setTargetDealershipId(acc.id);
                                  setInvoiceAmountHT(acc.prixFactureMensuel);
                                  setIsInvoiceModalOpen(true);
                                }}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition cursor-pointer"
                                title="Émettre une facture d'abonnement"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              {/* Switch Dealership Context */}
                              <button
                                onClick={() => onSelectDealershipContext(acc)}
                                className="p-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 rounded-lg transition cursor-pointer"
                                title="Administrer cette concession"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>

                              {/* Delete Account */}
                              <button
                                onClick={() => setDealershipToDelete(acc)}
                                className="p-2 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                                title="Supprimer définitivement la concession"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES JOURNAL */}
      {activeTab === 'facturation' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm">
                Historique Centralisé des Factures ({allInvoices.length})
              </h3>
              <p className="text-xs text-slate-400">
                Suivi des facturations dématérialisées pour Concessionnaires et Garages partenaires
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Type Filter */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setInvoiceFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    invoiceFilterType === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Toutes ({allInvoices.length})
                </button>
                <button
                  onClick={() => setInvoiceFilterType('DEALERSHIP')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    invoiceFilterType === 'DEALERSHIP'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Concessions ({allDealershipInvoices.length})</span>
                </button>
                <button
                  onClick={() => setInvoiceFilterType('GARAGE')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    invoiceFilterType === 'GARAGE'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Garages ({allGarageInvoices.length})</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setInvoiceEntityType('dealership');
                  const target = dealershipAccounts[0];
                  if (target) {
                    setTargetDealershipId(target.id);
                    setInvoiceAmountHT(target.prixFactureMensuel);
                  }
                  setIsInvoiceModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Créer une Facture
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-800">
                  <th className="p-4">N° Facture</th>
                  <th className="p-4">Type & Client Réseau</th>
                  <th className="p-4">Période</th>
                  <th className="p-4">Montant TTC</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
                {allInvoices
                  .filter((inv) => {
                    const isGarage = !!inv.garageId || inv.typeEntite === 'garage';
                    if (invoiceFilterType === 'DEALERSHIP') return !isGarage;
                    if (invoiceFilterType === 'GARAGE') return isGarage;
                    return true;
                  })
                  .length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Aucune facture trouvée pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  allInvoices
                    .filter((inv) => {
                      const isGarage = !!inv.garageId || inv.typeEntite === 'garage';
                      if (invoiceFilterType === 'DEALERSHIP') return !isGarage;
                      if (invoiceFilterType === 'GARAGE') return isGarage;
                      return true;
                    })
                    .map((inv) => {
                      const isGarage = !!inv.garageId || inv.typeEntite === 'garage';
                      return (
                        <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                          <td className="p-4 font-mono font-bold text-amber-400">{inv.id}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {isGarage ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <Wrench className="w-3 h-3" /> Garage Atelier
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  <Building2 className="w-3 h-3" /> Concession
                                </span>
                              )}
                              <span className="font-bold text-white">{inv.dealershipNom}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-400">{inv.periode}</td>
                          <td className="p-4 font-black text-white">{inv.montantTTC.toLocaleString('fr-FR')} FC</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              inv.statut === 'payee'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : inv.statut === 'en_retard'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {inv.statut === 'payee' ? '✓ Payée' : inv.statut === 'en_retard' ? '🔴 En Retard' : '🟠 En Attente'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {inv.statut !== 'payee' && (
                              <button
                                onClick={() => onMarkInvoicePaid(inv.id)}
                                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold rounded-lg text-[11px] transition cursor-pointer"
                              >
                                Marquer Payée
                              </button>
                            )}
                            <button
                              onClick={() => onViewInvoice(inv)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] transition cursor-pointer"
                            >
                              Voir PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SAAS PLANS (CONCESSIONS & GARAGES) */}
      {activeTab === 'formules' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm">
                Grilles Tarifaires & Formules d'Abonnement SaaS (en Francs Congolais / FC)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gérez en toute autonomie les forfaits mensuels et fonctionnalités pour Concessionnaires et Garages.
              </p>
            </div>

            {/* Subtab Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFormuleSubTab('concessions')}
                className={`px-4 py-2 rounded-lg font-bold transition cursor-pointer flex items-center gap-2 ${
                  formuleSubTab === 'concessions'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Formules Concessionnaires ({plansList.length})</span>
              </button>
              <button
                onClick={() => setFormuleSubTab('garages')}
                className={`px-4 py-2 rounded-lg font-bold transition cursor-pointer flex items-center gap-2 ${
                  formuleSubTab === 'garages'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Formules Garages & Ateliers ({garagePlansList.length})</span>
              </button>
            </div>
          </div>

          {/* Formules Concessionnaires */}
          {formuleSubTab === 'concessions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plansList.map((plan) => (
                <div key={plan.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-white text-base">{plan.nom}</h3>
                      <span className="bg-amber-500/20 text-amber-400 font-mono text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                        {plan.prixMensuel.toLocaleString('fr-FR')} FC HT / mo
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{plan.description}</p>
                    <p className="text-[11px] text-slate-300 font-bold">
                      Stock max : <span className="text-amber-400">{plan.maxVehicles === 999 ? 'Illimité' : `${plan.maxVehicles} véhicules`}</span>
                    </p>
                    <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                      <p className="font-bold text-amber-400">Inclus dans la formule :</p>
                      {plan.features.map((f, i) => (
                        <p key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {f}
                        </p>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditPlan(plan)}
                    className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Modifier cette Formule Concession & Tarif FC
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formules Garages & Ateliers */}
          {formuleSubTab === 'garages' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {garagePlansList.map((plan) => (
                <div key={plan.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-extrabold text-white text-base flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-amber-400" />
                          {plan.nom}
                        </h3>
                        {plan.inclutSos24h && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <Truck className="w-3 h-3" /> Alertes SOS 24/7 Incluses
                          </span>
                        )}
                      </div>
                      <span className="bg-amber-500/20 text-amber-400 font-mono text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                        {plan.prixMensuel.toLocaleString('fr-FR')} FC HT / mo
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{plan.description}</p>
                    <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                      <p className="font-bold text-amber-400">Prestations & Visibilité incluses :</p>
                      {plan.features.map((f, i) => (
                        <p key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {f}
                        </p>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditGaragePlan(plan)}
                    className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Modifier cette Formule Garage & Tarif FC
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SITE ADMINISTRATOR CONTACT DETAILS (DISPLAYED IN FOOTER WHEN NO ONE IS LOGGED IN) */}
      {activeTab === 'contact-admin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Headphones className="w-4 h-4" />
              <span>Pied de page & Contact Nouvelles Concessions</span>
            </div>
            <h2 className="text-xl font-black text-white">Coordonnées de l'Administrateur du Site</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Ces informations sont affichées dans le pied de page du site <strong>lorsque personne n'est connecté</strong>. Elles permettent aux nouveaux concessionnaires, garages et vendeurs professionnels de vous contacter directement pour s'inscrire, planifier une démonstration ou souscrire un abonnement.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateSiteAdminInfo) {
                onUpdateSiteAdminInfo(adminForm);
              }
              setAdminSaveSuccess(true);
              setTimeout(() => setAdminSaveSuccess(false), 3000);
            }}
            className="space-y-6 text-xs"
          >
            {/* Platform & Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Nom Commercial de la Plateforme SaaS *
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.nomPlateforme}
                  onChange={(e) => setAdminForm({ ...adminForm, nomPlateforme: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Nom du Responsable / Direction de l'Administration *
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.nomAdministrateur}
                  onChange={(e) => setAdminForm({ ...adminForm, nomAdministrateur: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Slogan & Description de la Plateforme (Pied de page) *
              </label>
              <textarea
                rows={2}
                required
                value={adminForm.slogan}
                onChange={(e) => setAdminForm({ ...adminForm, slogan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            {/* Contacts Directs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Téléphone Direct Administrateur (Nouvelles Inscriptions) *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={adminForm.telephone}
                  onChange={(e) => setAdminForm({ ...adminForm, telephone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Numéro appelé par les concessionnaires intéressés.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Email Officiel de l'Administrateur *</span>
                </label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sky-400 font-medium focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Adresse de réception des candidatures et demandes de démo.</p>
              </div>
            </div>

            {/* Address & Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Adresse Postale du Siège Administratif *</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.adresse}
                  onChange={(e) => setAdminForm({ ...adminForm, adresse: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Code Postal & Ville *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Code postal"
                    value={adminForm.codePostal}
                    onChange={(e) => setAdminForm({ ...adminForm, codePostal: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Ville"
                    value={adminForm.ville}
                    onChange={(e) => setAdminForm({ ...adminForm, ville: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Hours & Legal Identifiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Horaires de Permanence / Support *</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.horaires}
                  onChange={(e) => setAdminForm({ ...adminForm, horaires: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Numéro SIRET Plateforme
                </label>
                <input
                  type="text"
                  value={adminForm.siret}
                  onChange={(e) => setAdminForm({ ...adminForm, siret: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  RCS / Numéro Registre
                </label>
                <input
                  type="text"
                  value={adminForm.rcs}
                  onChange={(e) => setAdminForm({ ...adminForm, rcs: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {adminSaveSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Les coordonnées de l'Administrateur du Site ont été enregistrées avec succès et sont maintenant synchronisées avec le pied de page !</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enregistrer les Coordonnées de l'Administrateur</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: GOOGLE ANALYTICS 4 & GLOBAL TRAFFIC AUDIENCE */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Header & Quick Action */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30">
                    Administration Centrale SaaS
                  </span>
                  <span className="text-xs text-slate-400">Réseau Multi-Concessions</span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">Google Analytics 4 & Suivi Global du Réseau</h2>
                <p className="text-xs text-slate-400">
                  Mesurez l'audience globale du portail, l'efficacité des campagnes d'acquisition et pilotez le tag GA4 principal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerAdminTestEvent}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
                title="Déclencher un événement de test GA4 sur l'ensemble du réseau"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Tester le Tag GA4 Global</span>
              </button>
            </div>
          </div>

          {/* Test Event Toast */}
          {gaTestSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-200 text-xs shadow-xl animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-extrabold text-white">Événement de test GA4 Global émis avec succès !</span>
                  <p className="text-emerald-300/80 text-[11px] mt-0.5">
                    L'événement <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-white">test_superadmin_ga4</code> a été dispatché avec le tag d'administration centrale.
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-800/60 text-emerald-200 px-2 py-1 rounded font-mono font-bold">200 OK</span>
            </div>
          )}

          {/* Configuration Form Card */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Conteneur Central Google Tag Manager (Plateforme SaaS)
                    {adminGtmId && adminGaEnabled ? (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        GTM & dataLayer Actifs
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Non configuré
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Injecte Google Tag Manager et alimente la couche de données <code className="text-amber-400 font-mono">window.dataLayer</code> pour toutes les concessions.
                  </p>
                </div>
              </div>

              <a
                href="https://tagmanager.google.com/"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <span>Console Tag Manager</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveGaConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* GTM */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Conteneur GTM Global *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: GTM-XXXXXXX"
                    value={adminGtmId}
                    onChange={(e) => setAdminGtmId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 block">SaaS dataLayer stream</span>
                </div>

                {/* META */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Meta Pixel ID (Facebook / IG)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 104829104928172"
                    value={adminMetaPixelId}
                    onChange={(e) => setAdminMetaPixelId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Reciblage Meta Ads</span>
                </div>

                {/* TIKTOK */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: C9AUTO82910482X"
                    value={adminTikTokPixelId}
                    onChange={(e) => setAdminTikTokPixelId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-pink-400 font-mono focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[10px] text-slate-500 block">TikTok Ads Manager</span>
                </div>

                {/* GOOGLE ADS */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Google Ads ID (AW-XXXXXX)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: AW-987456123"
                    value={adminGoogleAdsId}
                    onChange={(e) => setAdminGoogleAdsId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Conversions Google Ads</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminGaEnabled}
                    onChange={(e) => setAdminGaEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-300">
                    Activer les pixels (Meta, TikTok, Google Ads) et les flux GTM dataLayer sur l'ensemble de la plateforme
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  {gaSaveSuccess && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-500/30 animate-fadeIn">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pixels et Conteneur GTM Enregistrés !
                    </span>
                  )}
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <span>Enregistrer la Configuration Marketing</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Global KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Global Visitors */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Visiteurs Uniques Réseau</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {analyticsReport.totalUniqueVisitors.toLocaleString('fr-FR')}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +24.8% d'audience globale ce mois
              </p>
            </div>

            {/* Global Page Views */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Pages Vues Total</span>
                <Eye className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {analyticsReport.totalPageViews.toLocaleString('fr-FR')}
              </div>
              <p className="text-[11px] text-slate-400">
                Fiches véhicules : <span className="text-amber-400 font-bold">{analyticsReport.vehicleViews.toLocaleString('fr-FR')}</span>
              </p>
            </div>

            {/* Global Leads & Test Drives */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Leads & Demandes d'Essais</span>
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {analyticsReport.leadsGenerated}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="font-bold text-amber-400">{analyticsReport.testDriveBookings}</span> essais routiers réservés
              </p>
            </div>

            {/* Global Conversion Rate */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Taux de Conversion Global</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {analyticsReport.conversionRate}%
              </div>
              <p className="text-[11px] text-slate-400">
                Moyenne plateforme (Demandes / Visiteurs)
              </p>
            </div>
          </div>

          {/* Traffic Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Traffic & Stock by Dealership */}
            <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Volume de Véhicules & Performance par Concession</h3>
                  <p className="text-xs text-slate-400">Répartition des véhicules actifs et estimation des leads générés.</p>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  {dealershipAccounts.length} Concessions
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dealershipAccounts.map((acc) => ({
                      nom: acc.info.nom.length > 15 ? `${acc.info.nom.slice(0, 15)}...` : acc.info.nom,
                      vehicules: acc.nbVehiculesActifs,
                      estimationVisites: acc.nbVehiculesActifs * 38 + 50
                    }))} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis dataKey="nom" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="vehicules" name="Véhicules Actifs" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="estimationVisites" name="Visites Estimées / Mois" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Acquisition Channels */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
              <div>
                <h3 className="text-sm font-black text-white">Origine du Trafic Global (SEO & Ads)</h3>
                <p className="text-xs text-slate-400">Canaux d'entrée des acheteurs sur le portail.</p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsReport.trafficBySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="percentage"
                    >
                      {analyticsReport.trafficBySource.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => `${val}%`}
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                {analyticsReport.trafficBySource.map((src, i) => (
                  <div key={src.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 4] }}></span>
                      <span className="text-slate-300 truncate max-w-[170px]">{src.source}</span>
                    </div>
                    <span className="font-bold text-white">{src.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Global Event Stream */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Flux d'Événements Plateforme en Direct (Live Analytics)</h3>
                  <p className="text-xs text-slate-400">Événements transmis en temps réel par les acheteurs à Google Analytics 4.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAnalyticsReport(generateAnalyticsReport(undefined))}
                className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rafraîchir le flux</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              {analyticsReport.recentEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aucun événement récent. Cliquez sur « Tester le Tag GA4 Global » pour générer un flux.
                </div>
              ) : (
                analyticsReport.recentEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-900/60 transition">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        ev.category === 'conversion' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : ev.category === 'lead'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {ev.eventName}
                      </span>

                      <div>
                        <p className="text-xs font-bold text-white">
                          {ev.dealershipName ? `[${ev.dealershipName}] ` : ''}
                          {ev.vehicleName ? `${ev.vehicleName}` : ev.eventName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Chemin : <code className="font-mono text-slate-300">{ev.pagePath}</code>
                          {ev.details?.client_name && ` • Client : ${ev.details.client_name}`}
                          {ev.details?.value && ` • Valeur : ${Number(ev.details.value).toLocaleString('fr-FR')} €`}
                        </p>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(ev.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dealerships GTM Overview Table */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-black text-white">État des Conteneurs Google Tag Manager des Concessions</h3>
              <p className="text-xs text-slate-400">Vérifiez les identifiants GTM configurés individuellement par chaque concessionnaire partenaire.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Concession</th>
                    <th className="py-2.5 px-3">Ville</th>
                    <th className="py-2.5 px-3">ID Google Tag Manager (GTM)</th>
                    <th className="py-2.5 px-3">Statut dataLayer</th>
                    <th className="py-2.5 px-3 text-right">Véhicules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {dealershipAccounts.map((acc) => {
                    const gtmCode = acc.info.googleTagManagerId || acc.info.googleAnalyticsId?.replace('G-', 'GTM-');
                    const isActive = (acc.info.googleTagManagerEnabled ?? acc.info.googleAnalyticsEnabled ?? true) && !!gtmCode;
                    return (
                      <tr key={acc.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-400" />
                          <span>{acc.info.nom}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{acc.info.ville}</td>
                        <td className="py-3 px-3 font-mono text-amber-400">
                          {gtmCode || (
                            <span className="text-slate-600 font-sans italic">Non renseigné</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isActive ? (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              dataLayer Actif
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit block">
                              Inactif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-white">
                          {acc.nbVehiculesActifs}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Complete GTM & Multi-Pixel Management Console (Super-Admin Exclusive) */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500 text-slate-950 rounded-lg font-black text-xs">
                <Tag className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-sm font-black text-white">Console Intégrale de Gestion & Débogage GTM / Pixels (Accès Super-Admin)</h3>
            </div>
            
            <DealershipGTM
              dealership={{
                nom: siteAdminInfo.nomPlateforme || 'Portail Réseau Concessions',
                adresse: siteAdminInfo.adresse,
                telephone: siteAdminInfo.telephone,
                email: siteAdminInfo?.email || 'admin@autoconcession.com',
                siret: '89210928300012',
                horaires: 'Super-Admin 24/7',
                logo: '',
                googleTagManagerId: adminGtmId,
                googleTagManagerEnabled: adminGaEnabled,
                metaPixelId: adminMetaPixelId,
                metaPixelEnabled: adminMetaPixelEnabled,
                tikTokPixelId: adminTikTokPixelId,
                tikTokPixelEnabled: adminTikTokPixelEnabled,
                googleAdsId: adminGoogleAdsId,
                googleAdsConversionLabel: adminGoogleAdsConversionLabel,
                googleAdsEnabled: adminGoogleAdsEnabled
              }}
              vehicles={dealershipAccounts[0]?.vehicles || []}
              leads={[]}
              onSaveDealership={(updatedDealer) => {
                if (onUpdateSiteAdminInfo) {
                  onUpdateSiteAdminInfo({
                    ...siteAdminInfo,
                    googleTagManagerId: updatedDealer.googleTagManagerId,
                    googleTagManagerEnabled: updatedDealer.googleTagManagerEnabled,
                    metaPixelId: updatedDealer.metaPixelId,
                    metaPixelEnabled: updatedDealer.metaPixelEnabled,
                    tikTokPixelId: updatedDealer.tikTokPixelId,
                    tikTokPixelEnabled: updatedDealer.tikTokPixelEnabled,
                    googleAdsId: updatedDealer.googleAdsId,
                    googleAdsConversionLabel: updatedDealer.googleAdsConversionLabel,
                    googleAdsEnabled: updatedDealer.googleAdsEnabled
                  });
                }
              }}
            />
          </div>

        </div>
      )}

      {/* TAB 4: GARAGES & SOS PANNE MANAGEMENT */}
      {activeTab === 'garages' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Quick Stats for Garages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Ateliers Référencés</span>
                <Wrench className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">{garages.length}</p>
              <p className="text-[10px] text-slate-400">Garages & mécaniciens</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Ateliers Certifiés</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">
                {garages.filter(g => g.estCertifie).length}
              </p>
              <p className="text-[10px] text-slate-400">Vérifiés par l'administration</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Équipes SOS 24/7</span>
                <Truck className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400">
                {garages.filter(g => g.estDepannageMobile24h).length}
              </p>
              <p className="text-[10px] text-slate-400">Dépannage mobile sur route</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Demandes SOS Panne</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-300">{breakdownRequests.length}</p>
              <p className="text-[10px] text-slate-400">
                {breakdownRequests.filter(r => r.statut === 'en_attente').length} en attente
              </p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1.5 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Communes Actives</span>
                <MapPin className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-black text-sky-300">
                {new Set(garages.map(g => g.commune)).size} / 24
              </p>
              <p className="text-[10px] text-slate-400">Couverture Kinshasa</p>
            </div>
          </div>

          {/* Sub-Tabs: Garages List vs SOS Requests */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setGarageSubTab('garages')}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                  garageSubTab === 'garages'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Ateliers & Garages Kinshasa ({garages.length})</span>
              </button>

              <button
                onClick={() => setGarageSubTab('sos-demandes')}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                  garageSubTab === 'sos-demandes'
                    ? 'bg-rose-600 text-white font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Demandes SOS Panne & Dépannage ({breakdownRequests.length})</span>
                {breakdownRequests.filter(r => r.statut === 'en_attente').length > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {breakdownRequests.filter(r => r.statut === 'en_attente').length}
                  </span>
                )}
              </button>
            </div>

            {garageSubTab === 'garages' && (
              <button
                onClick={() => {
                  setGarageToEdit(null);
                  setIsGarageFormModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajouter un Garage Partenaire</span>
              </button>
            )}
          </div>

          {/* SUBTAB 1: GARAGES DIRECTORY MANAGEMENT */}
          {garageSubTab === 'garages' && (
            <div className="space-y-4">
              
              {/* Search and Filters Bar */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom de garage, responsable, commune, repère, téléphone..."
                    value={garageSearchTerm}
                    onChange={(e) => setGarageSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Commune :</span>
                    <select
                      value={garageCommuneFilter}
                      onChange={(e) => setGarageCommuneFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Toutes les 24 communes</option>
                      {KINSHASA_COMMUNES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Abonnement :</span>
                    <select
                      value={garageStatusFilter}
                      onChange={(e) => setGarageStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tous les statuts</option>
                      <option value="essai_gratuit">🟡 Essais Gratuits</option>
                      <option value="actif">🟢 Abonnés Actifs</option>
                      <option value="facture_en_attente">🟠 Factures en Attente</option>
                      <option value="expire">🔴 Expirés / Suspendus</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Visibilité :</span>
                    <select
                      value={garageVisibilityFilter}
                      onChange={(e) => setGarageVisibilityFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Toutes</option>
                      <option value="VISIBLE">👁️ Visible (Public)</option>
                      <option value="HIDDEN">🚫 Masqué</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Certif :</span>
                    <select
                      value={garageCertFilter}
                      onChange={(e) => setGarageCertFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tous</option>
                      <option value="CERTIFIED">⭐ Certifiés</option>
                      <option value="NOT_CERTIFIED">⏳ Non certifiés</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">SOS 24/7 :</span>
                    <select
                      value={garage24hFilter}
                      onChange={(e) => setGarage24hFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tous</option>
                      <option value="24H">🚨 SOS 24/7</option>
                      <option value="STANDARD">🏢 Atelier</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Garages Table / Grid */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                        <th className="py-3.5 px-4">Atelier / Garage</th>
                        <th className="py-3.5 px-4">Visibilité Public</th>
                        <th className="py-3.5 px-4">Formule SaaS & Tarif FC</th>
                        <th className="py-3.5 px-4">Période d'Essai & Échéance</th>
                        <th className="py-3.5 px-4">Statut Abonnement</th>
                        <th className="py-3.5 px-4">Badges & SOS</th>
                        <th className="py-3.5 px-4 text-right">Actions Administrateur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {garages
                        .filter((g) => {
                          const q = garageSearchTerm.toLowerCase();
                          const matchesQ =
                            !q ||
                            g.nom.toLowerCase().includes(q) ||
                            g.responsable.toLowerCase().includes(q) ||
                            g.commune.toLowerCase().includes(q) ||
                            g.repere.toLowerCase().includes(q) ||
                            g.telephonePrincipal.includes(q) ||
                            g.whatsapp.includes(q);

                          const matchesCommune = garageCommuneFilter === 'ALL' || g.commune === garageCommuneFilter;
                          const matchesCert =
                            garageCertFilter === 'ALL' ||
                            (garageCertFilter === 'CERTIFIED' && g.estCertifie) ||
                            (garageCertFilter === 'NOT_CERTIFIED' && !g.estCertifie);
                          const matches24h =
                            garage24hFilter === 'ALL' ||
                            (garage24hFilter === '24H' && g.estDepannageMobile24h) ||
                            (garage24hFilter === 'STANDARD' && !g.estDepannageMobile24h);

                          const status = g.statutAbonnement || 'essai_gratuit';
                          const matchesStatus = garageStatusFilter === 'ALL' || status === garageStatusFilter;

                          const isHidden = !!g.estMasque;
                          const matchesVisibility =
                            garageVisibilityFilter === 'ALL' ||
                            (garageVisibilityFilter === 'VISIBLE' && !isHidden) ||
                            (garageVisibilityFilter === 'HIDDEN' && isHidden);

                          return matchesQ && matchesCommune && matchesCert && matches24h && matchesStatus && matchesVisibility;
                        })
                        .map((garage) => {
                          const photoPreview = garage.photos?.[0] || 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=400&q=80';
                          const plan = garagePlansList.find(p => p.id === (garage.planId || 'garage_starter')) || garagePlansList[0];
                          const monthlyPrice = garage.prixFactureMensuel ?? plan.prixMensuel;
                          const isHidden = !!garage.estMasque;
                          const status = garage.statutAbonnement || 'essai_gratuit';
                          const finEssai = garage.finEssaiGratuit || '2026-08-31';

                          return (
                            <tr key={garage.id} className="hover:bg-slate-800/40 transition">
                              
                              {/* Name & Responsable & Contacts */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                                    <img src={photoPreview} alt={garage.nom} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-black text-white text-xs">{garage.nom}</span>
                                      {garage.estCertifie && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Atelier Certifié" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400">{garage.responsable} ({garage.titreResponsable || 'Chef d’Atelier'})</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-amber-400 font-bold">📍 {garage.commune}</span>
                                      <span className="text-slate-600">•</span>
                                      <a
                                        href={`tel:${garage.telephonePrincipal.replace(/\s+/g, '')}`}
                                        className="text-[10px] font-mono text-slate-300 hover:text-amber-400 flex items-center gap-1"
                                      >
                                        <Phone className="w-3 h-3 text-amber-400" />
                                        <span>{garage.telephonePrincipal}</span>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Visibility Toggle & Badge */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  {isHidden ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                      <EyeOff className="w-3.5 h-3.5" /> Masqué du public
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                      <Eye className="w-3.5 h-3.5" /> Visible (Public)
                                    </span>
                                  )}
                                  <div>
                                    <button
                                      onClick={() => {
                                        if (onToggleMaskGarage) {
                                          onToggleMaskGarage(garage.id);
                                        } else if (onUpdateGarageStatus) {
                                          onUpdateGarageStatus({
                                            ...garage,
                                            estMasque: !garage.estMasque
                                          });
                                        }
                                      }}
                                      className={`text-[10px] font-bold underline transition cursor-pointer flex items-center gap-1 ${
                                        isHidden ? 'text-emerald-400 hover:text-emerald-300' : 'text-amber-400 hover:text-amber-300'
                                      }`}
                                    >
                                      {isHidden ? (
                                        <>
                                          <Eye className="w-3 h-3" /> Rendre visible
                                        </>
                                      ) : (
                                        <>
                                          <EyeOff className="w-3 h-3" /> Masquer
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {/* Plan SaaS & Custom Price */}
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-white">{plan.nom}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <p className="text-amber-400 font-black text-sm">{monthlyPrice.toLocaleString('fr-FR')} FC HT <span className="text-[10px] text-slate-400 font-normal">/ mo</span></p>
                                  <button
                                    onClick={() => handleOpenEditGaragePrice(garage)}
                                    className="p-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded transition cursor-pointer"
                                    title="Changer le tarif pour ce garage"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                              {/* Trial Period / Renewal Date */}
                              <td className="py-3.5 px-4">
                                {status === 'essai_gratuit' ? (
                                  <div>
                                    <p className="font-bold text-amber-400 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" /> Fin d'essai : {finEssai}
                                    </p>
                                    <button
                                      onClick={() => {
                                        if (onExtendGarageTrialDays) {
                                          onExtendGarageTrialDays(garage, 7);
                                        } else if (onUpdateGarageStatus) {
                                          const current = new Date(finEssai);
                                          current.setDate(current.getDate() + 7);
                                          onUpdateGarageStatus({
                                            ...garage,
                                            finEssaiGratuit: current.toISOString().split('T')[0]
                                          });
                                        }
                                      }}
                                      className="mt-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                                    >
                                      + Prolonger +7 Jours d'essai
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-medium text-slate-300">Renouvellement : {garage.prochaineFacturation || '2026-09-01'}</p>
                                    <p className="text-[10px] text-slate-500">Inscrit le {garage.dateInscription || '2026-08-01'}</p>
                                  </div>
                                )}
                              </td>

                              {/* Status Select dropdown */}
                              <td className="py-3.5 px-4">
                                <select
                                  value={status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value as SubscriptionStatus;
                                    if (onUpdateGarageStatus) {
                                      onUpdateGarageStatus({
                                        ...garage,
                                        statutAbonnement: newStatus
                                      });
                                    }
                                  }}
                                  className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                                    status === 'actif'
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                      : status === 'essai_gratuit'
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                      : status === 'facture_en_attente'
                                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                  }`}
                                >
                                  <option value="essai_gratuit" className="bg-slate-900 text-amber-400">🟡 Essai Gratuit Actif</option>
                                  <option value="actif" className="bg-slate-900 text-emerald-400">🟢 Actif / Abonnement Payé</option>
                                  <option value="facture_en_attente" className="bg-slate-900 text-sky-400">🟠 Facture Émise (En Attente)</option>
                                  <option value="expire" className="bg-slate-900 text-rose-400">🔴 Expiré / Suspendu</option>
                                </select>
                              </td>

                              {/* Status Badges & Quick Toggles */}
                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    onClick={() => onToggleCertifieGarage && onToggleCertifieGarage(garage.id)}
                                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 transition cursor-pointer border ${
                                      garage.estCertifie
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                    }`}
                                    title="Cliquer pour activer/désactiver le badge certifié"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{garage.estCertifie ? 'Certifié' : 'Non certifié'}</span>
                                  </button>

                                  <button
                                    onClick={() => onToggleDepannage24hGarage && onToggleDepannage24hGarage(garage.id)}
                                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 transition cursor-pointer border ${
                                      garage.estDepannageMobile24h
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                    }`}
                                    title="Cliquer pour activer/désactiver l'option Dépannage 24/7"
                                  >
                                    <Truck className="w-3 h-3" />
                                    <span>{garage.estDepannageMobile24h ? 'SOS 24/7' : 'Standard'}</span>
                                  </button>
                                </div>
                              </td>

                              {/* Admin Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setInvoiceEntityType('garage');
                                      setTargetGarageId(garage.id);
                                      setInvoiceAmountHT(garage.prixFactureMensuel || plan.prixMensuel);
                                      setInvoiceDesc(`Abonnement Mensuel Garage - Formule ${plan.nom}`);
                                      setIsInvoiceModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 transition cursor-pointer"
                                    title="Émettre une facture SaaS pour ce garage"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setGarageForDetail(garage)}
                                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                                    title="Voir la fiche technique complète"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setGarageToEdit(garage);
                                      setIsGarageFormModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 transition cursor-pointer"
                                    title="Modifier toutes les informations du garage"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setGarageToDelete(garage)}
                                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition cursor-pointer"
                                    title="Supprimer ce garage"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {garages.length === 0 && (
                  <div className="p-8 text-center text-slate-400 space-y-3">
                    <Wrench className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="font-bold">Aucun garage enregistré pour le moment.</p>
                    <button
                      onClick={() => {
                        setGarageToEdit(null);
                        setIsGarageFormModalOpen(true);
                      }}
                      className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Ajouter le premier garage
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SUBTAB 2: BREAKDOWN & SOS REQUESTS MANAGEMENT */}
          {garageSubTab === 'sos-demandes' && (
            <div className="space-y-4">
              
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 font-bold">
                  {breakdownRequests.length} demande{breakdownRequests.length > 1 ? 's' : ''} SOS Panne reçue{breakdownRequests.length > 1 ? 's' : ''} à travers Kinshasa
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  Mise à jour en temps réel
                </span>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                        <th className="py-3.5 px-4">Date / Réf</th>
                        <th className="py-3.5 px-4">Client & Contact</th>
                        <th className="py-3.5 px-4">Lieu & Commune</th>
                        <th className="py-3.5 px-4">Véhicule & Panne</th>
                        <th className="py-3.5 px-4">Atelier Ciblé</th>
                        <th className="py-3.5 px-4">Statut d'Intervention</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {breakdownRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-800/40 transition">
                          
                          {/* Date */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                            {req.dateDemande}
                          </td>

                          {/* Client */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{req.clientNom}</span>
                            <div className="flex items-center gap-2 pt-1">
                              <a
                                href={`tel:${req.telephone.replace(/\s+/g, '')}`}
                                className="font-mono text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{req.telephone}</span>
                              </a>
                              <a
                                href={`https://wa.me/${req.telephone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${req.clientNom}, nous avons bien reçu votre demande SOS Panne sur AutoConcession Kinshasa.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <span className="font-bold text-amber-400 block">📍 {req.communePanne}</span>
                            <span className="text-slate-300 text-[11px] block line-clamp-2" title={req.adresseLieuPanne}>
                              {req.adresseLieuPanne}
                            </span>
                            {req.besoinRemorquage && (
                              <span className="inline-block bg-rose-500/20 text-rose-300 font-bold text-[9px] px-1.5 py-0.2 rounded mt-1">
                                🚜 Remorquage requis
                              </span>
                            )}
                          </td>

                          {/* Vehicle & Issue */}
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <span className="font-bold text-white block">
                              {req.marqueVehicule} {req.modeleVehicule}
                            </span>
                            <span className="text-slate-300 text-[11px] block italic line-clamp-2" title={req.descriptionPanne}>
                              "{req.descriptionPanne}"
                            </span>
                          </td>

                          {/* Target Garage */}
                          <td className="py-3.5 px-4">
                            <span className="text-slate-300 font-medium">
                              {req.garageNom || 'Diffusion Générale (Kinshasa)'}
                            </span>
                          </td>

                          {/* Status Selector */}
                          <td className="py-3.5 px-4">
                            <select
                              value={req.statut}
                              onChange={(e) => onUpdateBreakdownRequestStatus && onUpdateBreakdownRequestStatus(req.id, e.target.value as any)}
                              className={`rounded-xl px-2.5 py-1.5 text-xs font-bold border focus:outline-none cursor-pointer ${
                                req.statut === 'en_attente'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : req.statut === 'pris_en_charge'
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                  : req.statut === 'depanneur_en_route'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : req.statut === 'resolu'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <option value="en_attente">⏳ En Attente</option>
                              <option value="pris_en_charge">🔍 Pris en Charge</option>
                              <option value="depanneur_en_route">🚗 Dépanneur en Route</option>
                              <option value="resolu">✅ Panne Résolue</option>
                              <option value="annule">❌ Annulée</option>
                            </select>
                          </td>

                          {/* Delete Request */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onDeleteBreakdownRequest && onDeleteBreakdownRequest(req.id)}
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition cursor-pointer"
                              title="Supprimer la demande SOS"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {breakdownRequests.length === 0 && (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-bold">Aucune demande SOS Panne en attente.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* EDIT SAAS PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Changer les Tarifs de la Formule "{editingPlan.nom}"
            </h3>

            <form onSubmit={handleSavePlanSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nom de la Formule *</label>
                  <input
                    type="text"
                    required
                    value={editPlanNom}
                    onChange={(e) => setEditPlanNom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tarif Mensuel (FC HT) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={editPlanPrixMensuel}
                    onChange={(e) => setEditPlanPrixMensuel(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-bold text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format : Francs Congolais (FC)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Capacité Stock Max (Véhicules)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editPlanMaxVehicles}
                  onChange={(e) => setEditPlanMaxVehicles(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description courte</label>
                <input
                  type="text"
                  required
                  value={editPlanDescription}
                  onChange={(e) => setEditPlanDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Fonctionnalités Incluses (1 par ligne)</label>
                <textarea
                  rows={4}
                  value={editPlanFeaturesText}
                  onChange={(e) => setEditPlanFeaturesText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-sans text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl"
                >
                  Enregistrer les Modifications FC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GARAGE PLAN MODAL */}
      {editingGaragePlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Modifier la Formule Garage "{editingGaragePlan.nom}"
            </h3>

            <form onSubmit={handleSaveGaragePlanSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nom de la Formule *</label>
                  <input
                    type="text"
                    required
                    value={editGaragePlanNom}
                    onChange={(e) => setEditGaragePlanNom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tarif Mensuel (FC HT) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={editGaragePlanPrixMensuel}
                    onChange={(e) => setEditGaragePlanPrixMensuel(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-bold text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format : Francs Congolais (FC)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description courte</label>
                <input
                  type="text"
                  required
                  value={editGaragePlanDescription}
                  onChange={(e) => setEditGaragePlanDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="garagePlanSos"
                  checked={editGaragePlanSos24h}
                  onChange={(e) => setEditGaragePlanSos24h(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="garagePlanSos" className="text-xs text-slate-200 font-bold cursor-pointer">
                  🚨 Inclut la réception d'alertes dépannage SOS Panne 24/7 sur Kinshasa
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Prestations & Avantages Inclus (1 par ligne)</label>
                <textarea
                  rows={4}
                  value={editGaragePlanFeaturesText}
                  onChange={(e) => setEditGaragePlanFeaturesText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-sans text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGaragePlan(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Enregistrer les Modifications Garage FC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CONCESSION INDIVIDUAL PRICE MODAL */}
      {editingAccountPrice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Modifier le Tarif Concessionnaire
            </h3>
            <p className="text-xs text-slate-400">
              Concession : <strong className="text-white">{editingAccountPrice.info.nom}</strong>
            </p>

            <form onSubmit={handleSaveAccountPriceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nouveau Tarif Facturé Mensuel (en Francs Congolais / FC) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={editAccountPriceVal}
                  onChange={(e) => setEditAccountPriceVal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-black text-base"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Actuel : {editingAccountPrice.prixFactureMensuel.toLocaleString('fr-FR')} FC / mois HT.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccountPrice(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Valider le Nouveau Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GARAGE INDIVIDUAL PRICE MODAL */}
      {editingGaragePrice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Modifier le Tarif Garage Partenaire
            </h3>
            <p className="text-xs text-slate-400">
              Atelier / Garage : <strong className="text-white">{editingGaragePrice.nom}</strong> ({editingGaragePrice.commune})
            </p>

            <form onSubmit={handleSaveGaragePriceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nouveau Tarif Facturé Mensuel (en Francs Congolais / FC) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={editGaragePriceVal}
                  onChange={(e) => setEditGaragePriceVal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-black text-base"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Actuel : {(editingGaragePrice.prixFactureMensuel || 50000).toLocaleString('fr-FR')} FC / mois HT.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGaragePrice(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Valider le Nouveau Tarif Garage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL INVOICE GENERATOR MODAL (CONCESSION & GARAGE) */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Émettre une Facture Dématérialisée
            </h3>

            {/* Type selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setInvoiceEntityType('dealership');
                  const found = dealershipAccounts.find(a => a.id === targetDealershipId) || dealershipAccounts[0];
                  if (found) {
                    setTargetDealershipId(found.id);
                    setInvoiceAmountHT(found.prixFactureMensuel);
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  invoiceEntityType === 'dealership'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Concession</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInvoiceEntityType('garage');
                  const found = garages.find(g => g.id === targetGarageId) || garages[0];
                  if (found) {
                    setTargetGarageId(found.id);
                    const plan = garagePlansList.find(p => p.id === found.planId) || garagePlansList[0];
                    setInvoiceAmountHT(found.prixFactureMensuel || plan.prixMensuel);
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  invoiceEntityType === 'garage'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Garage Atelier</span>
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              {invoiceEntityType === 'dealership' ? (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sélectionner la Concession *</label>
                  <select
                    value={targetDealershipId}
                    onChange={(e) => {
                      setTargetDealershipId(e.target.value);
                      const found = dealershipAccounts.find((a) => a.id === e.target.value);
                      if (found) setInvoiceAmountHT(found.prixFactureMensuel);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    {dealershipAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.info.nom} ({a.prixFactureMensuel.toLocaleString('fr-FR')} FC / mois)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sélectionner l'Atelier / Garage *</label>
                  <select
                    value={targetGarageId}
                    onChange={(e) => {
                      setTargetGarageId(e.target.value);
                      const found = garages.find((g) => g.id === e.target.value);
                      if (found) {
                        const plan = garagePlansList.find(p => p.id === found.planId) || garagePlansList[0];
                        setInvoiceAmountHT(found.prixFactureMensuel || plan.prixMensuel);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    {garages.map((g) => {
                      const plan = garagePlansList.find(p => p.id === g.planId) || garagePlansList[0];
                      const price = g.prixFactureMensuel || plan.prixMensuel;
                      return (
                        <option key={g.id} value={g.id}>
                          {g.nom} ({g.commune}) — {price.toLocaleString('fr-FR')} FC / mois
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Période *</label>
                <input
                  type="text"
                  required
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Montant Hors Taxes (FC) *</label>
                <input
                  type="number"
                  required
                  value={invoiceAmountHT}
                  onChange={(e) => setInvoiceAmountHT(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-bold text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Total TTC avec TVA 16% : <strong className="text-white">{(invoiceAmountHT * 1.16).toLocaleString('fr-FR')} FC</strong>
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg"
                >
                  Générer & Envoyer la Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONCESSION CONFIRMATION MODAL */}
      {dealershipToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 text-slate-100 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-black text-white">
                  Supprimer définitivement la concession ?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cette action est irréversible. Toutes les données associées à cette concession seront supprimées.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Concession :</span>
                <span className="font-bold text-white">{dealershipToDelete.info.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Responsable :</span>
                <span className="text-slate-300">{dealershipToDelete.responsableNom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email :</span>
                <span className="text-slate-300">{dealershipToDelete.emailLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Véhicules associés en stock :</span>
                <span className="font-bold text-amber-400">{dealershipToDelete.nbVehiculesActifs} véhicule(s)</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              💡 Astuce : Si vous souhaitez seulement retirer temporairement cette concession du catalogue public sans la supprimer, utilisez plutôt l'action <strong>« Masquer du public »</strong>.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDealershipToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirmer la Suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE CONCESSION PASSWORD MODAL */}
      {dealershipToChangePassword && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 text-slate-100 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Modifier le Mot de Passe Concession</span>
              </h3>
              <button
                onClick={() => setDealershipToChangePassword(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <p className="font-bold text-white">{dealershipToChangePassword.info.nom}</p>
              <p className="text-slate-400">{dealershipToChangePassword.emailLogin}</p>
            </div>

            <form onSubmit={handleSavePasswordSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">
                  Nouveau mot de passe sécurisé *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Saisissez au moins 6 caractères"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white pr-10 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Le mot de passe restera chiffré et protégé contre les regards indiscrets.
                </p>
              </div>

              {passwordSuccessMsg && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDealershipToChangePassword(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Lock className="w-3.5 h-3.5" /> Enregistrer le Mot de Passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GARAGE CREATE / EDIT MODAL */}
      <GarageFormModal
        isOpen={isGarageFormModalOpen}
        onClose={() => {
          setIsGarageFormModalOpen(false);
          setGarageToEdit(null);
        }}
        garageToEdit={garageToEdit}
        onSaveGarage={(savedGarage) => {
          if (onSaveGarage) {
            onSaveGarage(savedGarage);
          }
          setIsGarageFormModalOpen(false);
          setGarageToEdit(null);
        }}
      />

      {/* GARAGE DETAIL MODAL */}
      {garageForDetail && (
        <GarageDetailModal
          garage={garageForDetail}
          isOpen={!!garageForDetail}
          onClose={() => setGarageForDetail(null)}
          onRequestBreakdown={() => {
            setGarageForDetail(null);
            setGarageSubTab('sos-demandes');
          }}
        />
      )}

      {/* DELETE GARAGE CONFIRMATION MODAL */}
      {garageToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 text-slate-100 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-black text-white">
                  Supprimer définitivement l'atelier ?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cette action retirera ce garage du catalogue et de l'annuaire d'assistance Kinshasa.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Atelier :</span>
                <span className="font-bold text-white">{garageToDelete.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Responsable :</span>
                <span className="text-slate-300">{garageToDelete.responsable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Commune :</span>
                <span className="font-bold text-amber-400">{garageToDelete.commune}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Téléphone :</span>
                <span className="text-slate-300 font-mono">{garageToDelete.telephonePrincipal}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGarageToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteGarage) {
                    onDeleteGarage(garageToDelete.id);
                  }
                  setGarageToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirmer la Suppression
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
