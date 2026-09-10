import React, { useState } from 'react';
import { Heart, Camera, RotateCw, Fuel, Zap, Car as CarIcon, CheckCircle2, Scale } from 'lucide-react';
import { Vehicle } from '../../types';
import { MOTORS_BRANDS } from './MotorsBrandIcons';

interface MotorsVehicleCardProps {
  vehicle: Vehicle;
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

  const formatPrice = (amountUSD: number) => {
    if (currency === 'FC') {
      return `${(amountUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
    }
    return `$${amountUSD.toLocaleString('en-US').replace(/,/g, ' ')}`;
  };

  // Find brand logo component if available
  const brandInfo = MOTORS_BRANDS.find(
    b => b.name.toLowerCase() === vehicle.marque.toLowerCase() ||
         vehicle.marque.toLowerCase().includes(b.name.toLowerCase())
  );
  const BrandLogoComponent = brandInfo?.Component;

  // Normalized specs
  const bodyLabel = vehicle.categorie || 'Sedan';
  const transLabel = vehicle.transmission || 'Automatic';
  const fuelLabel = vehicle.carburant === 'Essence' ? 'Gasoline' : vehicle.carburant;

  return (
    <div 
      onClick={() => onSelectVehicle(vehicle)}
      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-blue-500 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
    >
      {/* Photo Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/10] overflow-hidden bg-slate-100">
        <img 
          src={images[currentImgIndex]} 
          alt={`${vehicle.marque} ${vehicle.modele}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top-Left: SPECIAL / FEATURED Badge */}
        {isSpecial && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
            <span>🔥 SPECIAL</span>
          </div>
        )}

        {/* Top-Right: Action Buttons (Favorite & Compare) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
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

        {/* Bottom-Left: 360 / Multi-view icon */}
        <div className="absolute bottom-3 left-3 bg-black/55 backdrop-blur-md text-white p-1.5 rounded-lg flex items-center gap-1 text-[11px]">
          <RotateCw className="w-3.5 h-3.5" />
        </div>

        {/* Bottom-Right: Photo Count Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
          <span>{currentImgIndex + 1}/{photoCount}</span>
          <Camera className="w-3 h-3" />
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Title, Subtitle & Brand Emblem */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition leading-snug">
              {vehicle.marque} {vehicle.modele}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {vehicle.annee} {vehicle.motrice || 'FWD'} {vehicle.etat === 'neuf' ? 'New' : 'Used'}
            </p>
          </div>

          {/* Brand Emblem on Right */}
          {BrandLogoComponent && (
            <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0">
              <BrandLogoComponent className="w-full h-full" />
            </div>
          )}
        </div>

        {/* Pricing Block */}
        <div className="space-y-0.5">
          {originalPrice && originalPrice > buyPrice && (
            <p className="text-xs font-semibold text-slate-400 line-through">
              {formatPrice(originalPrice)}
            </p>
          )}
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatPrice(buyPrice)}
          </p>
        </div>

        {/* Specs Pills Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
          <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
            <CarIcon className="w-3 h-3 text-slate-400" />
            <span>{bodyLabel}</span>
          </span>

          <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
            <Zap className="w-3 h-3 text-slate-400" />
            <span>{transLabel}</span>
          </span>

          <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
            <Fuel className="w-3 h-3 text-slate-400" />
            <span>{fuelLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
