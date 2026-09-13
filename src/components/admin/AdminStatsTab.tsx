import React, { useState, useEffect } from 'react';
import { 
  Users, Car, Building2, Wrench, AlertTriangle, CreditCard, DollarSign,
  TrendingUp, CheckCircle, Clock, XCircle, RefreshCw, BarChart3, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export const AdminStatsTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtain token from localStorage if available
      const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
      const res = await fetch('/api/admin/stats', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        setError(data.message || 'Impossible de récupérer les statistiques');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
        <p className="font-semibold text-sm">Chargement des statistiques globales en direct...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-8 text-center text-rose-300 space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="font-bold text-sm">Erreur : {error || 'Données indisponibles'}</p>
        <button
          onClick={fetchStats}
          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Réessayer</span>
        </button>
      </div>
    );
  }

  const roleData = [
    { name: 'Admins', value: stats.usersByRole?.admin || 0, color: '#ef4444' },
    { name: 'Concessionnaires', value: stats.usersByRole?.dealer || 0, color: '#f59e0b' },
    { name: 'Garagistes', value: stats.usersByRole?.garage || 0, color: '#3b82f6' },
    { name: 'Particuliers', value: stats.usersByRole?.user || 0, color: '#10b981' }
  ];

  const vehicleStatusData = [
    { name: 'En Ligne / Validés', value: stats.vehicles?.approved || 0, color: '#10b981' },
    { name: 'En Attente Modération', value: stats.vehicles?.pending || 0, color: '#f59e0b' },
    { name: 'Rejetés / Non Conformes', value: stats.vehicles?.rejected || 0, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-white font-black text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            Tableau de Bord Exécutif & Métriques Clés
          </h3>
          <p className="text-xs text-slate-400">
            Aperçu centralisé de l'activité, de la modération et des finances du réseau CONGOCAR.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Total Utilisateurs */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Utilisateurs</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalUsers || 0}</p>
          <p className="text-[10px] text-slate-500">Inscrits tous rôles</p>
        </div>

        {/* Total Véhicules */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Véhicules</span>
            <Car className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.vehicles?.total || 0}</p>
          <p className="text-[10px] text-emerald-400 font-bold">{stats.vehicles?.approved || 0} validés en ligne</p>
        </div>

        {/* Validation en attente */}
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase text-amber-400">À Modérer</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{stats.vehicles?.pending || 0}</p>
          <p className="text-[10px] text-amber-300/80 font-medium">Annonces en attente</p>
        </div>

        {/* Garages */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Garages</span>
            <Wrench className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.garages?.total || 0}</p>
          <p className="text-[10px] text-slate-500">{stats.garages?.pending || 0} en attente</p>
        </div>

        {/* Abonnements Actifs & MRR */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">MRR Récurrent</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">${stats.subscriptions?.mrrUsd || 0}</p>
          <p className="text-[10px] text-slate-500">{stats.subscriptions?.activeCount || 0} abonnés actifs</p>
        </div>

        {/* Signalements */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Signalements</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.reports?.total || 0}</p>
          <p className="text-[10px] text-rose-400 font-bold">{stats.reports?.pending || 0} non traités</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Marques Graph */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-white font-bold text-sm flex items-center justify-between">
            <span>Parc Automobile par Marque</span>
            <span className="text-xs text-slate-500 font-normal">Top 8</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.marqueStats || []} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="marque" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Véhicules" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Pie & Users Pie */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-white font-bold text-sm">
            Statut de Modération & Répartition Rôles
          </h4>
          <div className="grid grid-cols-2 h-64">
            {/* Statut Annonces */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-[11px] font-bold text-slate-400 mb-2">Annonces Véhicules</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={vehicleStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Rôles Utilisateurs */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-[11px] font-bold text-slate-400 mb-2">Comptes Utilisateurs</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {roleData.map((entry, index) => (
                      <Cell key={`role-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Validés</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> En Attente</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Rejetés</span>
          </div>
        </div>
      </div>

      {/* Latest Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers Utilisateurs Inscrits */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
          <h4 className="text-white font-bold text-sm flex items-center justify-between">
            <span>Dernières Inscriptions</span>
            <Users className="w-4 h-4 text-slate-400" />
          </h4>
          <div className="divide-y divide-slate-800 text-xs">
            {(stats.latestUsers || []).map((u: any) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{u.name}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  u.role === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  u.role === 'dealer' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  u.role === 'garage' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers Signalements */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
          <h4 className="text-white font-bold text-sm flex items-center justify-between">
            <span>Signalements Récents</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </h4>
          <div className="divide-y divide-slate-800 text-xs">
            {(stats.recentReports || []).length === 0 ? (
              <p className="text-slate-500 text-center py-4">Aucun signalement en attente.</p>
            ) : (
              (stats.recentReports || []).map((r: any) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-amber-400">[{r.target_type}]</span> {r.target_title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{r.description || r.reason}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.status === 'en_attente' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {r.status === 'en_attente' ? 'En attente' : 'Traité'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
