import React, { useState } from 'react';
import { 
  X, Calendar, Gauge, Fuel, Zap, Shield, FileText, Printer, 
  Share2, Heart, CheckCircle2, Car, Sparkles, MapPin, Phone, 
  MessageSquare, ChevronRight, Calculator, Scale, Clock, DollarSign,
  RefreshCw, Award, Send, Check, Eye, Copy, Mail, Globe, ExternalLink,
  Home, ArrowLeft, ChevronLeft, User, HelpCircle, Star
} from 'lucide-react';
import { Vehicle, DealershipInfo, Lead } from '../../types';
import { FinanceCalculator } from '../FinanceCalculator';
import { MakeOfferModal } from '../MakeOfferModal';
import { TradeInModal } from '../TradeInModal';
import { MOTORS_BRANDS } from './MotorsBrandIcons';

interface MotorsDetailModalProps {
  vehicle: Vehicle;
  allVehicles?: Vehicle[];
  onClose: () => void;
  onRequestTestDrive: (vehicle: Vehicle) => void;
  dealership: DealershipInfo;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  onSubmitLead?: (lead: Omit<Lead, 'id' | 'dateDemande' | 'statut'>) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  currency?: 'USD' | 'FC';
  usdToFcRate?: number;
}

const FALLBACK_CAR_IMAGE = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200";

