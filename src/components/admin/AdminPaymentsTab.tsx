import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Search, CheckCircle, Clock, XCircle, RefreshCw, 
  CreditCard, Smartphone, Building2, PlusCircle, X, Download
} from 'lucide-react';

interface PaymentItem {
  id: number;
  dealership_id?: number;
  dealership_nom?: string;
  garage_id?: number;
  garage_nom?: string;
  amount: number;
  currency: string;
  payment_method: string;
  reference?: string;
  phone_number?: string;
  status: string;
  created_at: string;
}

export const AdminPaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modal manuel paiement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [amount, setAmount] = useState(79);
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState('mpesa');
  const [reference, setReference] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+243 81');

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/payments', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString(), { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.payments) {
        setPayments(data.payments);
      }
    } catch (err: any) {
      console.error('Erreur chargement paiements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleUpdateStatus = async (paymentId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setPayments(payments.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          dealership_nom: payerName,
          amount: Number(amount),
          currency,
          payment_method: method,
          reference: reference || `MANUAL-${Date.now().toString().slice(-6)}`,
          phone_number: phoneNumber,
          status: 'completed'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchPayments();
        setIsModalOpen(false);
        setPayerName('');
        setReference('');
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const filteredPayments = payments.filter(p => {
    const targetName = (p.dealership_nom || p.garage_nom || '').toLowerCase();
    const matchesSearch = targetName.includes(search.toLowerCase()) || (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const totalCollected = filteredPayments
    .filter(p => p.status === 'completed' || p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Total */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-white font-extrabold text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Journal des Règlements & Encaissements Mobile Money / Carte
          </h3>
          <p className="text-xs text-slate-400">
            Total des transactions validées : <span className="text-emerald-400 font-black text-sm">${totalCollected.toLocaleString('fr-FR')}</span>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Enregistrer un Paiement Manuel</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par client, référence M-Pesa / Carte..."
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
              <option value="all">Toutes les transactions</option>
              <option value="completed">✅ Payées / Encaissées</option>
              <option value="pending">⏳ En attente de validation</option>
              <option value="failed">❌ Échouées / Rejetées</option>
            </select>
          </div>

          <button
            onClick={fetchPayments}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                <th className="p-4">Client / Entreprise</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Canal de Paiement</th>
                <th className="p-4">Référence Transaction</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action Modérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                    Chargement des règlements...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Aucun paiement enregistré pour l'instant.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isCompleted = p.status === 'completed' || p.status === 'success';
                  const isPending = p.status === 'pending';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <p className="font-extrabold text-white text-sm">{p.dealership_nom || p.garage_nom || 'Client Particulier'}</p>
                        {p.phone_number && <p className="text-[11px] text-slate-400">{p.phone_number}</p>}
                      </td>

                      <td className="p-4">
                        <span className="font-black text-emerald-400 text-sm">
                          ${p.amount} {p.currency || 'USD'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold uppercase text-[10px] text-amber-400">
                          {p.payment_method}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-300">
                        {p.reference || 'REF-NON-DEFINIE'}
                      </td>

                      <td className="p-4">
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Encaissé
                          </span>
                        ) : isPending ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit animate-pulse">
                            <Clock className="w-3 h-3" /> En attente
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Échoué
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(p.created_at || Date.now()).toLocaleDateString('fr-FR')}
                      </td>

                      <td className="p-4 text-right">
                        {isPending && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold transition cursor-pointer"
                            >
                              Valider l'Encaissement
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'failed')}
                              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-[11px] font-bold transition cursor-pointer"
                            >
                              Rejeter
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Modal */}
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
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Saisir un Règlement Manuel
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom de la concession ou du client *</label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Ex : Prestige Auto Kinshasa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Montant ($) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Moyen de paiement</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="mpesa">M-Pesa Vodacom</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="airtel_money">Airtel Money</option>
                    <option value="virement">Virement Bancaire (Rawbank / Equity)</option>
                    <option value="cash">Paiement Espèces (Guichet)</option>
                    <option value="card">Carte Bancaire Visa / MC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Référence Transaction / Reçu</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: MPESA-88492048 ou N° BORDEREAU"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Numéro Mobile Money Payeur</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+243 81 234 5678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
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
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  Valider le Règlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
