import React from 'react';
import { 
  Car, Euro, TrendingUp, CheckCircle, Clock, AlertCircle, 
  UserCheck, Database, PlusCircle, Sparkles, ArrowUpRight,
  Home, ArrowLeft, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Vehicle, Lead, DealershipInfo } from '../../types';

interface AdminDashboardProps {
  vehicles: Vehicle[];
  leads: Lead[];
  onNavigateToStock: () => void;
  onNavigateToLeads: () => void;
  onOpenAddVehicle: () => void;
  onNavigateHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  vehicles,
  leads,
  onNavigateToStock,
  onNavigateToLeads,
  onOpenAddVehicle,
  onNavigateHome
}) => {
  // Calculations
  const totalStockValue = vehicles.reduce((acc, v) => acc + v.prix, 0);
  const availableVehicles = vehicles.filter((v) => v.status === 'disponible');
  const reservedVehicles = vehicles.filter((v) => v.status === 'reserve');
  const soldVehicles = vehicles.filter((v) => v.status === 'vendu');
  const avgPrice = vehicles.length > 0 ? totalStockValue / vehicles.length : 0;

  const newLeadsCount = leads.filter((l) => l.statut === 'nouveau').length;

  // Chart Data: Stock par marque
  const brandCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    brandCounts[v.marque] = (brandCounts[v.marque] || 0) + 1;
  });
  const brandData = Object.entries(brandCounts).map(([marque, count]) => ({
    marque,
    count
  }));

  // Chart Data: Répartition par Carburant
  const fuelCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    fuelCounts[v.carburant] = (fuelCounts[v.carburant] || 0) + 1;
  });
  const fuelData = Object.entries(fuelCounts).map(([fuel, value]) => ({
    name: fuel,
    value
  }));

  const FUEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  // Chart Data: Répartition par Statut
  const statusData = [
    { name: 'En Stock', value: availableVehicles.length, color: '#10b981' },
    { name: 'Réservés', value: reservedVehicles.length, color: '#f59e0b' },
    { name: 'Vendus', value: soldVehicles.length, color: '#ef4444' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-100 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow cursor-pointer mr-1"
                title="Quitter le tableau de bord et revenir à l'accueil"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Accueil / Vitrine</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30">
              Espace Concessionnaire
            </span>
            <span className="text-xs text-slate-400">Dernière mise à jour : Aujourd'hui</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Tableau de Bord & Performance Stock</h2>
          <p className="text-xs text-slate-300">Aperçu en temps réel de votre parc automobile et des demandes clients.</p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Fermer le tableau de bord et revenir au catalogue public"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Fermer la page</span>
            </button>
          )}
          <button
            onClick={onOpenAddVehicle}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau Véhicule
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock Value */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase">Valeur du Stock</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Euro className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{totalStockValue.toLocaleString('fr-FR')} FC</p>
          <p className="text-xs text-slate-400">Prix moyen : <span className="text-amber-400 font-bold">{Math.round(avgPrice).toLocaleString('fr-FR')} FC</span></p>
        </div>

        {/* Total Vehicles in Stock */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2 cursor-pointer hover:border-slate-700 transition" onClick={onNavigateToStock}>
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase">Véhicules Disponibles</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{availableVehicles.length} / {vehicles.length}</p>
          <p className="text-xs text-slate-400">{reservedVehicles.length} réservé(s) • {soldVehicles.length} vendu(s)</p>
        </div>

        {/* New Leads Count */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2 cursor-pointer hover:border-slate-700 transition" onClick={onNavigateToLeads}>
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase">Demandes Clients</span>
            <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl relative">
              <UserCheck className="w-5 h-5" />
              {newLeadsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{leads.length}</p>
          <p className="text-xs text-amber-400 font-bold">⚡ {newLeadsCount} nouvelle(s) demande(s) en attente</p>
        </div>

        {/* Top Selling Brand */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase">Taux de Réserve</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-400">
            {((reservedVehicles.length + soldVehicles.length) / (vehicles.length || 1) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-400">Pourcentage du stock réservé ou vendu</p>
        </div>

      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stock by Brand Chart */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" /> Répartition du Stock par Marque
            </h3>
            <span className="text-xs text-slate-400">{brandData.length} marques</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData}>
                <XAxis dataKey="marque" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Nombre de véhicules" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Répartition par Carburant</h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fuelData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {fuelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FUEL_COLORS[index % FUEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Activity / Recent Inquiries */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" /> Dernières Demandes d'Essais & Contact
          </h3>
          <button
            onClick={onNavigateToLeads}
            className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {leads.slice(0, 4).map((lead) => (
            <div
              key={lead.id}
              onClick={onNavigateToLeads}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex flex-wrap items-center justify-between gap-3 cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{lead.nomClient}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    lead.statut === 'nouveau'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : lead.statut === 'rdv_fixe'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {lead.statut.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Véhicule : <span className="text-amber-400 font-semibold">{lead.vehicleTitle}</span>
                </p>
              </div>

              <div className="text-right text-xs">
                <p className="text-slate-300 font-medium">📞 {lead.telephone}</p>
                <p className="text-[11px] text-slate-500">{lead.dateDemande}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