export const MotorsDetailModal: React.FC<MotorsDetailModalProps> = ({
  vehicle,
  allVehicles = [],
  onClose,
  onRequestTestDrive,
  dealership,
  isFavorite,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
  onSubmitLead,
  onSelectVehicle,
  currency = 'USD',
  usdToFcRate = 2850,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLoanCalculator, setShowLoanCalculator] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [showTradeInModal, setShowTradeInModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Message to dealer form state
  const [dealerMsgName, setDealerMsgName] = useState('');
  const [dealerMsgPhone, setDealerMsgPhone] = useState('');
  const [dealerMsgEmail, setDealerMsgEmail] = useState('');
  const [dealerMsgText, setDealerMsgText] = useState(`Bonjour, je suis très intéressé(e) par votre ${vehicle.marque} ${vehicle.modele} ${vehicle.annee}. Est-il toujours disponible ?`);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [msgSentSuccess, setMsgSentSuccess] = useState(false);

  const imagesList = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [FALLBACK_CAR_IMAGE];

  const buyPrice = vehicle.prix;
  const msrpPrice = vehicle.msrp || vehicle.ancienPrix || Math.round(vehicle.prix * 1.08);
  const instantSavings = vehicle.remiseInstantanee || (msrpPrice > buyPrice ? msrpPrice - buyPrice : 3000);

  const formatPrice = (amountUSD: number) => {
    if (currency === 'FC') {
      return `${(amountUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
    }
    return `$${amountUSD.toLocaleString('en-US').replace(/,/g, ' ')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${vehicle.marque} ${vehicle.modele}`,
        text: `Découvrez cette ${vehicle.marque} ${vehicle.modele} sur AutoConcession Kinshasa`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert("Veuillez accepter les conditions d'utilisation.");
      return;
    }
    if (onSubmitLead) {
      onSubmitLead({
        vehicleId: vehicle.id,
        vehicleTitle: `${vehicle.marque} ${vehicle.modele}`,
        vehiclePrice: vehicle.prix,
        nomClient: dealerMsgName,
        email: dealerMsgEmail || 'contact@autoconcession.cd',
        telephone: dealerMsgPhone,
        typeDemande: 'information',
        message: dealerMsgText,
      });
    }
    setMsgSentSuccess(true);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  // Grouped car features
  const comfortList = [
    'A/C: Front', 'A/C: Rear', 'Climate Control', 'Cruise Control', 
    'Keyless Entry', 'Power Locks', 'Power Steering'
  ];
  const entertainmentList = [
    'MP3 Interface', 'Bluetooth Hands-free', 'Premium Sound System', 
    'Apple CarPlay & Android Auto', 'Software Auto-Update'
  ];
  const safetyList = [
    'Airbag conducteur', 'Airbag passager', 'Airbags latéraux', 
    'Anti-lock Brakes (ABS)', 'Compound Brakes', 'Security System & Alarm'
  ];
  const seatsList = [
    'Bucket Seats', 'Heated Seats', 'Leather Interior', 
    'Power Seats', 'Memory Seats'
  ];

  // Similar vehicles
  const similarVehicles = allVehicles
    .filter((v) => v.id !== vehicle.id && (v.marque === vehicle.marque || v.categorie === vehicle.categorie))
    .slice(0, 3);

  const brandInfo = MOTORS_BRANDS.find(
    (b) => b.name.toLowerCase() === vehicle.marque.toLowerCase() ||
           vehicle.marque.toLowerCase().includes(b.name.toLowerCase())
  );
  const BrandLogoComponent = brandInfo?.Component;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-slate-900 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col font-sans border border-slate-200">
        
        {/* Top Header Bar matching video */}
        <div className="bg-white px-4 sm:px-8 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            {BrandLogoComponent && (
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shrink-0 shadow-2xs">
                <BrandLogoComponent className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Publié le : {vehicle.dateAjout ? new Date(vehicle.dateAjout).toLocaleDateString('fr-FR', { month: 'long', day: '2-digit', year: 'numeric' }) : 'Récent'}</span>
                {brandInfo?.country && (
                  <span className="hidden sm:inline bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {brandInfo.country}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                {vehicle.marque} {vehicle.modele} <span className="font-normal text-slate-500 text-lg">{vehicle.annee}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50/50">
          
          {/* 1. Signature MOTORS Blue Pricing Banner matching video */}
          <div className="bg-blue-600 text-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
            <div className="p-5 sm:p-7 flex flex-wrap items-center justify-between gap-4">
              {/* Buy Price */}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-blue-200">PRIX D'ACHAT</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-5xl font-black tracking-tight">{formatPrice(buyPrice)}</span>
                </div>
                <p className="text-xs text-blue-100 font-medium mt-0.5">Taxes et contrôle technique inclus</p>
              </div>

              {/* MSRP */}
              <div className="text-right sm:text-left">
                <p className="text-xs font-extrabold uppercase tracking-widest text-blue-200">PRIX CONSTRUCTEUR</p>
                <span className="text-2xl sm:text-3xl font-bold line-through text-blue-200/90">{formatPrice(msrpPrice)}</span>
              </div>
            </div>

            {/* Instant Savings bottom strip */}
            <div className="bg-blue-700/90 px-5 sm:px-7 py-3 flex items-center justify-between border-t border-blue-500/40 text-xs sm:text-sm font-black uppercase tracking-wider">
              <span>ÉCONOMIE IMMÉDIATE :</span>
              <span className="text-amber-300 text-base sm:text-lg">-{formatPrice(instantSavings)}</span>
            </div>
          </div>

          {/* Main 2-Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN (2 Cols): Photos, Action Buttons, Features, Specs, Notes */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Photo Display Carousel */}
              <div className="bg-white p-3 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="relative aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100">
                  <img 
                    src={imagesList[activeImageIndex]} 
                    alt={vehicle.modele}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {/* Previous / Next Image Controls */}
                  {imagesList.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Row with arrows */}
                {imagesList.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {imagesList.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                          activeImageIndex === idx ? 'border-blue-600 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 6 Quick Action Pill Buttons matching video */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
                <button
                  onClick={() => onRequestTestDrive(vehicle)}
                  className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 p-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Réserver un essai</span>
                </button>

                <button
                  onClick={() => setShowLoanCalculator(!showLoanCalculator)}
                  className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 p-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span>Simulateur de crédit</span>
                </button>

                <button
                  onClick={() => onToggleCompare(vehicle.id)}
                  className={`border p-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                    isCompared 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-600'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{isCompared ? 'Comparé ✓' : 'Comparer'}</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(vehicle.id)}
                  className={`border p-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                    isFavorite 
                      ? 'bg-rose-500 text-white border-rose-500' 
                      : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'Favori ♥' : 'Ajouter aux favoris'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 p-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>{copiedLink ? 'Lien copié !' : 'Partager'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 p-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Imprimer</span>
                </button>
              </div>

              {/* Simulateur de crédit popup block */}
              {showLoanCalculator && (
                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-lg">
                  <FinanceCalculator vehiclePrice={vehicle.prix} />
                </div>
              )}

              {/* Trust Badges: AutoCheck & Carfax & MPG */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Contrôle Certifié</span>
                  </div>
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                    <span>HISTORIQUE VÉRIFIÉ</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <div className="bg-slate-100 px-3 py-1.5 rounded-lg">Urbain : 11 L/100km</div>
                  <Fuel className="w-4 h-4 text-slate-400" />
                  <div className="bg-slate-100 px-3 py-1.5 rounded-lg">Route : 7.5 L/100km</div>
                </div>
              </div>

              {/* VEHICLE DETAILS Table matching video */}
              <div className="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  CARACTÉRISTIQUES DU VÉHICULE
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Marque :</span>
                    <span className="font-bold text-slate-900">{vehicle.marque}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Modèle :</span>
                    <span className="font-bold text-slate-900">{vehicle.modele}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Carrosserie :</span>
                    <span className="font-bold text-slate-900">{vehicle.categorie}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">État :</span>
                    <span className="font-bold text-slate-900 capitalize">{vehicle.etat}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Année :</span>
                    <span className="font-bold text-slate-900">{vehicle.annee}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Boîte de vitesses :</span>
                    <span className="font-bold text-slate-900">{vehicle.transmission}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Carburant :</span>
                    <span className="font-bold text-slate-900">{vehicle.carburant}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Kilométrage :</span>
                    <span className="font-bold text-slate-900">{vehicle.kilometrage.toLocaleString('fr-FR')} km</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Moteur :</span>
                    <span className="font-bold text-slate-900">{vehicle.moteur || 'V6 3.5L'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Motricité :</span>
                    <span className="font-bold text-slate-900">{vehicle.motrice || '4x4 / Intégrale'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Couleur :</span>
                    <span className="font-bold text-slate-900">{vehicle.couleur || 'Gris métallisé'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Châssis (VIN) :</span>
                    <span className="font-mono font-bold text-xs text-slate-800">{vehicle.vin || 'ML32F3FJ8KHF15816'}</span>
                  </div>
                </div>
              </div>

              {/* CAR FEATURES Checklists matching video */}
              <div className="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  ÉQUIPEMENTS & OPTIONS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                  {/* Confort */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider text-blue-600">Confort</h4>
                    <ul className="space-y-1.5">
                      {comfortList.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Multimédia */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider text-blue-600">Multimédia</h4>
                    <ul className="space-y-1.5">
                      {entertainmentList.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sécurité */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider text-blue-600">Sécurité</h4>
                    <ul className="space-y-1.5">
                      {safetyList.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sièges & Intérieur */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider text-blue-600">Sièges & Intérieur</h4>
                    <ul className="space-y-1.5">
                      {seatsList.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SELLER'S NOTES */}
              <div className="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  DESCRIPTION DU VENDEUR
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  {vehicle.description || `Véhicule en parfait état, entretenu avec rigueur. Historique vérifié sans aucun sinistre. Livré avec garantie, révision complète effectuée et ensemble des documents officiels en règle.`}
                </p>
              </div>

              {/* Location Map Box */}
              <div className="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  LOCALISATION & SHOWROOM
                </h3>
                <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">{dealership.nom}</p>
                      <p className="text-xs text-slate-500">{dealership.adresse}</p>
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-blue-200">
                    Showroom Ouvert
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (1 Col): Profil Vendeur, WhatsApp, Message Form, Offers */}
            <div className="space-y-6">
              
              {/* Profil Vendeur Card matching video */}
              <div className="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                    alt="Vendeur"
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-600"
                  />
                  <div>
                    <h4 className="font-black text-base text-slate-900">{(dealership as any).contactNom || 'Conseiller Commercial'}</h4>
                    <p className="text-xs text-slate-500 font-medium">Vendeur Agréé / {dealership.nom}</p>
                  </div>
                </div>

                {/* WhatsApp Chat Button */}
                <a
                  href={`https://wa.me/${(dealership as any).whatsapp || dealership.telephone?.replace(/[^0-9]/g, '') || '243820000000'}?text=Bonjour, je suis intéressé par votre ${vehicle.marque} ${vehicle.modele}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>DISCUTER SUR WHATSAPP</span>
                </a>

                {/* Show Phone Number Button */}
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>{showPhone ? dealership.telephone : '+243 ••• ••• Afficher le numéro'}</span>
                </button>
              </div>

              {/* Offer & Trade-in Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowMakeOfferModal(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Faire une offre de prix</span>
                </button>

                <button
                  onClick={() => setShowTradeInModal(true)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Demande de reprise</span>
                </button>
              </div>

              {/* MESSAGE TO DEALER Form matching video */}
              <div className="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  CONTACTER LA CONCESSION
                </h3>

                {msgSentSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Votre message a bien été envoyé au vendeur !</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
                    <div>
                      <textarea
                        rows={3}
                        required
                        value={dealerMsgText}
                        onChange={(e) => setDealerMsgText(e.target.value)}
                        placeholder="Votre message ou question sur ce véhicule..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                      ></textarea>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Votre nom complet *"
                        required
                        value={dealerMsgName}
                        onChange={(e) => setDealerMsgName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Numéro de téléphone / WhatsApp *"
                        required
                        value={dealerMsgPhone}
                        onChange={(e) => setDealerMsgPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <label className="flex items-start gap-2 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-0 mt-0.5"
                      />
                      <span>J'accepte les conditions d'utilisation et la politique de confidentialité.</span>
                    </label>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      Envoyer le message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals for Offer & Trade-in */}
      {showMakeOfferModal && (
        <MakeOfferModal
          vehicle={vehicle}
          onClose={() => setShowMakeOfferModal(false)}
          onSubmitLead={(lead) => {
            if (onSubmitLead) onSubmitLead(lead);
            setShowMakeOfferModal(false);
          }}
        />
      )}

      {showTradeInModal && (
        <TradeInModal
          targetVehicle={vehicle}
          onClose={() => setShowTradeInModal(false)}
          onSubmitLead={(lead) => {
            if (onSubmitLead) onSubmitLead(lead);
            setShowTradeInModal(false);
          }}
        />
      )}
    </div>
  );
};
