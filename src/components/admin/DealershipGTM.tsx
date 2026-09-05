import React, { useState, useEffect } from 'react';
import { 
  Layers, Activity, Play, ExternalLink, CheckCircle2, Shield, Globe, 
  RefreshCw, Copy, Check, Car, PhoneCall, Calendar, Eye, HelpCircle, 
  ArrowLeft, Code2, Tag, Terminal, Search, Trash2, Download, Send, 
  Sparkles, CheckSquare, AlertCircle, Share2, Target
} from 'lucide-react';
import { DealershipInfo, Vehicle, Lead, GTMDataLayerEvent, AnalyticsReport } from '../../types';
import { 
  initGoogleTagManager, 
  pushToDataLayer, 
  getStoredGtmDataLayer, 
  clearGtmDataLayerHistory,
  generateGtmReport,
  generateGtmContainerExportJson 
} from '../../lib/gtm';
import { 
  initMetaPixel, 
  initTikTokPixel, 
  initGoogleAds, 
  trackPixelEvent, 
  getPixelSnippets 
} from '../../lib/pixels';

interface DealershipGTMProps {
  dealership: DealershipInfo;
  vehicles: Vehicle[];
  leads: Lead[];
  onSaveDealership: (info: DealershipInfo) => void;
  onNavigateHome?: () => void;
}

