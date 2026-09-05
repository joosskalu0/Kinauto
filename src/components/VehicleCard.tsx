import React, { useState } from 'react';
import { 
  Calendar, Gauge, Fuel, Zap, Eye, Scale, Heart, Shield, CheckCircle2, 
  AlertCircle, Building2, Tag, Share2, Sparkles, ChevronRight, Check
} from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  dealershipName?: string;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onRequestTestDrive: (vehicle: Vehicle) => void;
  isCompared: boolean;
  onToggleCompare: (vehicleId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (vehicleId: string) => void;
  onShareVehicle?: (vehicle: Vehicle) => void;
  isAdmin?: boolean;
  onEditVehicle?: (vehicle: Vehicle) => void;
  currency?: 'USD' | 'FC';
  usdToFcRate?: number;
  layoutMode?: 'grid' | 'list';
}

const FALLBACK_CAR_IMAGE = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800";

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  dealershipName,
  onSelectVehicle,
  onRequestTestDrive,
  isCompared,
  onToggleCompare,
  isFavorite,
  onToggleFavorite,
  onShareVehicle,
  isAdmin,
  onEditVehicle,
  currency = 'USD',
  usdToFcRate = 2850,
  layoutMode = 'grid',
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const buyPrice = vehicle.prix;
  const isPromo = Boolean(vehicle.enPromo) || 
                  Boolean(vehicle.remiseInstantanee && vehicle.remiseInstantanee > 0) || 
                  Boolean(vehicle.ancienPrix && vehicle.ancienPrix > vehicle.prix) || 
                  Boolean(vehicle.msrp && vehicle.msrp > vehicle.prix);

  const discountAmount = vehicle.remiseInstantanee || 
    (vehicle.ancienPrix && vehicle.ancienPrix > vehicle.prix ? vehicle.ancienPrix - vehicle.prix : 0) || 
    (vehicle.msrp && vehicle.msrp > vehicle.prix ? vehicle.msrp - vehicle.prix : 0);

  const originalPrice = discountAmount > 0 
    ? vehicle.prix + discountAmount 
    : (vehicle.ancienPrix || vehicle.msrp || Math.round(vehicle.prix * 1.08));

  const msrpPrice = originalPrice;
  const monthlyEstimate = Math.round((vehicle.prix * 0.8) / 48);

  const formatPrice = (valUSD: number) => {
    if (currency === 'FC') {
      return `${(valUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
    }
    return `${valUSD.toLocaleString('fr-FR')} $`;
  };

  const getStatusBadge = () => {
    switch (vehicle.status) {
      case 'disponible':
        return (
          <span className="bg-emerald-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-3 h-3" /> En Stock
          </span>
        );
      case 'reserve':
        return (
          <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <AlertCircle className="w-3 h-3" /> Réservé
          </span>
        );
      case 'vendu':
        return (
          <span className="bg-rose-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            Vendu
          </span>
        );
    }
  };

  const imagesList = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [FALLBACK_CAR_IMAGE];
  const currentImg = imagesList[activeImageIndex] || FALLBACK_CAR_IMAGE;

  // HORIZONTAL / LIST VIEW MODE
  if (layoutMode === 'list') {
    return (
      <div 
        id={`vehicle-card-list-${vehicle.id}`}
        className="bg-white rounded-3xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row group text-slate-900"
      >
        {/* Left Image Section */}
        <div className="relative md:w-80 aspect-[16/10] md:aspect-auto bg-slate-100 overflow-hidden cursor-pointer shrink-0" onClick={() => onSelectVehicle(vehicle)}>
          <img
            src={currentImg}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_CAR_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20"></div>

          {/* Badges Top */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {getStatusBadge()}
            {isPromo && (
              <span className="bg-rose-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg animate-pulse">
                <Tag className="w-3 h-3 fill-current" /> Promo
              </span>
            )}
          </div>

          {/* Dot previews */}
          {imagesList.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
              {imagesList.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition cursor-pointer ${
                    activeImageIndex === idx ? 'bg-amber-400 w-4' : 'bg-white/60 hover:bg-white'
                  }`}
                  title={`Photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Info Section */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wider">{vehicle.marque}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-600 font-semibold">{vehicle.categorie}</span>
                  {dealershipName && (
                    <span className="bg-amber-50 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 ml-1">
                      <Building2 className="w-3 h-3 text-amber-600" /> {dealershipName}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 hover:text-amber-700 transition cursor-pointer" onClick={() => onSelectVehicle(vehicle)}>
                  {vehicle.modele} <span className="text-slate-500 font-medium text-sm">{vehicle.finition}</span>
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                {onShareVehicle && (
                  <button
                    onClick={() => onShareVehicle(vehicle)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer shadow-xs"
                    title="Partager"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onToggleFavorite(vehicle.id)}
                  className={`p-2 rounded-xl border transition cursor-pointer shadow-xs ${
                    isFavorite 
                      ? 'bg-rose-50 text-rose-600 border-rose-200' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
                </button>
                <button
                  onClick={() => onToggleCompare(vehicle.id)}
                  className={`p-2 rounded-xl border transition cursor-pointer shadow-xs ${
                    isCompared 
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title="Comparer"
                >
                  <Scale className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Specs Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">Année</p>
                  <p className="font-bold text-slate-900">{vehicle.annee}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">Kilométrage</p>
                  <p className="font-bold text-slate-900">{vehicle.kilometrage.toLocaleString('fr-FR')} km</p>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
                <Fuel className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">Carburant</p>
                  <p className="font-bold text-slate-900">{vehicle.carburant}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">Boîte / Puissance</p>
                  <p className="font-bold text-slate-900">{vehicle.boite} ({vehicle.puissanceCh}ch)</p>
                </div>
              </div>
            </div>

            {/* Key Equipments */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {vehicle.equipements.slice(0, 4).map((eq, i) => (
                <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                  ✓ {eq}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prix Comptant</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-950">{formatPrice(vehicle.prix)}</p>
                {discountAmount > 0 && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    {formatPrice(vehicle.prix + discountAmount)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-700 font-bold">Financement dès {formatPrice(monthlyEstimate)} / mois*</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectVehicle(vehicle)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4 text-sky-600" />
                <span>Fiche Complète</span>
              </button>

              {vehicle.status === 'disponible' && (
                <button
                  onClick={() => onRequestTestDrive(vehicle)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
                >
                  Réserver un Essai
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD GRID VIEW MODE
  return (
    <div 
      id={`vehicle-card-${vehicle.id}`}
      className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1 text-slate-900"
    >
      {/* Top Image Section with Interactive Dots */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelectVehicle(vehicle)}>
        <img
          src={currentImg}
          alt={`${vehicle.marque} ${vehicle.modele}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_CAR_IMAGE;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-black/30"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-col gap-1.5 items-start">
            {getStatusBadge()}
            {isPromo && (
              <span className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-rose-400/50 animate-pulse">
                <Tag className="w-3 h-3 fill-current" />
                <span>Vente Flash</span>
                {discountAmount > 0 && (
                  <span className="bg-slate-950/80 text-amber-300 font-black px-1.5 py-0.2 rounded-full text-[9px]">
                    -{formatPrice(discountAmount)}
                  </span>
                )}
              </span>
            )}
            {vehicle.enVedette && !isPromo && (
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                🔥 Coup de Coeur
              </span>
            )}
            <span className="bg-slate-950/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
              {vehicle.etat === 'neuf' ? 'Neuf 0 km' : 'Occasion Certifiée'}
            </span>
            {dealershipName && (
              <span className="bg-slate-950/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-amber-400/30 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-400" /> {dealershipName}
              </span>
            )}
          </div>

          {/* Action Buttons: Favorite, Compare & Share */}
          <div className="flex items-center gap-1.5">
            {onShareVehicle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShareVehicle(vehicle);
                }}
                className="p-2 rounded-xl backdrop-blur-md bg-white/80 hover:bg-amber-500 text-slate-800 hover:text-slate-950 transition cursor-pointer shadow-xs"
                title="Partager sur les réseaux sociaux"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(vehicle.id);
              }}
              className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer shadow-xs ${
                isFavorite 
                  ? 'bg-rose-500 text-white shadow-lg' 
                  : 'bg-white/80 hover:bg-white text-slate-800'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(vehicle.id);
              }}
              className={`p-2 rounded-xl backdrop-blur-md text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs ${
                isCompared 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg' 
                  : 'bg-white/80 hover:bg-white text-slate-800'
              }`}
              title="Comparer ce véhicule"
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail Preview Dots */}
        {imagesList.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
            {imagesList.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition cursor-pointer ${
                  activeImageIndex === idx ? 'bg-amber-400 w-3.5' : 'bg-white/60 hover:bg-white'
                }`}
                title={`Photo ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Image Overlay: Title & Primary Price */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest">{vehicle.marque}</p>
            <h3 className="text-base font-black leading-tight text-white drop-shadow-sm">
              {vehicle.modele} <span className="font-normal text-slate-200 text-xs">{vehicle.finition}</span>
            </h3>
          </div>

          <div className="bg-slate-950/90 text-white px-2.5 py-1 rounded-xl text-right backdrop-blur-md border border-amber-500/40 shadow-lg">
            <span className="text-xs font-black text-amber-400 block leading-tight">
              {formatPrice(buyPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content & Specifications */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-150 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-semibold">Année</p>
              <p className="font-bold text-slate-900">{vehicle.annee}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-150 flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-semibold">Kilométrage</p>
              <p className="font-bold text-slate-900">{vehicle.kilometrage.toLocaleString('fr-FR')} km</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-150 flex items-center gap-2">
            <Fuel className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-semibold">Carburant</p>
              <p className="font-bold text-slate-900">{vehicle.carburant}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-150 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-semibold">Boîte</p>
              <p className="font-bold text-slate-900">{vehicle.boite}</p>
            </div>
          </div>
        </div>

        {/* Highlight Equipments Tags */}
        <div className="flex flex-wrap gap-1">
          {vehicle.equipements.slice(0, 3).map((eq, index) => (
            <span key={index} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-lg border border-slate-200">
              ✓ {eq}
            </span>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prix Concession</p>
              {isPromo && (
                <span className="bg-rose-50 text-rose-700 font-black text-[9px] px-1.5 py-0.2 rounded border border-rose-200">
                  PROMO
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-black text-slate-950 tracking-tight">
                {formatPrice(vehicle.prix)}
              </p>
              {discountAmount > 0 && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  {formatPrice(vehicle.prix + discountAmount)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500">Financement dès</p>
            <p className="text-xs font-bold text-emerald-700">{formatPrice(monthlyEstimate)}/mois*</p>
          </div>
        </div>

        {/* Footer Card Actions */}
        <div className="pt-1 flex items-center gap-2">
          <button
            id={`btn-view-${vehicle.id}`}
            onClick={() => onSelectVehicle(vehicle)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>Fiche Détail</span>
          </button>

          {vehicle.status === 'disponible' && (
            <button
              id={`btn-essai-${vehicle.id}`}
              onClick={() => onRequestTestDrive(vehicle)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl transition cursor-pointer shadow-xs active:scale-95"
            >
              Essai
            </button>
          )}

          {isAdmin && onEditVehicle && (
            <button
              onClick={() => onEditVehicle(vehicle)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs p-2.5 rounded-xl border border-slate-200 transition cursor-pointer shadow-xs"
              title="Éditer la fiche véhicule"
            >
              ✏️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
