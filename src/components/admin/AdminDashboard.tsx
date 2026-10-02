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
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Top Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-white p-6 rounded-3xl border border-blue-200 text-slate-900 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer mr-1"
                title="Quitter le tableau de bord et revenir à l'accueil"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Accueil / Vitrine</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
              Espace Concessionnaire
            </span>
            <span className="text-xs text-slate-500">Dernière mise à jour : Aujourd'hui</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Tableau de Bord & Performance Stock</h2>
          <p className="text-xs text-slate-600">Aperçu en temps réel de votre parc automobile et des demandes clients.</p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Fermer le tableau de bord et revenir au catalogue public"
            >
              <X className="w-4 h-4 text-rose-500" />
              <span>Fermer la page</span>
            </button>
          )}
          <button
            onClick={onOpenAddVehicle}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau Véhicule
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Valeur du Stock</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Euro className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{totalStockValue.toLocaleString('fr-FR')} FC</p>
          <p className="text-xs text-slate-500">Prix moyen : <span className="text-amber-600 font-bold">{Math.round(avgPrice).toLocaleString('fr-FR')} FC</span></p>
        </div>

        {/* Total Vehicles in Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-slate-300 transition" onClick={onNavigateToStock}>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Véhicules Disponibles</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{availableVehicles.length} / {vehicles.length}</p>
          <p className="text-xs text-slate-500">{reservedVehicles.length} réservé(s) • {soldVehicles.length} vendu(s)</p>
        </div>

        {/* New Leads Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-slate-300 transition" onClick={onNavigateToLeads}>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Demandes Clients</span>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl relative">
              <UserCheck className="w-5 h-5" />
              {newLeadsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{leads.length}</p>
          <p className="text-xs text-amber-600 font-bold">⚡ {newLeadsCount} nouvelle(s) demande(s) en attente</p>
        </div>

        {/* Top Selling Brand */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Taux de Réserve</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-600">
            {((reservedVehicles.length + soldVehicles.length) / (vehicles.length || 1) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500">Pourcentage du stock réservé ou vendu</p>
        </div>

      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stock by Brand Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" /> Répartition du Stock par Marque
            </h3>
            <span className="text-xs text-slate-500">{brandData.length} marques</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData}>
                <XAxis dataKey="marque" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Nombre de véhicules" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Répartition par Carburant</h3>
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
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Activity / Recent Inquiries */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" /> Dernières Demandes d'Essais & Contact
          </h3>
          <button
            onClick={onNavigateToLeads}
            className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {leads.slice(0, 4).map((lead) => (
            <div
              key={lead.id}
              onClick={onNavigateToLeads}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-wrap items-center justify-between gap-3 cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{lead.nomClient}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    lead.statut === 'nouveau'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : lead.statut === 'rdv_fixe'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {lead.statut.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Véhicule : <span className="text-amber-600 font-semibold">{lead.vehicleTitle}</span>
                </p>
              </div>

              <div className="text-right text-xs">
                <p className="text-slate-700 font-medium">📞 {lead.telephone}</p>
                <p className="text-[11px] text-slate-400">{lead.dateDemande}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
