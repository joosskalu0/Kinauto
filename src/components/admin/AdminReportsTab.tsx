import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Search, CheckCircle, XCircle, Trash2, 
  ShieldAlert, RefreshCw, Clock, ExternalLink, MessageSquare, AlertCircle
} from 'lucide-react';

interface ReportItem {
  id: number;
  reporter_id?: number;
  reporter_nom?: string;
  reporter_email?: string;
  target_type: string;
  target_id: number;
  target_title?: string;
  reason: string;
  description?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
}

export const AdminReportsTab: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/reports', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString(), { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch (err: any) {
      console.error('Erreur chargement signalements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNote.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus, admin_notes: adminNote.trim() } : r));
        setSelectedReport(null);
        setAdminNote('');
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!window.confirm('Supprimer ce signalement ?')) return;
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReports(reports.filter(r => r.id !== id));
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const filteredReports = reports.filter(r => 
    (r.target_title && r.target_title.toLowerCase().includes(search.toLowerCase())) ||
    (r.reason && r.reason.toLowerCase().includes(search.toLowerCase())) ||
    (r.reporter_nom && r.reporter_nom.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filters bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par annonce signalée, motif, plaignant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les signalements</option>
              <option value="en_attente">⏳ En cours d'examen</option>
              <option value="resolu">✅ Résolus / Modérés</option>
              <option value="rejete">❌ Non fondés / Rejetés</option>
            </select>
          </div>

          <button
            onClick={fetchReports}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                <th className="p-4">Cible du Signalement</th>
                <th className="p-4">Motif & Explication</th>
                <th className="p-4">Plaignant</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                    Chargement des signalements...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Aucun signalement en attente.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => {
                  const isPending = r.status === 'en_attente';
                  const isResolved = r.status === 'resolu';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                            {r.target_type}
                          </span>
                          <span>{r.target_title || `ID #${r.target_id}`}</span>
                        </div>
                      </td>

                      <td className="p-4 max-w-sm">
                        <p className="font-extrabold text-amber-400 text-xs">{r.reason}</p>
                        {r.description && (
                          <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{r.description}</p>
                        )}
                        {r.admin_notes && (
                          <p className="text-[10px] text-emerald-400 mt-1 italic">Note modérateur: {r.admin_notes}</p>
                        )}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-white text-xs">{r.reporter_nom || 'Utilisateur Anonyme'}</p>
                        <p className="text-[11px] text-slate-400">{r.reporter_email || 'Contact non renseigné'}</p>
                      </td>

                      <td className="p-4">
                        {isPending ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit animate-pulse">
                            <Clock className="w-3 h-3" /> En attente
                          </span>
                        ) : isResolved ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Résolu
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Rejeté
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(r.created_at || Date.now()).toLocaleDateString('fr-FR')}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedReport(r);
                                  setAdminNote('Annonce vérifiée et retirée ou régularisée.');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold transition cursor-pointer"
                              >
                                Traiter
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'rejete')}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-bold transition cursor-pointer"
                                title="Rejeter le signalement"
                              >
                                Ignorer
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteReport(r.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Supprimer"
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

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Résolution du signalement #{selectedReport.id}
            </h3>

            <p className="text-xs text-slate-400">
              Cible : <strong className="text-white">{selectedReport.target_title}</strong> ({selectedReport.reason})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Note d'intervention modérateur (archivée dans le dossier) :
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedReport.id, 'resolu')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {actionLoading ? 'Enregistrement...' : 'Marquer comme Résolu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
