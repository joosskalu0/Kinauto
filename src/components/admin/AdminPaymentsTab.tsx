import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Search, CheckCircle, Clock, XCircle, RefreshCw, 
  Smartphone, Building2, PlusCircle, X, Download, ShieldCheck,
  AlertTriangle, Car, Tag, ArrowRight, Ban, CheckCircle2
} from 'lucide-react';

interface PaymentItem {
  id: number | string;
  payment_id?: string;
  transaction_reference?: string;
  user_id?: number | string;
  vehicle_id?: number | string;
  dealer_id?: number | string;
  purpose?: string;
  amount: number;
  currency: string;
  payment_method: string;
  payer_phone?: string;
  payer_name?: string;
  notes?: string;
  metadata?: any;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | string;
  paid_at?: string | null;
  created_at: string;
}

export const AdminPaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [kpis, setKpis] = useState({
    total_paid_usd: 0,
    total_pending_usd: 0,
    count_paid: 0,
    count_pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal manuel paiement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('+243 81');
  const [amount, setAmount] = useState(29);
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState('mpesa');
  const [purpose, setPurpose] = useState('vehicle_promotion');
  const [notes, setNotes] = useState('');

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
      const url = new URL('/api/monetization/payments', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString(), { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.data) {
        setPayments(data.data);
        if (data.kpis) setKpis(data.kpis);
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

  // CONFIRMATION SÉCURISÉE (Valide le paiement et ACTIVE le boost ou l'abonnement)
  const handleConfirmPayment = async (payment: PaymentItem) => {
    const ref = payment.transaction_reference || payment.id;
    if (!window.confirm(`Confirmer la réception de ${payment.amount} ${payment.currency} pour la transaction ${ref} ?\n\nCela activera immédiatement la mise en avant ou l'abonnement pour le client.`)) {
      return;
    }

    setActionLoadingId(payment.id);
    try {
      const res = await fetch(`/api/monetization/payments/${payment.id}/confirm`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Paiement ${ref} validé ! Fonctionnalité payante activée avec succès.`
        });
        fetchPayments();
      } else {
        setFeedbackMessage({ type: 'error', text: data.message || 'Erreur lors de la validation' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Erreur réseau : ' + err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  // REJET OU ANNULATION
  const handleRejectPayment = async (payment: PaymentItem) => {
    const reason = prompt(`Motif du rejet/annulation pour ${payment.transaction_reference || payment.id} :`, 'Règlement non reçu');
    if (reason === null) return;

    setActionLoadingId(payment.id);
    try {
      const res = await fetch(`/api/monetization/payments/${payment.id}/reject`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason, new_status: 'FAILED' })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Paiement marqué comme FAILED. Aucune fonctionnalité n'a été activée.`
        });
        fetchPayments();
      } else {
        setFeedbackMessage({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Erreur : ' + err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  // DÉCLENCHER LE NETTOYAGE DES EXPIRATIONS (Règle 8)
  const handleRunCleanup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/monetization/cleanup-expired', {
        method: 'POST',
        headers: getHeaders()
      });
      const report = await res.json();
      if (report.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Nettoyage effectué : ${report.expired_boosts_count} boosts expirés retirés, ${report.vehicles_reverted_to_standard} annonces revenues en statut standard sans suppression.`
        });
        fetchPayments();
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Erreur nettoyage : ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    const ref = (p.transaction_reference || p.payment_id || '').toLowerCase();
    const name = (p.payer_name || '').toLowerCase();
    const phone = (p.payer_phone || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    return ref.includes(s) || name.includes(s) || phone.includes(s) || notes.includes(s);
  });

  const getStatusBadge = (status: string) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'PAID':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmé (PAID)
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
            <Clock className="w-3.5 h-3.5" /> En attente (PENDING)
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Échoué (FAILED)
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-400 border border-slate-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> Expiré (&gt;48h)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const getMethodBadge = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('mpesa') || m.includes('m-pesa')) {
      return <span className="bg-red-950/60 text-red-400 border border-red-800/60 px-2 py-0.5 rounded text-[11px] font-bold">M-Pesa Vodacom</span>;
    }
    if (m.includes('airtel')) {
      return <span className="bg-rose-950/60 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded text-[11px] font-bold">Airtel Money</span>;
    }
    if (m.includes('orange')) {
      return <span className="bg-orange-950/60 text-orange-400 border border-orange-800/60 px-2 py-0.5 rounded text-[11px] font-bold">Orange Money</span>;
    }
    return <span className="bg-blue-950/60 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded text-[11px] font-bold">Carte Bancaire</span>;
  };

  return (
    <div className="space-y-6">
      {/* Alertes & Notifications */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Revenus Confirmés</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              ${kpis.total_paid_usd.toLocaleString('fr-FR')}
            </p>
            <span className="text-[11px] text-slate-500">{kpis.count_paid} transaction(s) validée(s)</span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">En Attente de Règlement</p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              ${kpis.total_pending_usd.toLocaleString('fr-FR')}
            </p>
            <span className="text-[11px] text-slate-500">{kpis.count_pending} en attente (PENDING)</span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Règle de Sécurité</p>
            <p className="text-sm font-bold text-white mt-1">Activation sous Contrôle</p>
            <span className="text-[11px] text-slate-400">Boost activé UNIQUEMENT si statut = PAID</span>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nettoyage Automatique</p>
            <span className="text-[11px] text-slate-400">Expire boosts et remet en statut normal</span>
          </div>
          <button
            onClick={handleRunCleanup}
            className="mt-2 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Purger Expirations</span>
          </button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par référence, client, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">Statut :</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'PENDING', label: 'En attente' },
              { id: 'PAID', label: 'Confirmés' },
              { id: 'FAILED', label: 'Échoués' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchPayments}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tableau des Paiements */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3.5 px-4">Transaction / Réf</th>
                <th className="py-3.5 px-4">Client / Contact</th>
                <th className="py-3.5 px-4">Objet & Détails</th>
                <th className="py-3.5 px-4">Montant</th>
                <th className="py-3.5 px-4">Moyen Paiement</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Date / Validation</th>
                <th className="py-3.5 px-4 text-right">Actions Sécurisées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="text-sm font-semibold">Aucun paiement trouvé</p>
                    <p className="text-xs">Les transactions et intentions de monétisation apparaîtront ici.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isPending = String(p.status).toUpperCase() === 'PENDING';
                  const isPaid = ['PAID', 'COMPLETED'].includes(String(p.status).toUpperCase());
                  const isLoading = actionLoadingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <div className="flex flex-col">
                          <span>{p.transaction_reference || p.payment_id || `PAY-${p.id}`}</span>
                          <span className="text-[10px] text-slate-500 font-normal">ID: {p.id}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{p.payer_name || 'Client Inconnu'}</div>
                        <div className="text-[11px] text-slate-400">{p.payer_phone || 'Non renseigné'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-semibold text-slate-200">{p.notes || p.purpose || 'Monétisation'}</span>
                        </div>
                        {p.metadata?.vehicle_title && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Car className="w-3 h-3 text-slate-500" />
                            <span>{p.metadata.vehicle_title}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="text-sm">
                          ${Number(p.amount).toLocaleString('fr-FR')} {p.currency}
                        </div>
                        {p.metadata?.prix_fc && (
                          <div className="text-[10px] text-slate-500">
                            ≈ {Number(p.metadata.prix_fc).toLocaleString('fr-FR')} CDF
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getMethodBadge(p.payment_method)}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(p.status)}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        <div>Créé : {new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                        {p.paid_at && (
                          <div className="text-emerald-400">Payé : {new Date(p.paid_at).toLocaleDateString('fr-FR')}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleConfirmPayment(p)}
                              disabled={isLoading}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition shadow cursor-pointer"
                              title="Valider le paiement et ACTIVER le boost"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valider (PAID)</span>
                            </button>

                            <button
                              onClick={() => handleRejectPayment(p)}
                              disabled={isLoading}
                              className="bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                              title="Rejeter la transaction"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-400" />
                              <span>Rejeter</span>
                            </button>
                          </div>
                        ) : isPaid ? (
                          <span className="text-emerald-400 font-bold text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Boost Actif
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Non modifiable</span>
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
    </div>
  );
};
