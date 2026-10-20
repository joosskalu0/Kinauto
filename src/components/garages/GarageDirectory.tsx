import React, { useState, useMemo } from 'react';
import { 
  Wrench, Search, MapPin, Phone, MessageSquare, ShieldCheck, 
  Clock, Truck, AlertTriangle, PlusCircle, Star, Filter, 
  ChevronRight, Sparkles, Navigation, CheckCircle2, SlidersHorizontal,
  Flame, Zap, Cpu, Wind, Shield, Droplet, Layers, Package, Disc, Info,
  DollarSign, Edit3
} from 'lucide-react';
import { GarageProfile, KinshasaCommune, GarageSpecialty, BreakdownRequest } from '../../types';
import { KINSHASA_COMMUNES, GARAGE_SPECIALTY_LABELS } from '../../data/mockGarages';
import { GarageDetailModal } from './GarageDetailModal';
import { BreakdownRequestModal } from './BreakdownRequestModal';
import { RegisterGarageModal } from './RegisterGarageModal';
import { GarageTarifsModal } from './GarageTarifsModal';

interface GarageDirectoryProps {
  garages: GarageProfile[];
  onAddGarage: (garage: GarageProfile) => void;
  onUpdateGarage?: (garage: GarageProfile) => void;
  onSubmitBreakdownRequest: (request: BreakdownRequest) => void;
  onNavigateHome?: () => void;
  isLoggedIn?: boolean;
  currentUser?: any;
  onOpenAuth?: () => void;
}

