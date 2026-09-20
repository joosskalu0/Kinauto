import React, { useState } from 'react';
import { 
  Heart, Camera, RotateCw, Fuel, Zap, Car as CarIcon, CheckCircle2, 
  Scale, ChevronLeft, ChevronRight, Gauge, Calendar, MapPin, 
  MessageCircle, Phone, ArrowUpRight
} from 'lucide-react';
import { Vehicle } from '../../types';
import { MOTORS_BRANDS } from './MotorsBrandIcons';

interface MotorsVehicleCardProps {
  vehicle: Vehicle;
  dealershipName?: string;
  onSelectVehicle: (vehicle: Vehicle) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onRequestTestDrive?: (vehicle: Vehicle) => void;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
  onShareVehicle?: (vehicle: Vehicle) => void;
  isAdmin?: boolean;
  onEditVehicle?: (vehicle: Vehicle) => void;
  currency?: 'USD' | 'FC';
  usdToFcRate?: number;
}

const FALLBACK_CAR_IMAGE = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800";

export const MotorsVehicleCard: React.FC<MotorsVehicleCardProps> = ({
  vehicle,
  dealershipName,
  onSelectVehicle,
  isFavorite,
  onToggleFavorite,
  onRequestTestDrive,
  isCompared = false,
  onToggleCompare,
  onShareVehicle,
  isAdmin,
  onEditVehicle,
  currency = 'USD',
  usdToFcRate = 2850,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [FALLBACK_CAR_IMAGE];
  const photoCount = images.length;

  const buyPrice = vehicle.prix;
  const isSpecial = Boolean(vehicle.enPromo) || Boolean(vehicle.enVedette) || Boolean(vehicle.remiseInstantanee);
  const originalPrice = vehicle.ancienPrix || vehicle.msrp || (isSpecial ? Math.round(buyPrice * 1.08) : null);

  const formatMainPrice = (amountUSD: number) => {
    if (currency === 'FC') {
      return `${(amountUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
    }
    return `$${amountUSD.toLocaleString('en-US').replace(/,/g, ' ')}`;
  };

  const formatSecondaryPrice = (amountUSD: number) => {
    if (currency === 'FC') {
      return `~$${amountUSD.toLocaleString('en-US').replace(/,/g, ' ')}`;
    }
    return `~${(amountUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : photoCount - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev < photoCount - 1 ? prev + 1 : 0));
  };

  // WhatsApp quick contact
  const handleWhatsAppContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = '243890000000';
    const text = encodeURIComponent(
      `Bonjour, je suis intéressé par le véhicule : ${vehicle.marque} ${vehicle.modele} (${vehicle.annee}) affiché à ${buyPrice.toLocaleString('fr-FR')} $ (Réf: ${vehicle.id}) sur AutoConcession Kinshasa.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Direct phone call
  const handlePhoneCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:+243890000000`;
  };

  // Find brand logo component if available
  const brandInfo = MOTORS_BRANDS.find(
    b => b.name.toLowerCase() === vehicle.marque.toLowerCase() ||
         vehicle.marque.toLowerCase().includes(b.name.toLowerCase())
  );
  const BrandLogoComponent = brandInfo?.Component;

  // Normalized specs
  const bodyLabel = vehicle.categorie || 'Berline';
  const transLabel = vehicle.transmission || 'Automatique';
  const fuelLabel = vehicle.carburant || 'Essence';
  const displayLocation = vehicle.localisation || 'Kinshasa, Gombe';

  return (
    <div 
      onClick={() => onSelectVehicle(vehicle)}
      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-blue-500 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
    >
      {/* Photo Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/10] overflow-hidden bg-slate-900 select-none">
        <img 
          src={images[currentImgIndex]} 
          alt={`${vehicle.marque} ${vehicle.modele}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Carousel Prev/Next Arrows */}
        {photoCount > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Photo précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs transition opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer shadow-md z-10"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Photo suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs transition opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer shadow-md z-10"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Top-Left: SPECIAL / FEATURED & Monetization Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          {(vehicle.listingTier === 'featured' || vehicle.enVedette || vehicle.is_featured || vehicle.isFeatured) && (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider border border-white/20">
              <span>🚀 À LA UNE</span>
            </div>
          )}
          {Boolean(vehicle.enPromo) && !(vehicle.listingTier === 'featured' || vehicle.enVedette || vehicle.is_featured || vehicle.isFeatured) && (
            <div className="bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
              <span>PROMO</span>
            </div>
          )}
          {vehicle.listingTier === 'premium' && (
            <div className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
              <span>⭐ PREMIUM</span>
            </div>
          )}
          {vehicle.visibilityBadge === 'urgent' && (
            <div className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              🚨 URGENT
            </div>
          )}
          {vehicle.visibilityBadge === 'certifie' && (
            <div className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              🛡️ CERTIFIÉ
            </div>
          )}
        </div>

        {/* Top-Right: Action Buttons (Favorite & Compare) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(vehicle.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition shadow-xs cursor-pointer ${
                isCompared 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/85 hover:bg-white text-slate-700'
              }`}
              title={isCompared ? "Retirer du comparateur" : "Comparer ce véhicule"}
            >
              <Scale className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(vehicle.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition shadow-xs cursor-pointer ${
              isFavorite 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/85 hover:bg-white text-slate-700'
            }`}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom-Left: 360 / Multi-view or Condition */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] font-bold">
          <span>{vehicle.etat === 'neuf' ? '✨ Neuf' : '🏁 Occasion'}</span>
        </div>

        {/* Bottom-Right: Photo Count Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
          <span>{currentImgIndex + 1}/{photoCount}</span>
          <Camera className="w-3 h-3" />
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        {/* Title, Subtitle & Brand Emblem */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition leading-snug truncate">
              {vehicle.marque} {vehicle.modele}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{dealershipName || displayLocation}</span>
              </span>
            </div>
          </div>

          {/* Brand Emblem on Right */}
          {BrandLogoComponent && (
            <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
              <BrandLogoComponent className="w-full h-full" />
            </div>
          )}
        </div>

        {/* Specs Grid: Year, Mileage, Transmission, Fuel */}
        <div className="grid grid-cols-2 gap-1.5 py-2 border-y border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Année {vehicle.annee}</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <Gauge className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{vehicle.kilometrage.toLocaleString('fr-FR')} km</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{transLabel}</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <Fuel className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{fuelLabel}</span>
          </div>
        </div>

        {/* Pricing Block with Dual Currency */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            {originalPrice && originalPrice > buyPrice && (
              <p className="text-xs font-bold text-slate-400 line-through">
                {formatMainPrice(originalPrice)}
              </p>
            )}
            <p className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {formatMainPrice(buyPrice)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">
              {formatSecondaryPrice(buyPrice)}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/70 inline-block">
              Prix Négociable
            </span>
          </div>
        </div>

        {/* Quick Action Touch Buttons (Mobile & Desktop) */}
        <div className="pt-2 grid grid-cols-3 gap-2">
          {/* WhatsApp Direct */}
          <button
            onClick={handleWhatsAppContact}
            title="Contacter par WhatsApp"
            className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
            <span>WhatsApp</span>
          </button>

          {/* Direct Phone Call */}
          <button
            onClick={handlePhoneCall}
            title="Appeler le concessionnaire"
            className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>Appel</span>
          </button>

          {/* Details / Test Drive */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectVehicle(vehicle);
            }}
            className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 shadow-xs"
          >
            <span>Détails</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