export const DealershipGTM: React.FC<DealershipGTMProps> = ({
  dealership,
  vehicles,
  leads,
  onSaveDealership,
  onNavigateHome
}) => {
  // GTM State
  const [gtmId, setGtmId] = useState(
    dealership.googleTagManagerId || dealership.googleAnalyticsId?.replace('G-', 'GTM-') || 'GTM-AUTO782'
  );
  const [gtmEnabled, setGtmEnabled] = useState(
    dealership.googleTagManagerEnabled ?? dealership.googleAnalyticsEnabled ?? true
  );

  // Meta Pixel State
  const [metaPixelId, setMetaPixelId] = useState(dealership.metaPixelId || '104829104928172');
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(dealership.metaPixelEnabled ?? true);

  // TikTok Pixel State
  const [tikTokPixelId, setTikTokPixelId] = useState(dealership.tikTokPixelId || 'C9AUTO82910482X');
  const [tikTokPixelEnabled, setTikTokPixelEnabled] = useState(dealership.tikTokPixelEnabled ?? true);

  // Google Ads State
  const [googleAdsId, setGoogleAdsId] = useState(dealership.googleAdsId || 'AW-987456123');
  const [googleAdsConversionLabel, setGoogleAdsConversionLabel] = useState(dealership.googleAdsConversionLabel || 'AbC_xYz12345');
  const [googleAdsEnabled, setGoogleAdsEnabled] = useState(dealership.googleAdsEnabled ?? true);

  const [activeTab, setActiveTab] = useState<'stream' | 'pixels' | 'triggers' | 'stats' | 'setup'>('stream');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [testEventToast, setTestEventToast] = useState<string | null>(null);

  // Live dataLayer stream state
  const [eventsList, setEventsList] = useState<GTMDataLayerEvent[]>(() => getStoredGtmDataLayer());
  const [selectedEvent, setSelectedEvent] = useState<GTMDataLayerEvent | null>(null);
  const [streamFilter, setStreamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom DataLayer Push Sandbox
  const [customEventName, setCustomEventName] = useState('custom_vehicle_interaction');
  const [customEventJson, setCustomEventJson] = useState(`{\n  "action": "click_brochure_pdf",\n  "vehicle_brand": "Porsche",\n  "value": 150\n}`);
  const [customPushError, setCustomPushError] = useState<string | null>(null);

  const [report, setReport] = useState<AnalyticsReport>(() => generateGtmReport(dealership.nom));

  useEffect(() => {
    // Initialize enabled pixels on load
    if (metaPixelId && metaPixelEnabled) initMetaPixel(metaPixelId);
    if (tikTokPixelId && tikTokPixelEnabled) initTikTokPixel(tikTokPixelId);
    if (googleAdsId && googleAdsEnabled) initGoogleAds(googleAdsId, googleAdsConversionLabel);
    if (gtmId && gtmEnabled) initGoogleTagManager(gtmId, false);

    const liveEvents = getStoredGtmDataLayer();
    setEventsList(liveEvents);
    if (!selectedEvent && liveEvents.length > 0) {
      setSelectedEvent(liveEvents[0]);
    }
    setReport(generateGtmReport(dealership.nom));
  }, [dealership.nom, leads.length, vehicles.length]);

  const handleSaveAllTracking = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanGtm = gtmId.trim().toUpperCase();
    const cleanMeta = metaPixelId.trim();
    const cleanTikTok = tikTokPixelId.trim();
    const cleanAds = googleAdsId.trim().toUpperCase();
    const cleanLabel = googleAdsConversionLabel.trim();

    const updated: DealershipInfo = {
      ...dealership,
      googleTagManagerId: cleanGtm,
      googleTagManagerEnabled: gtmEnabled,
      metaPixelId: cleanMeta,
      metaPixelEnabled: metaPixelEnabled,
      tikTokPixelId: cleanTikTok,
      tikTokPixelEnabled: tikTokPixelEnabled,
      googleAdsId: cleanAds,
      googleAdsConversionLabel: cleanLabel,
      googleAdsEnabled: googleAdsEnabled,
      googleAnalyticsId: cleanGtm.startsWith('G-') ? cleanGtm : `G-${cleanGtm.replace('GTM-', '')}`,
      googleAnalyticsEnabled: gtmEnabled
    };

    onSaveDealership(updated);

    if (updated.googleTagManagerId && updated.googleTagManagerEnabled) {
      initGoogleTagManager(updated.googleTagManagerId, false);
    }
    if (updated.metaPixelId && updated.metaPixelEnabled) {
      initMetaPixel(updated.metaPixelId);
    }
    if (updated.tikTokPixelId && updated.tikTokPixelEnabled) {
      initTikTokPixel(updated.tikTokPixelId);
    }
    if (updated.googleAdsId && updated.googleAdsEnabled) {
      initGoogleAds(updated.googleAdsId, updated.googleAdsConversionLabel);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTriggerTestEvent = (type: 'view_item' | 'test_drive' | 'lead' | 'share') => {
    const targetVehicle = vehicles[0] || { 
      id: 'v-demo', 
      marque: 'Porsche', 
      modele: '911 Carrera', 
      finition: 'GTS', 
      prix: 135000,
      annee: 2024,
      kilometrage: 12500,
      carburant: 'Essence',
      categorie: 'Coupé'
    };

    if (type === 'view_item') {
      pushToDataLayer({
        event: 'view_item',
        ecommerce: {
          currency: 'EUR',
          value: targetVehicle.prix,
          items: [{
            item_id: targetVehicle.id,
            item_name: `${targetVehicle.marque} ${targetVehicle.modele}`,
            item_brand: targetVehicle.marque,
            price: targetVehicle.prix,
            item_category: targetVehicle.categorie || 'Voiture'
          }]
        },
        vehicle_id: targetVehicle.id,
        vehicle_name: `${targetVehicle.marque} ${targetVehicle.modele}`,
        vehicle_brand: targetVehicle.marque,
        vehicle_price: targetVehicle.prix,
        dealership_name: dealership.nom
      }, 'engagement');

      setTestEventToast(`Événement "view_item" / Meta "ViewContent" / TikTok "ViewContent" dispatché !`);
    } else if (type === 'test_drive') {
      pushToDataLayer({
        event: 'test_drive_booking',
        lead_type: 'essai_routier',
        vehicle_id: targetVehicle.id,
        vehicle_name: `${targetVehicle.marque} ${targetVehicle.modele}`,
        vehicle_price: targetVehicle.prix,
        dealership_name: dealership.nom,
        client_name: 'Alexandre Dumas (Test)',
        client_email: 'a.dumas@test-ad.fr',
        client_phone: '06 12 34 56 78',
        value: 500,
        currency: 'EUR'
      }, 'conversion');

      setTestEventToast(`Conversion Essai dispatchée (GTM, Meta "Schedule", TikTok "SubmitForm", Google Ads "conversion") !`);
    } else if (type === 'lead') {
      pushToDataLayer({
        event: 'generate_lead',
        lead_id: `lead-sim-${Date.now()}`,
        lead_type: 'devis_financement',
        vehicle_id: targetVehicle.id,
        vehicle_name: `${targetVehicle.marque} ${targetVehicle.modele}`,
        dealership_name: dealership.nom,
        client_name: 'Sophie Laurent (Test)',
        value: 300,
        currency: 'EUR'
      }, 'lead');

      setTestEventToast(`Événement Lead envoyé (Meta "Lead", TikTok "SubmitForm", Google Ads conversion) !`);
    } else {
      pushToDataLayer({
        event: 'share',
        method: 'whatsapp',
        content_type: 'vehicle',
        item_id: targetVehicle.id,
        item_name: `${targetVehicle.marque} ${targetVehicle.modele}`,
        vehicle_id: targetVehicle.id,
        vehicle_name: `${targetVehicle.marque} ${targetVehicle.modele}`,
        dealership_name: dealership.nom,
        value: targetVehicle.prix,
        currency: 'EUR'
      }, 'engagement');

      setTestEventToast(`Événement Partage envoyé (Meta "VehicleShare", GTM "share") !`);
    }

    const updatedEvents = getStoredGtmDataLayer();
    setEventsList(updatedEvents);
    setSelectedEvent(updatedEvents[0]);
    setReport(generateGtmReport(dealership.nom));
    setTimeout(() => setTestEventToast(null), 4000);
  };

  const handleCustomPush = () => {
    setCustomPushError(null);
    try {
      const parsed = JSON.parse(customEventJson);
      const payload = {
        event: customEventName.trim() || 'custom_event',
        dealership_name: dealership.nom,
        ...parsed
      };
      const ev = pushToDataLayer(payload, 'engagement');
      const updatedEvents = getStoredGtmDataLayer();
      setEventsList(updatedEvents);
      setSelectedEvent(ev);
      setTestEventToast(`Événement personnalisé "${payload.event}" envoyé au dataLayer & Pixels !`);
      setTimeout(() => setTestEventToast(null), 3500);
    } catch (e: any) {
      setCustomPushError(`JSON Invalide : ${e.message}`);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Voulez-vous réinitialiser le journal des événements DataLayer ?')) {
      clearGtmDataLayerHistory();
      const resetList = getStoredGtmDataLayer();
      setEventsList(resetList);
      setSelectedEvent(resetList[0] || null);
    }
  };

  const handleDownloadGtmJson = () => {
    const jsonStr = generateGtmContainerExportJson(gtmId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GTM-AutoConcession-${gtmId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredEvents = eventsList.filter((ev) => {
    const matchFilter = streamFilter === 'all' || ev.event === streamFilter || ev.category === streamFilter;
    const matchQuery = !searchQuery || 
      ev.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.vehicle_name && ev.vehicle_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      JSON.stringify(ev.rawPayload).toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchQuery;
  });

  const snippets = getPixelSnippets({
    metaPixelId,
    tikTokPixelId,
    googleAdsId,
    googleAdsLabel: googleAdsConversionLabel
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      
      {/* Toast Notification */}
      {testEventToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-300 animate-bounce">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs">{testEventToast}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow cursor-pointer mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Vitrine</span>
                </button>
              )}
              <span className="p-2 bg-indigo-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md">
                <Layers className="w-4 h-4" /> Marketing & Tracking Hub
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                GTM • Meta Pixel • TikTok • Google Ads
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                {dealership.nom}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Google Tag Manager, Meta Pixel, TikTok & Google Ads
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Gérez l'ensemble de vos balises publicitaires et de conversion en un point central. Chaque interaction (consultation, demande d'essai, lead, devis, partage) est synchronisée automatiquement sur <strong>Google Tag Manager</strong>, <strong>Meta Pixel (Facebook/Instagram)</strong>, <strong>TikTok Pixel</strong> et <strong>Google Ads</strong>.
            </p>
          </div>

          {/* Quick Ad Platform Links */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://adsmanager.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-600/40 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
            >
              <ExternalLink className="w-3 h-3 text-blue-400" />
              <span>Meta Ads</span>
            </a>
            <a
              href="https://ads.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-950 hover:bg-slate-800 text-pink-300 border border-pink-500/30 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
            >
              <ExternalLink className="w-3 h-3 text-pink-400" />
              <span>TikTok Ads</span>
            </a>
            <a
              href="https://ads.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
            >
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>Google Ads</span>
            </a>
            <a
              href="https://tagmanager.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
            >
              <ExternalLink className="w-3 h-3 text-indigo-200" />
              <span>Tag Manager</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('stream')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'stream'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Flux Live & Inspecteur ({eventsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pixels')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'pixels'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>🎯 Pixels Publicitaires (Meta, TikTok, Google Ads)</span>
        </button>

        <button
          onClick={() => setActiveTab('triggers')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'triggers'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Déclencheurs & Variables GTM</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Statistiques & Conversions</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'setup'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Codes & Export GTM JSON</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LIVE MULTI-PIXEL & DATALAYER STREAM                */}
      {/* ========================================================= */}
      {activeTab === 'stream' && (
        <div className="space-y-6">
          
          {/* Active Pixels Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Google Tag Manager</span>
                <span className="text-xs font-mono font-bold text-amber-400">{gtmId}</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Meta Pixel (Facebook/IG)</span>
                <span className="text-xs font-mono font-bold text-blue-400">{metaPixelId || 'Non configuré'}</span>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${metaPixelEnabled ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">TikTok Pixel</span>
                <span className="text-xs font-mono font-bold text-pink-400">{tikTokPixelId || 'Non configuré'}</span>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${tikTokPixelEnabled ? 'bg-pink-400' : 'bg-slate-600'}`}></span>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Google Ads Conversion</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{googleAdsId || 'Non configuré'}</span>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${googleAdsEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
            </div>
          </div>

          {/* Simulation & Test Triggers Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Déclencher un Test Multi-Pixel :
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleTriggerTestEvent('view_item')}
                className="bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Pousser un événement view_item / ViewContent"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>view_item (Fiche)</span>
              </button>

              <button
                onClick={() => handleTriggerTestEvent('test_drive')}
                className="bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Pousser un événement test_drive_booking / Schedule / Conversion"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>test_drive (Essai)</span>
              </button>

              <button
                onClick={() => handleTriggerTestEvent('lead')}
                className="bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Pousser un événement generate_lead / Lead / SubmitForm"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>generate_lead (Devis)</span>
              </button>

              <button
                onClick={() => handleTriggerTestEvent('share')}
                className="bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Pousser un événement share"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>share (Partage)</span>
              </button>

              <button
                onClick={handleClearHistory}
                className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer ml-auto"
                title="Vider l'historique"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider</span>
              </button>
            </div>
          </div>

          {/* Stream Inspector Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Events Stream List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Événements Capturés ({filteredEvents.length})
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">GTM & Pixels</span>
                </div>

                {/* Filter & Search Bar */}
                <div className="space-y-2 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filtrer (nom, marque, payload...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {['all', 'page_view', 'view_item', 'generate_lead', 'test_drive_booking', 'share'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setStreamFilter(f)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          streamFilter === f
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {f === 'all' ? 'Tous' : f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Events Scroll List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredEvents.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Aucun événement capturé avec ce filtre.
                    </div>
                  ) : (
                    filteredEvents.map((ev) => {
                      const isSelected = selectedEvent?.id === ev.id;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-3 rounded-xl border transition cursor-pointer text-xs space-y-1 ${
                            isSelected
                              ? 'bg-indigo-950/60 border-indigo-500 shadow-md'
                              : 'bg-slate-950 hover:bg-slate-800/60 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              ev.event === 'generate_lead' || ev.event === 'test_drive_booking'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : ev.event === 'view_item'
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : ev.event === 'share'
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-slate-800 text-amber-400 border border-slate-700'
                            }`}>
                              {ev.event}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(ev.timestamp).toLocaleTimeString('fr-FR', {
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="font-bold text-white truncate">
                            {ev.vehicle_name || ev.page_title || ev.page_path || 'Événement Global'}
                          </div>

                          {ev.vehicle_price && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              Prix : {ev.vehicle_price.toLocaleString('fr-FR')} € {ev.lead_type && `• Type : ${ev.lead_type}`}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Selected Event DataLayer Payload Inspector */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      Inspecteur DataLayer & Pixels Payload
                    </h3>
                    <p className="text-xs text-slate-400">
                      Payload exact transmis à GTM, Meta Pixel, TikTok Pixel et Google Ads.
                    </p>
                  </div>

                  {selectedEvent && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedEvent.rawPayload, null, 2));
                        setTestEventToast('JSON copié dans le presse-papier !');
                        setTimeout(() => setTestEventToast(null), 2500);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier JSON</span>
                    </button>
                  )}
                </div>

                {selectedEvent ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-semibold block">Événement</span>
                        <span className="font-mono font-bold text-amber-400">{selectedEvent.event}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-semibold block">Catégorie</span>
                        <span className="font-bold text-white capitalize">{selectedEvent.category || 'Standard'}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-semibold block">ID Véhicule</span>
                        <span className="font-mono text-slate-300">{selectedEvent.vehicle_id || 'Global'}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-semibold block">Heure</span>
                        <span className="font-mono text-slate-300">
                          {new Date(selectedEvent.timestamp).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                      <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(selectedEvent.rawPayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    Sélectionnez un événement à gauche pour inspecter son payload.
                  </div>
                )}
              </div>

              {/* Custom Push Sandbox */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-400" />
                    Bac à Sable : Pousser un Objet dans DataLayer & Pixels
                  </h3>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                    window.dataLayer.push()
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Nom de l'événement (event)</label>
                    <input
                      type="text"
                      value={customEventName}
                      onChange={(e) => setCustomEventName(e.target.value)}
                      placeholder="Ex: custom_contact_click"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Corps du Payload (JSON)</label>
                    <textarea
                      rows={3}
                      value={customEventJson}
                      onChange={(e) => setCustomEventJson(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {customPushError && (
                  <p className="text-rose-400 text-xs font-semibold">{customPushError}</p>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleCustomPush}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer dans dataLayer & Pixels</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DEDICATED ADVERTISING PIXELS SETUP                 */}
      {/* ========================================================= */}
      {activeTab === 'pixels' && (
        <div className="space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Configuration des Régies Publicitaires (Meta, TikTok & Google Ads)
              </h2>
              <p className="text-xs text-slate-400">
                Activez et connectez directement vos pixels pour optimiser vos campagnes de reciblage (retargeting) et de génération de leads.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isSaved && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Paramètres Enregistrés !
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSaveAllTracking()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Enregistrer Tous les Pixels</span>
              </button>
            </div>
          </div>

          {/* 3 Dedicated Pixel Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* META PIXEL (FACEBOOK & INSTAGRAM) */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow">
                      f
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Meta Pixel (Facebook / Instagram)</h3>
                      <span className="text-[10px] text-blue-400 font-semibold">Reciblage & Conversions Ads</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metaPixelEnabled}
                      onChange={(e) => setMetaPixelEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-500 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-300">
                      {metaPixelEnabled ? 'Actif' : 'Inactif'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    ID du Pixel Meta (Facebook Pixel ID) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 104829104928172"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Retrouvez votre Pixel ID dans le Meta Events Manager (Gestionnaire d'événements).
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                  <span className="text-slate-400 font-bold block">Événements Meta Automatisés :</span>
                  <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[10px]">
                    <li><code>fbq('track', 'ViewContent')</code> sur fiches véhicules</li>
                    <li><code>fbq('track', 'Lead')</code> sur formulaires devis & reprise</li>
                    <li><code>fbq('track', 'Schedule')</code> sur réservations d'essais</li>
                    <li><code>fbq('trackCustom', 'VehicleShare')</code> sur partages</li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <a
                  href="https://adsmanager.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  <span>Events Manager</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(snippets.metaSnippet);
                    setCopiedSnippet('meta');
                    setTimeout(() => setCopiedSnippet(null), 2000);
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                >
                  {copiedSnippet === 'meta' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSnippet === 'meta' ? 'Copié !' : 'Copier Code'}
                </button>
              </div>
            </div>

            {/* TIKTOK PIXEL */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-cyan-500 text-white flex items-center justify-center font-black text-sm shadow">
                      TT
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">TikTok Pixel</h3>
                      <span className="text-[10px] text-pink-400 font-semibold">TikTok Ads Manager</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tikTokPixelEnabled}
                      onChange={(e) => setTikTokPixelEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-500 accent-pink-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-300">
                      {tikTokPixelEnabled ? 'Actif' : 'Inactif'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    ID du Pixel TikTok (TikTok Pixel ID) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: C9AUTO82910482X"
                    value={tikTokPixelId}
                    onChange={(e) => setTikTokPixelId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-pink-400 font-mono focus:outline-none focus:border-pink-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Trouvez votre code dans TikTok Ads Manager &gt; Assets &gt; Events.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                  <span className="text-slate-400 font-bold block">Événements TikTok Automatisés :</span>
                  <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[10px]">
                    <li><code>ttq.track('ViewContent')</code> consultation de véhicule</li>
                    <li><code>ttq.track('SubmitForm')</code> réservation d'essai & devis</li>
                    <li><code>ttq.track('Contact')</code> clic appel / contact commercial</li>
                    <li><code>ttq.page()</code> changement de vue automatique</li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <a
                  href="https://ads.tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
                >
                  <span>TikTok Events</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(snippets.tikTokSnippet);
                    setCopiedSnippet('tiktok');
                    setTimeout(() => setCopiedSnippet(null), 2000);
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                >
                  {copiedSnippet === 'tiktok' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSnippet === 'tiktok' ? 'Copié !' : 'Copier Code'}
                </button>
              </div>
            </div>

            {/* GOOGLE ADS CONVERSION TRACKING */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow">
                      G
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Google Ads Conversion</h3>
                      <span className="text-[10px] text-amber-400 font-semibold">Suivi des Conversions & ROAS</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={googleAdsEnabled}
                      onChange={(e) => setGoogleAdsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-300">
                      {googleAdsEnabled ? 'Actif' : 'Inactif'}
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      ID Google Ads (AW-XXXXXXXXX) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: AW-987456123"
                      value={googleAdsId}
                      onChange={(e) => setGoogleAdsId(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Libellé de conversion (Conversion Label)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: AbC_xYz12345"
                      value={googleAdsConversionLabel}
                      onChange={(e) => setGoogleAdsConversionLabel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                  <span className="text-slate-400 font-bold block">Suivi Google Ads Automatisé :</span>
                  <p className="text-[10px] text-slate-300">
                    Transmet l'événement <code>gtag('event', 'conversion', ... )</code> avec valeur commerciale lors de chaque réservation d'essai routier et devis.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <a
                  href="https://ads.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <span>Google Ads</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(snippets.googleAdsSnippet);
                    setCopiedSnippet('googleads');
                    setTimeout(() => setCopiedSnippet(null), 2000);
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                >
                  {copiedSnippet === 'googleads' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSnippet === 'googleads' ? 'Copié !' : 'Copier Code'}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GTM TRIGGERS & VARIABLES MATRIX                    */}
      {/* ========================================================= */}
      {activeTab === 'triggers' && (
        <div className="space-y-6">
          
          {/* Triggers Matrix */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Déclencheurs (Custom Events) Prêts pour vos Balises GTM</h3>
              <p className="text-xs text-slate-400">
                Chaque action client déclenche un événement standard que vous pouvez lier à vos balises GA4, Meta Pixel, Google Ads et TikTok dans Tag Manager.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950 text-[11px] uppercase">
                    <th className="p-3">Événement GTM</th>
                    <th className="p-3">Déclenchement (Trigger Type)</th>
                    <th className="p-3">Variables Transmises</th>
                    <th className="p-3">Balises Associables</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">page_view</td>
                    <td className="p-3 text-slate-300">Changement de page / navigation</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">page_path, page_title, dealership_name</td>
                    <td className="p-3"><span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded font-bold">GA4 PageView / Meta PageView</span></td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-sky-400">view_item</td>
                    <td className="p-3 text-slate-300">Consultation fiche détaillée d'un véhicule</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">vehicle_id, vehicle_name, vehicle_price, vehicle_brand</td>
                    <td className="p-3"><span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded font-bold">GA4 view_item / Meta ViewContent / TikTok ViewContent</span></td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-emerald-400">test_drive_booking</td>
                    <td className="p-3 text-slate-300">Réservation d'un essai routier</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">vehicle_id, vehicle_name, client_name, client_phone, value</td>
                    <td className="p-3"><span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">Google Ads Conversion / Meta Schedule / TikTok SubmitForm</span></td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-emerald-400">generate_lead</td>
                    <td className="p-3 text-slate-300">Soumission devis / contact / reprise</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">lead_type, vehicle_name, client_name, value</td>
                    <td className="p-3"><span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">GA4 generate_lead / Meta Lead / TikTok SubmitForm</span></td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-indigo-400">share</td>
                    <td className="p-3 text-slate-300">Partage WhatsApp / Facebook / QR Code</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">method, content_type, item_name, value</td>
                    <td className="p-3"><span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-bold">GA4 share / Meta Engagement</span></td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">submit_price_offer</td>
                    <td className="p-3 text-slate-300">Proposition d'offre de prix par un acheteur</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">vehicle_name, proposed_price, value</td>
                    <td className="p-3"><span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">Google Ads Conversion / Meta Lead</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* DataLayer Variables Table */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Variables DataLayer (DLV) Mises à Disposition</h3>
              <p className="text-xs text-slate-400">
                Déclarez ces variables de couche de données dans votre interface Google Tag Manager pour injecter dynamiquement les données dans vos pixels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'vehicle_id', desc: 'Identifiant unique du véhicule', example: '"car-1"' },
                { name: 'vehicle_name', desc: 'Titre & Modèle du véhicule', example: '"BMW Série 3 - 320i"' },
                { name: 'vehicle_price', desc: 'Prix de vente en euros (numérique)', example: '44900' },
                { name: 'vehicle_brand', desc: 'Marque constructeur', example: '"BMW"' },
                { name: 'dealership_name', desc: 'Nom de la concession active', example: `"${dealership.nom}"` },
                { name: 'lead_type', desc: 'Type de demande client', example: '"essai_routier", "financement"' },
                { name: 'method', desc: 'Réseau social utilisé pour le partage', example: '"whatsapp", "facebook"' },
                { name: 'value', desc: 'Valeur commerciale transmise', example: '500' },
              ].map((v) => (
                <div key={v.name} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-400 text-xs font-bold">{'{{DLV - ' + v.name + '}}'}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Version 2</span>
                  </div>
                  <p className="text-xs text-slate-300">{v.desc}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Ex : {v.example}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: GTM CONVERSIONS & STATS                            */}
      {/* ========================================================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Pages Vues</span>
              <p className="text-2xl font-black text-white">{report.totalPageViews.toLocaleString('fr-FR')}</p>
              <span className="text-[10px] text-slate-500 font-medium">{report.totalUniqueVisitors.toLocaleString('fr-FR')} visiteurs</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Vues Véhicules</span>
              <p className="text-2xl font-black text-sky-400">{report.vehicleViews.toLocaleString('fr-FR')}</p>
              <span className="text-[10px] text-slate-500 font-medium">Meta & TikTok ViewContent</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Leads Générés</span>
              <p className="text-2xl font-black text-emerald-400">{report.leadsGenerated}</p>
              <span className="text-[10px] text-slate-500 font-medium">Meta & TikTok Lead</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Essais Réservés</span>
              <p className="text-2xl font-black text-amber-400">{report.testDriveBookings}</p>
              <span className="text-[10px] text-slate-500 font-medium">Google Ads Conversion</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Taux de Conversion</span>
              <p className="text-2xl font-black text-indigo-400">{report.conversionRate}%</p>
              <span className="text-[10px] text-emerald-400 font-bold">Flux Qualifié</span>
            </div>
          </div>

          {/* Top Vehicles Tracked */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white">Véhicules les plus consultés via dataLayer & Pixels</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.topVehicles.map((v, i) => (
                <div key={v.id || i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{v.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">ID : {v.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400">{v.views} vues</span>
                    <p className="text-[10px] text-emerald-400 font-semibold">{v.leads} conversion(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: GTM INSTALLATION SETUP & JSON EXPORT               */}
      {/* ========================================================= */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          
          {/* Form to update GTM ID */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Configuration du Conteneur GTM de la Concession
                </h3>
                <p className="text-xs text-slate-400">
                  Renseignez l'identifiant de votre conteneur Google Tag Manager (format GTM-XXXXXXX).
                </p>
              </div>

              {isSaved && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Enregistré avec succès !
                </span>
              )}
            </div>

            <form onSubmit={handleSaveAllTracking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ID du Conteneur GTM *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: GTM-N8KP54X"
                    value={gtmId}
                    onChange={(e) => setGtmId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Trouvez cet identifiant en haut à droite de votre tableau de bord Google Tag Manager.
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    État de l'Injection GTM
                  </label>
                  <label className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gtmEnabled}
                      onChange={(e) => setGtmEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">
                      {gtmEnabled ? '🟢 Conteneur GTM Activé' : '⚪ Désactivé'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Mettre à Jour le Conteneur GTM</span>
                </button>
              </div>
            </form>
          </div>

          {/* Ready-to-import GTM Template JSON Card */}
          <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-400" />
                  Modèle de Conteneur GTM Préconfiguré (Prêt à l'Emploi)
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Téléchargez le fichier JSON complet contenant déjà tous les <strong>Déclencheurs (view_item, generate_lead, share)</strong> et <strong>Variables de couche de données</strong> pour l'importer en 1 clic dans Google Tag Manager.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadGtmJson}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger Conteneur JSON</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
