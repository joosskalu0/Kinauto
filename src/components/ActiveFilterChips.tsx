import React from 'react';
import { X, RotateCcw, Filter } from 'lucide-react';
import { DealershipAccount } from '../types';

interface ActiveFilterChipsProps {
  filterDealership: string;
  setFilterDealership: (val: string) => void;
  filterBrand: string;
  setFilterBrand: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterFuel: string;
  setFilterFuel: (val: string) => void;
  filterTransmission: string;
  setFilterTransmission: (val: string) => void;
  filterCondition: string;
  setFilterCondition: (val: string) => void;
  filterPromo: 'ALL' | 'PROMO';
  setFilterPromo: (val: 'ALL' | 'PROMO') => void;
  priceMax: number;
  setPriceMax: (val: number) => void;
  kmMax: number;
  setKmMax: (val: number) => void;
  onlyFavorites: boolean;
  setOnlyFavorites: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onResetAll: () => void;
  dealershipAccounts: DealershipAccount[];
  totalResults: number;
  currency: 'USD' | 'FC';
  usdToFcRate: number;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filterDealership,
  setFilterDealership,
  filterBrand,
  setFilterBrand,
  filterCategory,
  setFilterCategory,
  filterFuel,
  setFilterFuel,
  filterTransmission,
  setFilterTransmission,
  filterCondition,
  setFilterCondition,
  filterPromo,
  setFilterPromo,
  priceMax,
  setPriceMax,
  kmMax,
  setKmMax,
  onlyFavorites,
  setOnlyFavorites,
  searchQuery,
  setSearchQuery,
  onResetAll,
  dealershipAccounts,
  totalResults,
  currency,
  usdToFcRate,
}) => {
  const activeChips: { label: string; onRemove: () => void; color?: string }[] = [];

  if (searchQuery.trim()) {
    activeChips.push({
      label: `Recherche: "${searchQuery}"`,
      onRemove: () => setSearchQuery(''),
      color: 'bg-amber-50 text-amber-900 border-amber-200',
    });
  }

  if (filterDealership !== 'ALL') {
    const acc = dealershipAccounts.find((a) => a.id === filterDealership);
    activeChips.push({
      label: `Concession: ${acc ? acc.info.nom : filterDealership}`,
      onRemove: () => setFilterDealership('ALL'),
      color: 'bg-sky-50 text-sky-900 border-sky-200',
    });
  }

  if (filterPromo === 'PROMO') {
    activeChips.push({
      label: '🏷️ Promotions / Ventes Flash',
      onRemove: () => setFilterPromo('ALL'),
      color: 'bg-rose-50 text-rose-900 border-rose-200',
    });
  }

  if (filterBrand !== 'ALL') {
    activeChips.push({
      label: `Marque: ${filterBrand}`,
      onRemove: () => setFilterBrand('ALL'),
      color: 'bg-amber-50 text-amber-900 border-amber-200',
    });
  }

  if (filterCategory !== 'ALL') {
    activeChips.push({
      label: `Carrosserie: ${filterCategory}`,
      onRemove: () => setFilterCategory('ALL'),
    });
  }

  if (filterFuel !== 'ALL') {
    activeChips.push({
      label: `Carburant: ${filterFuel}`,
      onRemove: () => setFilterFuel('ALL'),
    });
  }

  if (filterTransmission !== 'ALL') {
    activeChips.push({
      label: `Boîte: ${filterTransmission}`,
      onRemove: () => setFilterTransmission('ALL'),
    });
  }

  if (filterCondition !== 'ALL') {
    activeChips.push({
      label: `État: ${filterCondition === 'neuf' ? 'Véhicules neufs' : 'Occasions'}`,
      onRemove: () => setFilterCondition('ALL'),
    });
  }

  if (priceMax < 350000) {
    const formattedPrice = currency === 'FC' 
      ? `${(priceMax * usdToFcRate).toLocaleString('fr-FR')} FC`
      : `${priceMax.toLocaleString('fr-FR')} $`;
    activeChips.push({
      label: `Prix max: ${formattedPrice}`,
      onRemove: () => setPriceMax(350000),
    });
  }

  if (kmMax < 250000) {
    activeChips.push({
      label: `Km max: ${kmMax.toLocaleString('fr-FR')} km`,
      onRemove: () => setKmMax(250000),
    });
  }

  if (onlyFavorites) {
    activeChips.push({
      label: '❤️ Favoris uniquement',
      onRemove: () => setOnlyFavorites(false),
      color: 'bg-rose-50 text-rose-900 border-rose-200',
    });
  }

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-slate-600 font-bold mr-1">
        <Filter className="w-3.5 h-3.5 text-amber-600" />
        <span>Filtres appliqués ({activeChips.length}) :</span>
      </div>

      {activeChips.map((chip, index) => (
        <span
          key={index}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
            chip.color || 'bg-slate-100 text-slate-800 border-slate-200'
          } shadow-xs transition hover:scale-105`}
        >
          <span>{chip.label}</span>
          <button
            onClick={chip.onRemove}
            className="hover:text-slate-950 p-0.5 rounded hover:bg-slate-200/60 cursor-pointer"
            title="Retirer ce filtre"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onResetAll}
        className="ml-auto text-amber-800 hover:text-amber-900 font-bold text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Tout réinitialiser</span>
      </button>
    </div>
  );
};
