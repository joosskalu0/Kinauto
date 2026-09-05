import React, { useState } from 'react';
import { 
  X, Calendar, Gauge, Fuel, Zap, Shield, FileText, Printer, 
  Share2, Heart, CheckCircle2, Car, Sparkles, MapPin, Phone, 
  MessageSquare, ChevronRight, Calculator, Scale, Clock, DollarSign,
  RefreshCw, Award, Send, Check, Eye, Copy, Mail, Globe, ExternalLink,
  Home, ArrowLeft, QrCode, Smartphone
} from 'lucide-react';
import { Vehicle, DealershipInfo, Lead } from '../types';
import { FinanceCalculator } from './FinanceCalculator';
import { MakeOfferModal } from './MakeOfferModal';
import { TradeInModal } from './TradeInModal';
import { trackSocialShare } from '../lib/analytics';

const FALLBACK_CAR_IMAGE = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200";

interface VehicleDetailModalProps {
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

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
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
  const [showShareBox, setShowShareBox] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [showTradeInModal, setShowTradeInModal] = useState(false);

  // Message to dealer form state
  const [dealerMsgName, setDealerMsgName] = useState('');
  const [dealerMsgEmail, setDealerMsgEmail] = useState('');
  const [dealerMsgPhone, setDealerMsgPhone] = useState('');
  const [dealerMsgText, setDealerMsgText] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [msgSentSuccess, setMsgSentSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `${vehicle.marque} ${vehicle.modele} ${vehicle.finition || ''} (${vehicle.annee})`;
  const shareText = `A vendre chez ${dealership.nom} : ${vehicle.marque} ${vehicle.modele} - ${vehicle.prix.toLocaleString('fr-FR')} €`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: currentUrl,
      }).catch(() => {});
    } else {
      setShowShareBox(!showShareBox);
    }
  };

  const handleSendDealerMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Veuillez accepter les conditions d\'utilisation.');
      return;
    }
    if (onSubmitLead) {
      onSubmitLead({
        vehicleId: vehicle.id,
        vehicleTitle: `${vehicle.marque} ${vehicle.modele}`,
        vehiclePrice: vehicle.prix,
        nomClient: dealerMsgName,
        email: dealerMsgEmail,
        telephone: dealerMsgPhone,
        typeDemande: 'information',
        message: dealerMsgText
      });
    }
    setMsgSentSuccess(true);
  };

  // Compute pricing boxes
  const buyPrice = vehicle.prix;
  const msrpPrice = vehicle.msrp || Math.round(vehicle.prix * 1.08);
  const instantSavings = vehicle.remiseInstantanee || (msrpPrice > buyPrice ? msrpPrice - buyPrice : 4000);

  const formatPrice = (amountUSD: number) => {
    if (currency === 'FC') {
      return `${(amountUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
    }
    return `${amountUSD.toLocaleString('fr-FR')} $`;
  };

  const dualPriceSubtitle = (amountUSD: number) => {
    if (currency === 'FC') {
      return `≈ ${amountUSD.toLocaleString('fr-FR')} $ USD`;
    }
    return `≈ ${(amountUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
  };

  // Similar vehicles filter
  const similarVehicles = allVehicles
    .filter((v) => v.id !== vehicle.id && (v.marque === vehicle.marque || v.categorie === vehicle.categorie))
    .slice(0, 3);

  // Features list split into categories
  const comfortFeatures = vehicle.equipements.filter((_, i) => i % 3 === 0);
  const safetyFeatures = vehicle.equipements.filter((_, i) => i % 3 === 1);
  const entertainmentFeatures = vehicle.equipements.filter((_, i) => i % 3 === 2);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col font-sans">
        
        {/* Top Header Motors Theme Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="text-amber-400 font-extrabold uppercase">{vehicle.marque}</span>
              <span>•</span>
              <span className="text-slate-300 font-medium uppercase">{vehicle.categorie}</span>
              <span>•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" /> AJOUTÉ LE : {vehicle.dateAjout ? new Date(vehicle.dateAjout).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' }) : '2026-02-26'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mt-0.5">
              {vehicle.marque} {vehicle.modele} <span className="text-slate-300 font-normal text-base sm:text-lg">{vehicle.finition}</span>
            </h2>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Fermer la fiche et revenir directement à l'accueil"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Fermer cette fenêtre"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Fermer</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          
          {/* Signature Motors Blue Pricing Banner Box */}
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-2xl p-5 shadow-xl text-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Buy Price */}
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-200">ACHAT DIRECT COMPTANT</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">{formatPrice(buyPrice)}</span>
                  <span className="text-xs text-amber-300 font-bold bg-slate-950/40 px-2 py-0.5 rounded-full border border-sky-400/30">
                    {dualPriceSubtitle(buyPrice)}
                  </span>
                </div>
              </div>

              {/* MSRP Price */}
              <div className="text-right sm:text-left">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-200">PRIX CONSTRUCTEUR (MSRP)</p>
                <span className="text-2xl sm:text-3xl font-bold line-through text-sky-200/80">{formatPrice(msrpPrice)}</span>
              </div>
            </div>

            {/* Instant Savings Bar */}
            <div className="bg-sky-950/60 backdrop-blur-md rounded-xl py-2 px-4 flex items-center justify-between border border-sky-400/30 text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider">
              <span>REMISE INSTANTANÉE EXCLUSIVE :</span>
              <span className="text-amber-400 font-black text-base">-{formatPrice(instantSavings)}</span>
            </div>
          </div>

          {/* 6 Quick Action Pill Buttons Grid (Motors style) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-bold">
            <button
              onClick={() => onRequestTestDrive(vehicle)}
              className="bg-slate-950 hover:bg-slate-800 border border-sky-500/40 hover:border-sky-400 text-sky-300 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Réserver Essai</span>
            </button>

            <button
              onClick={() => setShowLoanCalculator(!showLoanCalculator)}
              className="bg-slate-950 hover:bg-slate-800 border border-sky-500/40 hover:border-sky-400 text-sky-300 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-sky-400" />
              <span>Calcul Crédit</span>
            </button>

            <button
              onClick={() => onToggleCompare(vehicle.id)}
              className={`border p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isCompared 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                  : 'bg-slate-950 hover:bg-slate-800 border-sky-500/40 text-sky-300'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{isCompared ? 'Comparé ✓' : 'Comparer'}</span>
            </button>

            <button
              onClick={() => onToggleFavorite(vehicle.id)}
              className={`border p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                  : 'bg-slate-950 hover:bg-slate-800 border-sky-500/40 text-sky-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
              <span>{isFavorite ? 'En Favoris' : 'Favoris'}</span>
            </button>

            <button
              onClick={() => setShowShareBox(!showShareBox)}
              className={`p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                showShareBox 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg' 
                  : 'bg-slate-950 hover:bg-slate-800 border border-sky-500/40 text-sky-300'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Partager</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-950 hover:bg-slate-800 border border-sky-500/40 hover:border-sky-400 text-sky-300 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Imprimer</span>
            </button>
          </div>

          {/* Conditional Social Share Box Dropdown */}
          {showShareBox && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-white text-sm">Partager cette annonce sur vos réseaux sociaux</h3>
                </div>
                <button 
                  onClick={() => setShowShareBox(false)} 
                  className="text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  ✕ Fermer
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Augmentez la visibilité de votre annonce ! Partagez instantanément la fiche <strong className="text-white">{vehicle.marque} {vehicle.modele}</strong> :
              </p>

              {/* Social Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🚗 ${vehicle.marque} ${vehicle.modele} (${vehicle.annee}) - ${vehicle.prix.toLocaleString('fr-FR')} € disponible chez ${dealership.nom} !\n\n🔗 Consulter la fiche : ` + currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocialShare('whatsapp', 'vehicle', { id: vehicle.id, name: `${vehicle.marque} ${vehicle.modele}`, dealershipName: dealership.nom, price: vehicle.prix })}
                  className="bg-[#25D366] hover:bg-[#1eae52] text-slate-950 font-black p-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-md"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.81 9.81 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.18 8.18 0 0 1-5.82 2.42c-1.48 0-2.93-.39-4.2-1.13l-.3-.18-3.12.82.83-3.04-.2-.31c-.81-1.3-1.24-2.8-1.24-4.34 0-4.54 3.7-8.24 8.24-8.24m4.52 10.97c-.25-.12-1.47-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.66.83-.81 1-.15.17-.3.19-.55.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.43 1.03 2.6.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocialShare('facebook', 'vehicle', { id: vehicle.id, name: `${vehicle.marque} ${vehicle.modele}`, dealershipName: dealership.nom, price: vehicle.prix })}
                  className="bg-[#1877F2] hover:bg-[#125ecc] text-white font-extrabold p-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-md"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocialShare('linkedin', 'vehicle', { id: vehicle.id, name: `${vehicle.marque} ${vehicle.modele}`, dealershipName: dealership.nom, price: vehicle.prix })}
                  className="bg-[#0A66C2] hover:bg-[#084e96] text-white font-extrabold p-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-md"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.6 1.6 0 0 0-1.6 1.6c0 .88.72 1.6 1.6 1.6a1.6 1.6 0 0 0 1.6-1.6c0-.88-.72-1.6-1.6-1.6Z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>

                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}&hashtags=Auto,Voiture,${vehicle.marque}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocialShare('twitter_x', 'vehicle', { id: vehicle.id, name: `${vehicle.marque} ${vehicle.modele}`, dealershipName: dealership.nom, price: vehicle.prix })}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold p-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-md border border-slate-700"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter / X</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocialShare('telegram', 'vehicle', { id: vehicle.id, name: `${vehicle.marque} ${vehicle.modele}`, dealershipName: dealership.nom, price: vehicle.prix })}
                  className="bg-[#24A1DE] hover:bg-[#1f8ec4] text-white font-extrabold p-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-md"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .39z"/>
                  </svg>
                  <span>Telegram</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\nConsulter la fiche : ' + currentUrl)}`}
                  onClick={() => trackSocialShare('email', 'vehicle', { id: vehicle.id, name: `${vehicle.marque} ${vehicle.modele}`, dealershipName: dealership.nom, price: vehicle.prix })}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold p-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs shadow-md"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>Email</span>
                </a>
              </div>

              {/* Direct Link Row & Native Share */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-transparent text-xs text-slate-300 px-2 outline-none select-all truncate font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Lien copié !' : 'Copier Lien'}</span>
                  </button>
                </div>

                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>QR Code</span>
                </a>
              </div>
            </div>
          )}

          {/* Conditional Loan Calculator Dropdown */}
          {showLoanCalculator && (
            <div id="finance-calculator-dropdown" className="bg-slate-950 p-2 sm:p-4 rounded-2xl border border-sky-500/30">
              <FinanceCalculator
                vehiclePrice={vehicle.prix}
                onApplyFinancing={() => {
                  setShowLoanCalculator(false);
                  onRequestTestDrive(vehicle);
                }}
              />
            </div>
          )}

          {/* Gallery Main Container */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] bg-black rounded-2xl overflow-hidden border border-slate-800 group shadow-xl">
              <img
                src={vehicle.images[activeImageIndex] || vehicle.images[0] || FALLBACK_CAR_IMAGE}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                className="w-full h-full object-cover transition duration-300"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== FALLBACK_CAR_IMAGE) {
                    target.src = FALLBACK_CAR_IMAGE;
                  }
                }}
              />
              {vehicle.enVedette && (
                <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg uppercase tracking-wider">
                  🔥 Offre Spéciale
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {vehicle.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {vehicle.images.map((img, idx) => {
                  const isLast = idx === 3 && vehicle.images.length > 4;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        activeImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={img || FALLBACK_CAR_IMAGE} 
                        alt="thumbnail" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== FALLBACK_CAR_IMAGE) {
                            target.src = FALLBACK_CAR_IMAGE;
                          }
                        }}
                      />
                      {isLast && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-white">
                          +{vehicle.images.length - 3} Plus
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* VEHICLE DETAILS SECTION (Technical Specifications Grid) */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-amber-400" /> Caractéristiques Du Véhicule (Vehicle Details)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">🏎️ Marque (Make)</span>
                <span className="text-white font-bold">{vehicle.marque}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">🚙 Modèle (Model)</span>
                <span className="text-white font-bold">{vehicle.modele}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">🏎️ Carrosserie (Body)</span>
                <span className="text-white font-bold">{vehicle.categorie}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">🏷️ État (Condition)</span>
                <span className="text-amber-400 font-bold uppercase">{vehicle.etat === 'neuf' ? 'Neuf' : 'Occasion'}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">📅 Année (Year)</span>
                <span className="text-white font-bold">{vehicle.annee}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">⚙️ Boîte (Transmission)</span>
                <span className="text-white font-bold">{vehicle.transmission}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">⛽ Carburant (Fuel Type)</span>
                <span className="text-white font-bold">{vehicle.carburant}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">📉 Kilométrage (Mileage)</span>
                <span className="text-white font-bold">{vehicle.kilometrage.toLocaleString('fr-FR')} km</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">⚡ Motorisation (Engine)</span>
                <span className="text-white font-bold">{vehicle.moteur || `${vehicle.puissanceCh} ch (${vehicle.puissanceFiscale} CV)`}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">🎨 Couleur Extérieure</span>
                <span className="text-white font-bold">{vehicle.couleur}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">💺 Couleur Intérieure</span>
                <span className="text-white font-bold">{vehicle.couleurInterieure || 'Cuir Noir Premium'}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">🏎️ Motricité (Drive)</span>
                <span className="text-white font-bold">{vehicle.motrice || 'AWD (4 roues motrices)'}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">📄 Historique (History)</span>
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Carfax Vérifié
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">🔑 N° VIN</span>
                <span className="text-slate-300 font-mono font-bold">{vehicle.vin}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 py-1.5">
                <span className="text-slate-400 font-medium">🛡️ Garantie Concession</span>
                <span className="text-amber-400 font-bold">{vehicle.garantieMois} Mois</span>
              </div>
            </div>
          </div>

          {/* CAR FEATURES SECTION (Categorized Checkboxes) */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Équipements Du Véhicule (Car Features)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Comfort */}
              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Confort & Intérieur</h4>
                <div className="space-y-1.5">
                  {comfortFeatures.map((eq, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{eq}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Climatisation Automatique A/C Multi-zones</span>
                  </div>
                </div>
              </div>

              {/* Safety */}
              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Sécurité & Assistance</h4>
                <div className="space-y-1.5">
                  {safetyFeatures.map((eq, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{eq}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Alarme & Anti-démarrage électronique</span>
                  </div>
                </div>
              </div>

              {/* Entertainment */}
              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Multimédia & Sièges</h4>
                <div className="space-y-1.5">
                  {entertainmentFeatures.map((eq, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{eq}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Sièges Baquets Réglage Électrique</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FINANCE CALCULATOR SECTION */}
          <div id="finance-calculator-section">
            <FinanceCalculator
              vehiclePrice={vehicle.prix}
              onApplyFinancing={() => {
                onRequestTestDrive(vehicle);
              }}
            />
          </div>

          {/* SELLER'S NOTES */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Note Du Vendeur (Seller's Notes)</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {vehicle.description}
            </p>
          </div>

          {/* LOCATION & MAP SECTION */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" /> Emplacement Du Véhicule (Location)
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{dealership.ville}, {dealership.adresse}</span>
            </div>

            {/* Visual map representation */}
            <div className="relative aspect-[21/9] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center text-slate-400">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 filter contrast-125 grayscale"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200)' }}
              ></div>
              <div className="relative bg-slate-950/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700 text-center space-y-1">
                <MapPin className="w-6 h-6 text-amber-400 mx-auto animate-bounce" />
                <p className="font-extrabold text-white text-xs">{dealership.nom}</p>
                <p className="text-[11px] text-slate-300">{dealership.adresse}, {dealership.codePostal} {dealership.ville}</p>
              </div>
            </div>
          </div>

          {/* DEALER CONTACT CARD BOX (Motors theme style) */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{dealership.nom}</h3>
                  <p className="text-xs text-slate-400">{dealership.slogan}</p>
                </div>
              </div>

              {/* Badges CARFAX / AutoCheck */}
              <div className="flex items-center gap-2">
                <span className="bg-blue-900/80 text-blue-200 border border-blue-600 text-[10px] font-black px-3 py-1.5 rounded-lg tracking-wider uppercase">
                  SHOW ME THE CARFAX
                </span>
                <span className="bg-emerald-900/80 text-emerald-200 border border-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-lg tracking-wider uppercase">
                  ✓ AUTOCHECK PASSED
                </span>
              </div>
            </div>

            {/* Direct Contact Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${dealership.telephone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>CHAT VIA WHATSAPP</span>
              </a>

              {/* Show Phone Number Button */}
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Phone className="w-4 h-4 text-sky-400" />
                <span>{showPhone ? dealership.telephone : `${dealership.telephone.slice(0, 4)}******* Afficher Numéro`}</span>
              </button>
            </div>

            {/* Offer & Trade In Form Special Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <button
                onClick={() => setShowMakeOfferModal(true)}
                className="bg-sky-950 hover:bg-sky-900 border border-sky-500/50 text-sky-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Proposer une offre de prix</span>
              </button>

              <button
                onClick={() => setShowTradeInModal(true)}
                className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Demande de reprise (Trade in)</span>
              </button>
            </div>
          </div>

          {/* MESSAGE TO DEALER FORM (Direct In-Page Form from video) */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              MESSAGE AU CONCESSIONNAIRE (Message to Dealer)
            </h3>

            {msgSentSuccess ? (
              <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-xl text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-sm">Message transmis au concessionnaire !</p>
                <p className="text-xs text-slate-300">Un conseiller commercial prendra contact avec vous rapidement.</p>
              </div>
            ) : (
              <form onSubmit={handleSendDealerMsg} className="space-y-3 text-xs">
                <div>
                  <textarea
                    rows={3}
                    value={dealerMsgText}
                    onChange={(e) => setDealerMsgText(e.target.value)}
                    placeholder="Saisissez votre message..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={dealerMsgName}
                    onChange={(e) => setDealerMsgName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Votre email"
                    value={dealerMsgEmail}
                    onChange={(e) => setDealerMsgEmail(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Votre téléphone"
                    value={dealerMsgPhone}
                    onChange={(e) => setDealerMsgPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                    required
                  />
                  <label htmlFor="terms-check" className="text-slate-400">
                    J'accepte les <span className="text-amber-400 underline">Conditions d'Utilisation</span> de la concession.
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-6 py-3 rounded-xl transition text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </button>
              </form>
            )}
          </div>

          {/* SIMILAR LISTINGS SECTION */}
          {similarVehicles.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Annonces Similaires (Similar Listings)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similarVehicles.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => onSelectVehicle && onSelectVehicle(sim)}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500 transition cursor-pointer group"
                  >
                    <div className="relative aspect-[16/10] bg-black">
                      <img src={sim.images[0]} alt={sim.modele} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute bottom-2 left-2 bg-slate-950/90 text-amber-400 font-extrabold text-xs px-2.5 py-1 rounded">
                        {sim.prix.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{sim.marque}</p>
                      <p className="font-extrabold text-xs text-white truncate">{sim.modele} {sim.finition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Sticky Navigation Bar */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Retour à l'Accueil (Catalogue)</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Fermer la fiche</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRequestTestDrive(vehicle)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Demander un Essai</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showMakeOfferModal && (
        <MakeOfferModal
          vehicle={vehicle}
          onClose={() => setShowMakeOfferModal(false)}
          onSubmitLead={onSubmitLead || (() => {})}
        />
      )}

      {showTradeInModal && (
        <TradeInModal
          targetVehicle={vehicle}
          onClose={() => setShowTradeInModal(false)}
          onSubmitLead={onSubmitLead || (() => {})}
        />
      )}
    </div>
  );
};
