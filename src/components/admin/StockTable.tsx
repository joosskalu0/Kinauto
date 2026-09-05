import React, { useState } from 'react';
import { 
  Database, Search, Filter, PlusCircle, Eye, Edit3, Copy, Trash2, 
  CheckCircle2, AlertCircle, RefreshCw, Star, Tag, Home, ArrowLeft, X
} from 'lucide-react';
import { Vehicle, VehicleStatus } from '../../types';

const FALLBACK_CAR_IMAGE = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400";

interface StockTableProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDuplicateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onUpdateStatus: (id: string, status: VehicleStatus) => void;
  onToggleVedette: (id: string) => void;
  onOpenAddModal: () => void;
  onNavigateHome?: () => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  vehicles,
  onSelectVehicle,
  onEditVehicle,
  onDuplicateVehicle,
  onDeleteVehicle,
  onUpdateStatus,
  onToggleVedette,
  onOpenAddModal,
  onNavigateHome
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.finition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = selectedBrand === 'ALL' || v.marque === selectedBrand;
    const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;

    return matchesSearch && matchesBrand && matchesStatus;
  });

  const brands = Array.from(new Set(vehicles.map((v) => v.marque)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Actions */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow cursor-pointer mr-1"
                title="Quitter la gestion du stock et revenir à l'accueil"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Accueil / Vitrine</span>
              </button>
            )}
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">Gestion de Stock Concession</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gérez votre parc automobile, modifiez le statut des annonces et ajustez les prix en direct.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Fermer la gestion du stock et revenir au catalogue public"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Fermer la page</span>
            </button>
          )}
          <button
            onClick={onOpenAddModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Ajouter un Véhicule
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par Marque, Modèle, Finition ou VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Marque:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Toutes les marques ({vehicles.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Statut:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="disponible">En Stock / Disponible</option>
            <option value="reserve">Réservé</option>
            <option value="vendu">Vendu</option>
          </select>
        </div>
      </div>

      {/* Stock Inventory Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs font-bold uppercase border-b border-slate-800">
                <th className="p-4">Véhicule</th>
                <th className="p-4">Spécifications</th>
                <th className="p-4">Prix TTC</th>
                <th className="p-4">Statut Stock</th>
                <th className="p-4">Mise en Vedette</th>
                <th className="p-4 text-right">Actions Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Aucun véhicule ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/50 transition">
                    {/* Vehicle Title & Thumb */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.images[0] || FALLBACK_CAR_IMAGE}
                          alt={v.modele}
                          className="w-16 h-12 object-cover rounded-lg border border-slate-800 shrink-0"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (target.src !== FALLBACK_CAR_IMAGE) {
                              target.src = FALLBACK_CAR_IMAGE;
                            }
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white text-sm">{v.marque} {v.modele}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              v.etat === 'neuf' ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {v.etat}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{v.finition}</p>
                          <p className="text-[10px] text-slate-500 font-mono">VIN: {v.vin}</p>
                        </div>
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="p-4">
                      <p className="font-bold text-white">{v.annee} • {v.kilometrage.toLocaleString('fr-FR')} km</p>
                      <p className="text-slate-400">{v.carburant} ({v.transmission}) • {v.puissanceCh} ch</p>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-amber-400 text-sm">
                      {v.prix.toLocaleString('fr-FR')} €
                    </td>

                    {/* Status Inline Dropdown */}
                    <td className="p-4">
                      <select
                        value={v.status}
                        onChange={(e) => onUpdateStatus(v.id, e.target.value as VehicleStatus)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                          v.status === 'disponible'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : v.status === 'reserve'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        <option value="disponible" className="bg-slate-900 text-emerald-400">🟢 En Stock / Disponible</option>
                        <option value="reserve" className="bg-slate-900 text-amber-400">🟠 Réservé</option>
                        <option value="vendu" className="bg-slate-900 text-rose-400">🔴 Vendu</option>
                      </select>
                    </td>

                    {/* Vedette Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => onToggleVedette(v.id)}
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition ${
                          v.enVedette
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${v.enVedette ? 'fill-current' : ''}`} />
                        <span>{v.enVedette ? 'Vedette' : 'Standard'}</span>
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectVehicle(v)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                          title="Aperçu public"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditVehicle(v)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                          title="Modifier l'annonce"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDuplicateVehicle(v)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                          title="Dupliquer l'annonce"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer définitivement la fiche de ${v.marque} ${v.modele} ?`)) {
                              onDeleteVehicle(v.id);
                            }
                          }}
                          className="p-2 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                          title="Supprimer du stock"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
