import React from 'react';
import { Scale, X, Check, ArrowRight, Trash2, Home } from 'lucide-react';
import { Vehicle } from '../types';

interface CompareModalProps {
  vehicles: Vehicle[];
  onClose: () => void;
  onRemoveVehicle: (id: string) => void;
  onRequestTestDrive: (vehicle: Vehicle) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  vehicles,
  onClose,
  onRemoveVehicle,
  onRequestTestDrive
}) => {
  if (vehicles.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md w-full p-6 rounded-2xl text-center space-y-4 shadow-2xl">
          <Scale className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Comparateur de Véhicules</h3>
          <p className="text-sm text-slate-400">
            Vous n'avez sélectionné aucun véhicule. Cliquez sur l'icône de balance sur les fiches véhicules pour ajouter jusqu'à 3 modèles.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>Retour à l'Accueil</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-sm transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Comparateur Côte à Côte</h2>
              <p className="text-xs text-slate-400">{vehicles.length} véhicule(s) en comparaison (max 3)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Retourner à l'accueil"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Fermer le comparateur"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Fermer</span>
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-3 text-xs font-bold text-slate-400 uppercase w-1/4">Spécifications</th>
                {vehicles.map((v) => (
                  <th key={v.id} className="p-3 text-center align-top relative w-1/4">
                    <button
                      onClick={() => onRemoveVehicle(v.id)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition"
                      title="Retirer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <img
                      src={v.images[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600'}
                      alt={v.modele}
                      className="w-full h-28 object-cover rounded-xl mb-2 border border-slate-800"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    <p className="text-xs text-amber-400 font-bold uppercase">{v.marque}</p>
                    <p className="font-extrabold text-sm text-white">{v.modele}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{v.finition}</p>
                    <p className="text-lg font-black text-amber-400 mt-2">{v.prix.toLocaleString('fr-FR')} €</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              <tr>
                <td className="p-3 font-semibold text-slate-400">Année</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-white">{v.annee}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Kilométrage</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-white">{v.kilometrage.toLocaleString('fr-FR')} km</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Carburant</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-emerald-400">{v.carburant}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Boîte de vitesses</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-white">{v.transmission}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Puissance DIN</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-white">{v.puissanceCh} ch</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Garantie</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-white">{v.garantieMois} Mois</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Émissions CO2</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-center font-bold text-white">{v.co2Gkm} g/km</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Action Essai</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-center">
                    <button
                      onClick={() => {
                        onClose();
                        onRequestTestDrive(v);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-2 rounded-xl text-xs transition cursor-pointer w-full"
                    >
                      Essai
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Navigation Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Retour à l'Accueil</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Fermer le comparateur</span>
          </button>
        </div>
      </div>
    </div>
  );
};