export const GarageDirectory: React.FC<GarageDirectoryProps> = ({
  garages,
  onAddGarage,
  onUpdateGarage,
  onSubmitBreakdownRequest,
  onNavigateHome,
  isLoggedIn = false,
  currentUser = null,
  onOpenAuth
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string>('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [filter24hOnly, setFilter24hOnly] = useState(false);
  const [filterSundayOpen, setFilterSundayOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'note' | 'avis' | 'nom'>('note');

  // Modals state
  const [activeDetailGarage, setActiveDetailGarage] = useState<GarageProfile | null>(null);
  const [openTarifsEditorInitially, setOpenTarifsEditorInitially] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [targetGarageForSOS, setTargetGarageForSOS] = useState<GarageProfile | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isTarifsModalOpen, setIsTarifsModalOpen] = useState(false);
  const [tarifsModalGarageId, setTarifsModalGarageId] = useState<string | null>(null);
  const [recentSOSSuccess, setRecentSOSSuccess] = useState<BreakdownRequest | null>(null);

  const handleGarageUpdated = (updatedGarage: GarageProfile) => {
    setActiveDetailGarage(updatedGarage);
    onUpdateGarage?.(updatedGarage);
  };

  const handleSaveTarifsDirectly = (garageId: string, newTarifs: any[]) => {
    const target = garages.find(g => g.id === garageId);
    if (target) {
      const updated: GarageProfile = {
        ...target,
        tarifsIndicatifs: newTarifs
      };
      onUpdateGarage?.(updated);
      if (activeDetailGarage && activeDetailGarage.id === garageId) {
        setActiveDetailGarage(updated);
      }
    }
  };

  // Filtered Garages
  const filteredGarages = useMemo(() => {
    return garages.filter((g) => {
      // Hide if masked by administrator
      if (g.estMasque) return false;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        g.nom.toLowerCase().includes(q) ||
        g.responsable.toLowerCase().includes(q) ||
        g.commune.toLowerCase().includes(q) ||
        g.adresse.toLowerCase().includes(q) ||
        g.repere.toLowerCase().includes(q) ||
        g.marquesExpertise.some(m => m.toLowerCase().includes(q)) ||
        g.specialites.some(s => GARAGE_SPECIALTY_LABELS[s]?.label.toLowerCase().includes(q));

      const matchesCommune = selectedCommune === 'ALL' || g.commune === selectedCommune;
      const matchesSpecialty = selectedSpecialty === 'ALL' || g.specialites.includes(selectedSpecialty as GarageSpecialty);
      const matches24h = !filter24hOnly || g.estDepannageMobile24h;
      const matchesSunday = !filterSundayOpen || g.ouvertDimanche;

      return matchesSearch && matchesCommune && matchesSpecialty && matches24h && matchesSunday;
    }).sort((a, b) => {
      if (sortBy === 'note') return b.noteGlobale - a.noteGlobale;
      if (sortBy === 'avis') return b.nombreAvis - a.nombreAvis;
      return a.nom.localeCompare(b.nom);
    });
  }, [garages, searchQuery, selectedCommune, selectedSpecialty, filter24hOnly, filterSundayOpen, sortBy]);

  const handleOpenSOS = (garage?: GarageProfile) => {
    setTargetGarageForSOS(garage || null);
    setIsBreakdownModalOpen(true);
  };

  const handleProcessBreakdownSubmit = (req: BreakdownRequest) => {
    onSubmitBreakdownRequest(req);
    setRecentSOSSuccess(req);
    setTimeout(() => {
      setRecentSOSSuccess(null);
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      
      {/* Top Hero / SOS Emergency Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-amber-50/20 to-[#f8fafc] border-b border-slate-200">
        
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 left-10 w-80 h-80 bg-rose-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Title and Pitch */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-500/20">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  SOS Panne Kinshasa 24/7
                </span>
                <span className="bg-white border border-slate-200 text-amber-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Toutes les 24 Communes de Kinshasa
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Trouvez un <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-700">Garagiste & Dépanneur</span> près de chez vous
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Batterie à plat, crevaison, surchauffe moteur ou panne électronique ? Localisez instantanément les ateliers certifiés et mécaniciens mobiles prêts à intervenir en urgence à Gombe, Limete, Ngaliema, Kintambo, Lemba, Matete, N'djili et partout à Kinshasa.
              </p>
            </div>

            {/* Quick Action Box */}
            <div className="w-full lg:w-auto bg-white border border-rose-200 rounded-3xl p-6 shadow-xl space-y-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 block">
                    Assistance Express Immédiate
                  </span>
                  <h3 className="text-base font-black text-slate-900">Vous êtes en panne actuellement ?</h3>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  id="btn-hero-sos-breakdown"
                  onClick={() => handleOpenSOS()}
                  className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition transform active:scale-95 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Déclencher une Alerte SOS</span>
                </button>

                <button
                  id="btn-hero-register-garage"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-600" />
                  <span>Inscrire mon Garage</span>
                </button>

                <button
                  id="btn-hero-manage-tarifs"
                  onClick={() => {
                    setTarifsModalGarageId(null);
                    setIsTarifsModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                  title="Ouvrir l'espace garagiste pour saisir ou modifier les prix des services"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Donner mes Prix (Garagiste)</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Plus de {garages.length} ateliers & maîtres mécaniciens répertoriés</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Recent SOS Success Banner */}
        {recentSOSSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">
                  Alerte SOS envoyée pour {recentSOSSuccess.clientNom} à {recentSOSSuccess.communePanne} ({recentSOSSuccess.adresseLieuPanne}) !
                </span>
                <span className="text-emerald-700">
                  Les dépanneurs du secteur ont été notifiés. Gardez votre téléphone à portée de main.
                </span>
              </div>
            </div>
            <button
              onClick={() => setRecentSOSSuccess(null)}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter and Search Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          
          {/* Search Bar & Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom de garage, repère, avenue, marque (ex: Socimat, Toyota, Scanner)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Commune Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition font-medium"
              >
                <option value="ALL">📍 Toutes les communes ({garages.length})</option>
                {KINSHASA_COMMUNES.map((commune) => {
                  const count = garages.filter(g => g.commune === commune).length;
                  return (
                    <option key={commune} value={commune}>
                      {commune} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition font-medium"
              >
                <option value="note">⭐ Mieux notés en premier</option>
                <option value="avis">🔥 Plus d'avis clients</option>
                <option value="nom">🔤 Nom (A - Z)</option>
              </select>
            </div>

          </div>

          {/* Specialty Filter Pills */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Filtrer par Spécialité Technique :
              </span>
              {(selectedSpecialty !== 'ALL' || filter24hOnly || filterSundayOpen || selectedCommune !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedSpecialty('ALL');
                    setSelectedCommune('ALL');
                    setSearchQuery('');
                    setFilter24hOnly(false);
                    setFilterSundayOpen(false);
                  }}
                  className="text-amber-600 hover:text-amber-700 font-bold transition cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedSpecialty('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedSpecialty === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                Tous les services
              </button>

              {(Object.keys(GARAGE_SPECIALTY_LABELS) as GarageSpecialty[]).map((spec) => {
                const info = GARAGE_SPECIALTY_LABELS[spec];
                const count = garages.filter(g => g.specialites.includes(spec)).length;
                if (count === 0) return null;
                const isSelected = selectedSpecialty === spec;

                return (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span>{info.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-slate-950 text-amber-400' : 'bg-white text-slate-600 border border-slate-200'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Toggles Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setFilter24hOnly(!filter24hOnly)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                filter24hOnly
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Dépannage Mobile 24/7</span>
            </button>

            <button
              onClick={() => setFilterSundayOpen(!filterSundayOpen)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                filterSundayOpen
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ouvert le Dimanche</span>
            </button>

            <span className="text-xs text-slate-500 ml-auto font-medium">
              {filteredGarages.length} résultat{filteredGarages.length > 1 ? 's' : ''} trouvé{filteredGarages.length > 1 ? 's' : ''}
            </span>
          </div>

        </div>

        {/* Quick Commune Shortcuts Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-600 font-bold shrink-0 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" /> Communes :
          </span>
          {['Gombe', 'Limete', 'Ngaliema', 'Kintambo', 'Bandalungwa', 'Lemba', 'Matete', 'Ndjili'].map((com) => {
            const isSelected = selectedCommune === com;
            return (
              <button
                key={com}
                onClick={() => setSelectedCommune(isSelected ? 'ALL' : com)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {com}
              </button>
            );
          })}
        </div>

        {/* Garages List Grid */}
        {filteredGarages.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Aucun garage ne correspond à vos critères</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Essayez d'élargir votre recherche ou de réinitialiser les filtres de commune et de spécialité.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCommune('ALL');
                setSelectedSpecialty('ALL');
                setFilter24hOnly(false);
                setFilterSundayOpen(false);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Afficher tous les garages
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGarages.map((garage) => (
              <div
                key={garage.id}
                className="bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xl rounded-3xl overflow-hidden shadow-sm transition duration-300 flex flex-col group"
              >
                {/* Card Top Image & Badges */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={garage.photos[0]}
                    alt={garage.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                  {/* Commune Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-white/95 text-slate-900 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 backdrop-blur-sm flex items-center gap-1 shadow-sm">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {garage.commune}
                    </span>
                    {garage.estDepannageMobile24h && (
                      <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-sm animate-pulse flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        SOS 24/7
                      </span>
                    )}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 text-slate-900 font-black text-xs px-2.5 py-1 rounded-lg border border-slate-200 backdrop-blur-sm flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{garage.noteGlobale}</span>
                    <span className="text-[10px] text-slate-500">({garage.nombreAvis})</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-2.5">
                    <div>
                      <h3 className="font-black text-base text-slate-900 group-hover:text-amber-600 transition line-clamp-2 leading-snug">
                        {garage.nom}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                        <span className="text-slate-400">Responsable :</span>
                        <strong className="text-slate-800 font-bold">{garage.responsable}</strong>
                        {garage.titreResponsable && (
                          <span className="text-slate-500 hidden sm:inline">• {garage.titreResponsable}</span>
                        )}
                      </p>
                    </div>

                    {/* Landmark / Repère Kinshasa */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Repère & Localisation :
                      </span>
                      <span className="text-xs text-amber-900 font-semibold flex items-center gap-1.5">
                        📍 {garage.repere}
                      </span>
                    </div>

                    {/* Direct phone number visible */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-slate-500 font-medium">Contact direct :</span>
                      <span className="text-amber-700 font-mono font-bold">{garage.telephonePrincipal}</span>
                    </div>

                    {/* Specialties Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {garage.specialites.slice(0, 3).map((spec) => {
                        const info = GARAGE_SPECIALTY_LABELS[spec];
                        return (
                          <span
                            key={spec}
                            className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-md border border-slate-200 font-medium"
                          >
                            {info?.label || spec}
                          </span>
                        );
                      })}
                      {garage.specialites.length > 3 && (
                        <span className="bg-amber-50 text-amber-800 font-bold text-[10px] px-1.5 py-0.5 rounded-md border border-amber-200">
                          +{garage.specialites.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Aperçu Prix des Prestations / Tarifs du Garagiste */}
                  {garage.tarifsIndicatifs && garage.tarifsIndicatifs.length > 0 ? (
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 font-bold flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          Prix des services :
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTarifsModalGarageId(garage.id);
                            setIsTarifsModalOpen(true);
                          }}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          title="Modifier les prix de cet atelier"
                        >
                          <span>{garage.tarifsIndicatifs.length} prix</span>
                          <span className="text-emerald-400">•</span>
                          <span className="font-extrabold flex items-center gap-0.5 text-emerald-800">
                            <Edit3 className="w-2.5 h-2.5" /> Donner mes prix
                          </span>
                        </button>
                      </div>
                      <div className="space-y-1">
                        {garage.tarifsIndicatifs.slice(0, 2).map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] gap-2">
                            <span className="text-slate-800 truncate font-medium">{t.prestation}</span>
                            <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                              {t.prixEstime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-2 rounded-xl border border-dashed border-slate-300 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                        <DollarSign className="w-3 h-3 text-slate-400" /> Tarifs non renseignés
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTarifsModalGarageId(garage.id);
                          setIsTarifsModalOpen(true);
                        }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="w-2.5 h-2.5 text-amber-700" />
                        <span>Donner mes prix</span>
                      </button>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    
                    {/* Primary Contact Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${garage.telephonePrincipal.replace(/\s+/g, '')}`}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Appeler</span>
                      </a>

                      <a
                        href={`https://wa.me/${garage.whatsapp}?text=${encodeURIComponent(`Bonjour ${garage.nom}, je vous contacte depuis AutoConcession Kinshasa pour une assistance.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setOpenTarifsEditorInitially(false);
                          setActiveDetailGarage(garage);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <span>Fiche Complète</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                      </button>

                      <button
                        onClick={() => handleOpenSOS(garage)}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>SOS Panne</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODALS */}
      <GarageDetailModal
        garage={activeDetailGarage}
        isOpen={!!activeDetailGarage}
        onClose={() => {
          setActiveDetailGarage(null);
          setOpenTarifsEditorInitially(false);
        }}
        onRequestBreakdown={(g) => handleOpenSOS(g)}
        onUpdateGarage={handleGarageUpdated}
        initialOpenTarifsEditor={openTarifsEditorInitially}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onOpenLogin={onOpenAuth}
      />

      <BreakdownRequestModal
        isOpen={isBreakdownModalOpen}
        onClose={() => {
          setIsBreakdownModalOpen(false);
          setTargetGarageForSOS(null);
        }}
        selectedGarage={targetGarageForSOS}
        availableGarages={garages}
        onSubmitRequest={handleProcessBreakdownSubmit}
      />

      <RegisterGarageModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterGarage={(newGarage) => {
          onAddGarage(newGarage);
          setIsRegisterModalOpen(false);
        }}
      />

      <GarageTarifsModal
        isOpen={isTarifsModalOpen}
        onClose={() => {
          setIsTarifsModalOpen(false);
          setTarifsModalGarageId(null);
        }}
        garages={garages}
        selectedGarageId={tarifsModalGarageId}
        onSaveTarifs={handleSaveTarifsDirectly}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onOpenLogin={onOpenAuth}
      />

    </div>
  );
};
