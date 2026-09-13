import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, PlusCircle, CheckCircle, Clock, 
  XCircle, Edit3, Trash2, Building2, Wrench, RefreshCw, X, AlertCircle
} from 'lucide-react';

interface SubItem {
  id: number;
  dealership_id?: number;
  dealership_nom?: string;
  garage_id?: number;
  garage_nom?: string;
  plan_id?: string;
  plan_nom?: string;
  billing_cycle?: string;
  status: string;
  price?: number;
  date_debut?: string;
  date_fin?: string;
  auto_renew?: number;
}

interface PlanItem {
  id: string;
  nom: string;
  prix_mensuel: number;
  description: string;
  limite_annonces: number;
}

export const AdminSubscriptionsTab: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubItem | null>(null);
  const [entityType, setEntityType] = useState<'dealer' | 'garage'>('dealer');
  const [dealershipNom, setDealershipNom] = useState('');
  const [garageNom, setGarageNom] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('mensuel');
  const [subStatus, setSubStatus] = useState('actif');
  const [subPrice, setSubPrice] = useState(79);

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, planRes] = await Promise.all([
        fetch('/api/admin/subscriptions', { headers: getHeaders() }),
        fetch('/api/admin/plans', { headers: getHeaders() })
      ]);
      const subData = await subRes.json();
      const planData = await planRes.json();

      if (subData.subscriptions) setSubscriptions(subData.subscriptions);
      if (planData.plans) setPlans(planData.plans);
    } catch (err: any) {
      console.error('Erreur abonnements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (sub?: SubItem) => {
    if (sub) {
      setEditingSub(sub);
      setEntityType(sub.garage_id ? 'garage' : 'dealer');
      setDealershipNom(sub.dealership_nom || '');
      setGarageNom(sub.garage_nom || '');
      setSelectedPlanId(sub.plan_id || 'pro');
      setBillingCycle(sub.billing_cycle || 'mensuel');
      setSubStatus(sub.status || 'actif');
      setSubPrice(sub.price || 79);
    } else {
      setEditingSub(null);
      setEntityType('dealer');
      setDealershipNom('');
      setGarageNom('');
      setSelectedPlanId('pro');
      setBillingCycle('mensuel');
      setSubStatus('actif');
      setSubPrice(79);
    }
    setIsModalOpen(true);
  };

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        plan_id: selectedPlanId,
        billing_cycle: billingCycle,
        status: subStatus,
        price: Number(subPrice),
        dealership_nom: entityType === 'dealer' ? dealershipNom : undefined,
        garage_nom: entityType === 'garage' ? garageNom : undefined
      };

      if (editingSub) {
        const res = await fetch(`/api/admin/subscriptions/${editingSub.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          fetchData();
        }
      } else {
        const res = await fetch('/api/admin/subscriptions', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          fetchData();
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const filteredSubs = subscriptions.filter(s => {
    const targetName = (s.dealership_nom || s.garage_nom || '').toLowerCase();
    const matchesSearch = targetName.includes(search.toLowerCase()) || (s.plan_nom && s.plan_nom.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filters Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par concession ou garage..."
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
              <option value="all">Tous les abonnements</option>
              <option value="actif">🟢 Actifs</option>
              <option value="essai_gratuit">🟡 En essai gratuit</option>
              <option value="expire">🔴 Expirés / Suspendus</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Attribuer un Abonnement</span>
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                <th className="p-4">Bénéficiaire Professionnel</th>
                <th className="p-4">Formule SaaS</th>
                <th className="p-4">Tarif & Cycle</th>
                <th className="p-4">Période de Validité</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                    Chargement des abonnements...
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Aucun abonnement enregistré.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        {s.garage_id ? <Wrench className="w-3.5 h-3.5 text-blue-400" /> : <Building2 className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{s.dealership_nom || s.garage_nom || `Compte #${s.dealership_id || s.garage_id}`}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{s.garage_id ? 'Garage partenaire' : 'Concessionnaire automobile'}</p>
                    </td>

                    <td className="p-4 font-black text-amber-400 text-xs uppercase">
                      {s.plan_nom || s.plan_id || 'Pro Business'}
                    </td>

                    <td className="p-4">
                      <p className="font-black text-emerald-400 text-sm">${s.price || 79} / mois</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{s.billing_cycle || 'Mensuel'}</p>
                    </td>

                    <td className="p-4 text-slate-300 text-[11px] space-y-0.5">
                      <div>Du : <span className="text-white font-medium">{s.date_debut ? new Date(s.date_debut).toLocaleDateString('fr-FR') : 'Immédiat'}</span></div>
                      <div>Au : <span className="text-amber-400 font-bold">{s.date_fin ? new Date(s.date_fin).toLocaleDateString('fr-FR') : '30 jours'}</span></div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 w-fit ${
                        s.status === 'actif' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        s.status === 'essai_gratuit' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {s.status === 'actif' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span className="capitalize">{s.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(s)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                        title="Modifier l'abonnement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              {editingSub ? "Modifier l'Abonnement" : 'Attribuer un Abonnement Pro'}
            </h3>

            <form onSubmit={handleSaveSub} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Type de compte</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntityType('dealer')}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      entityType === 'dealer'
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Concessionnaire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntityType('garage')}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      entityType === 'garage'
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Garage / Dépanneur</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  required
                  value={entityType === 'dealer' ? dealershipNom : garageNom}
                  onChange={(e) => entityType === 'dealer' ? setDealershipNom(e.target.value) : setGarageNom(e.target.value)}
                  placeholder={entityType === 'dealer' ? "Ex: AutoKin Concession" : "Ex: Atelier Mécanique Gombe"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Formule SaaS</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="starter">Starter (10 annonces)</option>
                    <option value="pro">Pro Business (50 annonces)</option>
                    <option value="unlimited">Elite Illimité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tarif Mensuel ($)</label>
                  <input
                    type="number"
                    value={subPrice}
                    onChange={(e) => setSubPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Statut de l'accès</label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="actif">🟢 Actif (Abonnement valide)</option>
                  <option value="essai_gratuit">🟡 Essai Gratuit 14 Jours</option>
                  <option value="facture_en_attente">🟠 Facture Émise (Attente règlement)</option>
                  <option value="expire">🔴 Expiré / Suspendu</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
