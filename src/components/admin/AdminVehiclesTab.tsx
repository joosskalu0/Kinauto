import React, { useState, useEffect } from 'react';
import { 
  Car, Search, CheckCircle, XCircle, Trash2, Eye, AlertTriangle,
  Clock, Check, Building2, MapPin, DollarSign, RefreshCw, X, ShieldAlert
} from 'lucide-react';

interface VehicleItem {
  id: number;
  dealership_id?: number;
  dealership_nom?: string;
  dealership_ville?: string;
  dealership_telephone?: string;
  marque: string;
  modele: string;
  finition?: string;
  annee: number;
  prix: number;
  kilometrage: number;
  carburant: string;
  transmission: string;
  status: string;
  validation_status?: string;
  rejection_reason?: string;
  primary_image?: string;
  images_count?: number;
  created_at: string;
}

export const AdminVehiclesTab: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Rejection modal
  const [rejectingVehicle, setRejectingVehicle] = useState<VehicleItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Detail preview modal
  const [previewVehicle, setPreviewVehicle] = useState<VehicleItem | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/admin/vehicles', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (statusFilter !== 'all') {
        url.searchParams.set('validation_status', statusFilter);
      }
      url.searchParams.set('limit', '100');

      const res = await fetch(url.toString(), { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.vehicles) {
        setVehicles(data.vehicles);
      } else {
        setError(data.message || 'Erreur lors du chargement des véhicules');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleApprove = async (vehicle: VehicleItem) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}/approve`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setVehicles(vehicles.map(v => v.id === vehicle.id ? { ...v, status: 'approved', validation_status: 'approved', rejection_reason: undefined } : v));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingVehicle) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${rejectingVehicle.id}/reject`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reason: rejectionReason.trim() || 'Photos non conformes ou prix incohérent' })
      });
      const data = await res.json();
      if (data.success) {
        setVehicles(vehicles.map(v => v.id === rejectingVehicle.id ? { 
          ...v, 
          status: 'rejected', 
          validation_status: 'rejected', 
          rejection_reason: rejectionReason.trim() || 'Non conforme'
        } : v));
        setRejectingVehicle(null);
        setRejectionReason('');
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer définitivement ce véhicule et ses photos ?')) return;
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setVehicles(vehicles.filter(v => v.id !== id));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Control bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par marque, modèle, concession, carburant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Modération :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="all">Toutes les annonces</option>
              <option value="pending">⏳ En attente de validation</option>
              <option value="approved">✅ Validées / En ligne</option>
              <option value="rejected">❌ Rejetées</option>
            </select>
          </div>

          <button
            onClick={fetchVehicles}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Table of Vehicles */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                <th className="p-4">Véhicule & Année</th>
                <th className="p-4">Concessionnaire / Vendeur</th>
                <th className="p-4">Prix & Kilométrage</th>
                <th className="p-4">Statut Modération</th>
                <th className="p-4 text-right">Actions Modérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                    Chargement des véhicules...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Aucun véhicule correspondant aux filtres.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => {
                  const isApproved = ['approved', 'disponible'].includes(String(v.validation_status || v.status).toLowerCase());
                  const isPending = ['pending', 'en_attente'].includes(String(v.validation_status || v.status).toLowerCase());
                  const isRejected = ['rejected', 'rejete'].includes(String(v.validation_status || v.status).toLowerCase());

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.primary_image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80'}
                            alt={`${v.marque} ${v.modele}`}
                            className="w-14 h-11 object-cover rounded-lg border border-slate-800 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-white text-sm">
                              {v.marque} {v.modele} <span className="text-slate-400 text-xs font-normal">({v.annee})</span>
                            </p>
                            <p className="text-[11px] text-slate-400">{v.carburant} • {v.transmission}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{v.dealership_nom || 'Vendeur Pro'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {v.dealership_ville || 'Kinshasa'}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-black text-emerald-400 text-sm">${v.prix?.toLocaleString('fr-FR')}</p>
                        <p className="text-[11px] text-slate-400">{v.kilometrage?.toLocaleString('fr-FR')} km</p>
                      </td>

                      <td className="p-4">
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit animate-pulse">
                            <Clock className="w-3 h-3" /> En attente de validation
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Validée / En Ligne
                          </span>
                        )}
                        {isRejected && (
                          <div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> Rejetée
                            </span>
                            {v.rejection_reason && (
                              <p className="text-[10px] text-rose-400 mt-1 truncate max-w-[180px]" title={v.rejection_reason}>
                                Motif : {v.rejection_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewVehicle(v)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                            title="Aperçu de la fiche annonce"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Approve button */}
                          <button
                            onClick={() => handleApprove(v)}
                            disabled={isApproved || actionLoading}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isApproved
                                ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/40'
                            }`}
                            title="Valider l'annonce pour affichage public"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          {/* Reject button */}
                          <button
                            onClick={() => {
                              setRejectingVehicle(v);
                              setRejectionReason('');
                            }}
                            disabled={isRejected || actionLoading}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isRejected
                                ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/40'
                            }`}
                            title="Rejeter l'annonce avec motif"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Motif de Rejet */}
      {rejectingVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setRejectingVehicle(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-extrabold text-lg flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              Rejeter l'annonce de véhicule
            </h3>

            <p className="text-xs text-slate-400">
              Véhicule ciblé : <strong className="text-white">{rejectingVehicle.marque} {rejectingVehicle.modele} ({rejectingVehicle.annee})</strong>
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Motif officiel de refus (transmis au vendeur) :
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex : Photos floues, prix manifestement erroné, numéro de châssis ou documents manquants..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingVehicle(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-black px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {actionLoading ? 'Traitement...' : 'Confirmer le Rejet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aperçu Fiche Véhicule */}
      {previewVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setPreviewVehicle(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 bg-slate-950/60 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={previewVehicle.primary_image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'}
              alt={previewVehicle.modele}
              className="w-full h-56 object-cover"
            />

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-white">
                    {previewVehicle.marque} {previewVehicle.modele}
                  </h3>
                  <p className="text-slate-400">{previewVehicle.finition || 'Standard'} • Année {previewVehicle.annee}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-emerald-400">${previewVehicle.prix?.toLocaleString('fr-FR')}</p>
                  <p className="text-slate-500">{previewVehicle.kilometrage?.toLocaleString('fr-FR')} km</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Concession</span>
                  <span className="text-white font-bold">{previewVehicle.dealership_nom || 'Particulier'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Ville</span>
                  <span className="text-white font-bold">{previewVehicle.dealership_ville || 'Kinshasa'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Carburant</span>
                  <span className="text-white font-bold">{previewVehicle.carburant}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Boîte</span>
                  <span className="text-white font-bold">{previewVehicle.transmission}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewVehicle(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
