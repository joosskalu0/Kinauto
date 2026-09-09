import React, { useState, useEffect, useRef } from 'react';
import { Search, Car, Wrench, Building2, X, ArrowRight, Sparkles, MapPin, Tag, Phone } from 'lucide-react';
import { Vehicle, GarageProfile, DealershipAccount } from '../types';

interface InteractiveSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  vehicles: Vehicle[];
  garages: GarageProfile[];
  dealershipAccounts: DealershipAccount[];
  onSelectVehicle: (v: Vehicle) => void;
  onSelectGarage: (g: GarageProfile) => void;
  onSelectDealership: (accId: string) => void;
  currency: 'USD' | 'FC';
  usdToFcRate: number;
}

export const InteractiveSearchBar: React.FC<InteractiveSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  vehicles,
  garages,
  dealershipAccounts,
  onSelectVehicle,
  onSelectGarage,
  onSelectDealership,
  currency,
  usdToFcRate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  // Matched vehicles
  const matchedVehicles = React.useMemo(() => {
    if (!query) return [];
    return vehicles
      .filter((v) => {
        return (
          v.marque.toLowerCase().includes(query) ||
          v.modele.toLowerCase().includes(query) ||
          v.categorie.toLowerCase().includes(query) ||
          v.carburant.toLowerCase().includes(query) ||
          v.annee.toString().includes(query) ||
          (v.finition && v.finition.toLowerCase().includes(query))
        );
      })
      .slice(0, 4);
  }, [vehicles, query]);

  // Matched garages
  const matchedGarages = React.useMemo(() => {
    if (!query) return [];
    return garages
      .filter((g) => {
        if (g.estMasque) return false;
        return (
          g.nom.toLowerCase().includes(query) ||
          g.commune.toLowerCase().includes(query) ||
          g.responsable.toLowerCase().includes(query) ||
          g.marquesExpertise.some((m) => m.toLowerCase().includes(query))
        );
      })
      .slice(0, 3);
  }, [garages, query]);

  // Matched dealerships
  const matchedDealerships = React.useMemo(() => {
    if (!query) return [];
    return dealershipAccounts
      .filter((d) => {
        if (d.estMasque) return false;
        return (
          d.info.nom.toLowerCase().includes(query) ||
          d.info.ville.toLowerCase().includes(query) ||
          (d.info.adresse && d.info.adresse.toLowerCase().includes(query))
        );
      })
      .slice(0, 2);
  }, [dealershipAccounts, query]);

  const totalMatches = matchedVehicles.length + matchedGarages.length + matchedDealerships.length;

  const formatPrice = (priceUSD: number) => {
    if (currency === 'FC') {
      return `${(priceUSD * usdToFcRate).toLocaleString('fr-FR')} FC`;
    }
    return `${priceUSD.toLocaleString('fr-FR')} $`;
  };

  const quickTags = ['Toyota', 'SUV', 'Mercedes-Benz', 'Automatique', 'Gombe', 'SOS 24/7', 'Promotions'];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Recherche instantanée : Marque, modèle, garage Kinshasa, concession..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-slate-200 focus:border-amber-500 text-slate-900 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder-slate-400 transition shadow-xs"
        />

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 p-0.5 rounded cursor-pointer"
            title="Effacer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Instant Search Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[500px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Quick Filter Tags Suggestions */}
          {!query && (
            <div className="p-4 space-y-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Recherches populaires & Catégories :</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setIsOpen(false);
                    }}
                    className="bg-white hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-200 hover:border-amber-500 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* If search query entered and matches found */}
          {query && totalMatches > 0 && (
            <div className="divide-y divide-slate-100 text-xs">
              
              {/* Vehicles Matches */}
              {matchedVehicles.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-2 px-1">
                    <Car className="w-3.5 h-3.5 text-amber-600" />
                    <span>Véhicules ({matchedVehicles.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedVehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          onSelectVehicle(v);
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-150 hover:border-amber-300 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={v.images[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200'}
                            alt={v.modele}
                            className="w-12 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-amber-800 transition">
                              {v.marque} {v.modele} <span className="text-[10px] text-slate-500 font-normal">({v.annee})</span>
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span>{v.transmission}</span>
                              <span>•</span>
                              <span>{v.carburant}</span>
                              <span>•</span>
                              <span>{v.kilometrage.toLocaleString('fr-FR')} km</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-950 text-xs">{formatPrice(v.prix)}</p>
                          {v.enPromo && (
                            <span className="text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              Promo
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Garages & Breakdown Matches */}
              {matchedGarages.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5 mb-2 px-1">
                    <Wrench className="w-3.5 h-3.5 text-rose-600" />
                    <span>Garages & Dépannage Kinshasa ({matchedGarages.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedGarages.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          onSelectGarage(g);
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-rose-50/60 border border-slate-150 hover:border-rose-300 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-rose-700 transition">
                              {g.nom}
                            </p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-600" />
                              <span>{g.commune}</span>
                              <span>•</span>
                              <span>{g.responsable}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {g.estDepannageMobile24h && (
                            <span className="text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full">
                              SOS 24/7
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dealership Matches */}
              {matchedDealerships.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1.5 mb-2 px-1">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Concessions Partenaires ({matchedDealerships.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedDealerships.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          onSelectDealership(d.id);
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-sky-50/60 border border-slate-150 hover:border-sky-300 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-sky-700 transition">
                              {d.info.nom}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              📍 {d.info.ville} • {vehicles.filter((v) => v.dealershipId === d.id).length} véhicules
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No matches */}
          {query && totalMatches === 0 && (
            <div className="p-6 text-center text-slate-600 space-y-2">
              <p className="font-bold text-slate-900">Aucun résultat trouvé pour "{searchQuery}"</p>
              <p className="text-[11px] text-slate-500">Essayez avec un nom de marque (Toyota, Mercedes), une commune (Gombe, Limete) ou un type de carrosserie.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-amber-700 hover:underline cursor-pointer"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}

          {/* Bottom Bar */}
          {query && (
            <div className="bg-slate-50 p-2.5 px-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <span>{totalMatches} résultat(s) direct(s)</span>
              <button
                onClick={() => setIsOpen(false)}
                className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Afficher tout dans le catalogue</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
