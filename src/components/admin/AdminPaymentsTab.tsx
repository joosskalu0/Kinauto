import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Search, CheckCircle, Clock, XCircle, RefreshCw, 
  Smartphone, PlusCircle, X, ShieldCheck,
  AlertTriangle, Car, Tag, Ban, CheckCircle2,
  Camera, Eye, Settings, ExternalLink, MessageCircle, Copy, Check
} from 'lucide-react';

interface PaymentItem {
  id: number | string;
  payment_id?: string;
  transaction_reference?: string;
  user_id?: number | string;
  vehicle_id?: number | string;
  vehicle_title?: string;
  vehicle_image?: string;
  vehicle_price?: number;
  duration_days?: number;
  dealer_id?: number | string;
  purpose?: string;
  amount: number;
  currency: string;
  payment_method: string;
  payer_phone?: string;
  payer_name?: string;
  notes?: string;
  proof_image?: string;
  proof_submitted_at?: string;
  metadata?: any;
  status: 'PENDING' | 'PENDING_VERIFICATION' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | string;
  paid_at?: string | null;
  created_at: string;
}

export const AdminPaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [kpis, setKpis] = useState({
    total_paid_usd: 0,
    total_pending_usd: 0,
    count_paid: 0,
    count_pending: 0,
    count_pending_verification: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal d'examen de la capture d'écran / reçu utilisateur
  const [selectedProofPayment, setSelectedProofPayment] = useState<PaymentItem | null>(null);

  // Modal de configuration des comptes Mobile Money de réception
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isSavingAccounts, setIsSavingAccounts] = useState(false);
  const [accountsForm, setAccountsForm] = useState({
    titulaire: 'AutoKin RDC / Patrick M.',
    mpesa_number: '+243 812 345 678',
    mpesa_name: 'AutoKin Vodacom M-Pesa',
    airtel_number: '+243 991 234 567',
    airtel_name: 'AutoKin Airtel Money',
    orange_number: '+243 899 876 543',
    orange_name: 'AutoKin Orange Money',
    whatsapp_number: '+243 812 345 678',
    instructions: 'Transférez le montant exact par Mobile Money puis téléversez votre capture d’écran de confirmation.'
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
        if (data.payment_accounts) {
          setAccountsForm(prev => ({ ...prev, ...data.payment_accounts }));
        }
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
    if (!window.confirm(`Confirmer la réception de ${payment.amount} ${payment.currency} pour la transaction ${ref} ?\n\nCela activera immédiatement la mise en avant de l'annonce.`)) {
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
          text: `Paiement ${ref} validé ! L'annonce est maintenant mise à la une.`
        });
        if (selectedProofPayment?.id === payment.id) {
          setSelectedProofPayment(null);
        }
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
    const reason = prompt(`Motif du rejet/annulation pour ${payment.transaction_reference || payment.id} :`, 'Capture d’écran illisible ou transfert non reçu sur le compte Mobile Money');
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
        if (selectedProofPayment?.id === payment.id) {
          setSelectedProofPayment(null);
        }
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

  // SAUVEGARDER LES COMPTES DE RÉCEPTION MOBILE MONEY
  const handleSaveAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccounts(true);
    try {
      const res = await fetch('/api/monetization/admin/payment-accounts', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(accountsForm)
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: 'success',
          text: 'Vos coordonnées Mobile Money ont été mises à jour. Les utilisateurs verront ces numéros.'
        });
        setIsAccountsModalOpen(false);
      } else {
        setFeedbackMessage({ type: 'error', text: data.message || 'Erreur lors de la sauvegarde' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Erreur : ' + err.message });
    } finally {
      setIsSavingAccounts(false);
    }
  };

  // DÉCLENCHER LE NETTOYAGE DES EXPIRATIONS
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
          text: `Nettoyage effectué : ${report.expired_boosts_count} boosts expirés retirés.`
        });
        fetchPayments();
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Erreur nettoyage : ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredPayments = payments.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    const ref = (p.transaction_reference || p.payment_id || '').toLowerCase();
    const name = (p.payer_name || '').toLowerCase();
    const phone = (p.payer_phone || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const veh = (p.vehicle_title || '').toLowerCase();
    return ref.includes(s) || name.includes(s) || phone.includes(s) || notes.includes(s) || veh.includes(s);
  });

  const getStatusBadge = (status: string, hasProof: boolean) => {
    const s = String(status).toUpperCase();
    if (s === 'PENDING_VERIFICATION' || (s === 'PENDING' && hasProof)) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-black animate-pulse">
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>Preuve à vérifier</span>
        </span>
      );
    }
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
          <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> En attente de preuve
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Rejeté / Échoué
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
      return <span className="bg-red-950/60 text-red-400 border border-red-800/60 px-2 py-0.5 rounded text-[11px] font-bold">Vodacom M-Pesa</span>;
    }
    if (m.includes('airtel')) {
      return <span className="bg-rose-950/60 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded text-[11px] font-bold">Airtel Money</span>;
    }
    if (m.includes('orange')) {
      return <span className="bg-orange-950/60 text-orange-400 border border-orange-800/60 px-2 py-0.5 rounded text-[11px] font-bold">Orange Money</span>;
    }
    return <span className="bg-blue-950/60 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded text-[11px] font-bold">Mobile Money</span>;
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
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Preuves à valider (mis en avant pour l'administrateur sans compte marchand) */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between transition ${
          kpis.count_pending_verification > 0
            ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div>
            <p className="text-xs text-amber-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Preuves à Vérifier</span>
            </p>
            <p className="text-2xl font-black text-white mt-1">
              {kpis.count_pending_verification}
            </p>
            <span className="text-[11px] text-amber-300/80">Captures soumises par les clients</span>
          </div>
          <button
            onClick={() => setStatusFilter('PENDING_VERIFICATION')}
            className="w-12 h-12 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl flex items-center justify-center border border-amber-500/30 cursor-pointer transition text-amber-400"
            title="Filtrer les preuves reçues"
          >
            <Eye className="w-6 h-6" />
          </button>
        </div>

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

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mes Comptes de Réception</p>
            <p className="text-sm font-bold text-white mt-1">M-Pesa • Airtel • Orange</p>
            <span className="text-[11px] text-slate-400">Numéros affichés aux clients</span>
          </div>
          <button
            onClick={() => setIsAccountsModalOpen(true)}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Modifier mes numéros</span>
          </button>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nettoyage Automatique</p>
            <p className="text-sm font-bold text-white mt-1">Expiration des Boosts</p>
            <span className="text-[11px] text-slate-400">Expire les boosts dépassés</span>
          </div>
          <button
            onClick={handleRunCleanup}
            className="mt-2 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Purger Expirations</span>
          </button>
        </div>
      </div>

      {/* Bandeau d'information sur la validation manuelle */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Contrôle Strict : Validation manuelle des captures d’écran</h4>
            <p className="text-slate-400 text-xs">
              Les clients effectuent le transfert Mobile Money vers vos numéros et envoient leur capture d’écran. C’est vous qui validez pour activer la mise à la une.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAccountsModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl shrink-0 transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Voir coordonnées configurées</span>
        </button>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par référence, client, téléphone, véhicule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">Filtre :</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'PENDING_VERIFICATION', label: `📸 Preuves (${kpis.count_pending_verification})` },
              { id: 'PENDING', label: 'En attente' },
              { id: 'PAID', label: 'Confirmés' },
              { id: 'FAILED', label: 'Rejetés' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
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
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition cursor-pointer"
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
                <th className="py-3.5 px-4">Client & Contact</th>
                <th className="py-3.5 px-4">Annonce / Véhicule</th>
                <th className="py-3.5 px-4">Montant</th>
                <th className="py-3.5 px-4">Preuve Reçue</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="text-sm font-semibold">Aucun paiement trouvé</p>
                    <p className="text-xs">Les demandes de mise à la une et les preuves apparaîtront ici.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const hasProof = Boolean(p.proof_image || p.metadata?.proof_image);
                  const isPending = ['PENDING', 'PENDING_VERIFICATION'].includes(String(p.status).toUpperCase());
                  const isPaid = ['PAID', 'COMPLETED'].includes(String(p.status).toUpperCase());
                  const isLoading = actionLoadingId === p.id;
                  const proofImg = p.proof_image || p.metadata?.proof_image;

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-800/40 transition ${
                        hasProof && isPending ? 'bg-amber-950/15' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <div className="flex flex-col">
                          <span>{p.transaction_reference || p.payment_id || `PAY-${p.id}`}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {getMethodBadge(p.payment_method)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{p.payer_name || 'Client AutoKin'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span>{p.payer_phone || 'Non renseigné'}</span>
                          {p.payer_phone && (
                            <a
                              href={`https://wa.me/${p.payer_phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300"
                              title="Contacter sur WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {p.vehicle_image ? (
                            <img 
                              src={p.vehicle_image} 
                              alt="Véhicule" 
                              className="w-9 h-7 object-cover rounded-lg border border-slate-700 shrink-0" 
                            />
                          ) : (
                            <div className="w-9 h-7 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                              <Car className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-[180px]">
                              {p.vehicle_title || p.metadata?.vehicle_title || `Véhicule #${p.vehicle_id || '—'}`}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Durée : <strong>{p.duration_days || p.metadata?.duration_days || 7} jours</strong>
                            </p>
                          </div>
                        </div>
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
                        {proofImg ? (
                          <button
                            type="button"
                            onClick={() => setSelectedProofPayment(p)}
                            className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer"
                          >
                            <img 
                              src={proofImg} 
                              alt="Capture" 
                              className="w-7 h-7 object-cover rounded-lg border border-slate-700 group-hover:scale-105 transition" 
                            />
                            <div className="text-[11px] leading-tight">
                              <span className="font-bold text-amber-400 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Voir reçu
                              </span>
                              <span className="text-[9px] text-slate-400 block">Capture d’écran</span>
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Pas de capture</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(p.status, hasProof)}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        <div>{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                        <div className="text-[10px] text-slate-500">{new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {hasProof && (
                              <button
                                onClick={() => setSelectedProofPayment(p)}
                                className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition shadow cursor-pointer"
                                title="Examiner la capture d’écran"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Examiner</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleConfirmPayment(p)}
                              disabled={isLoading}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition shadow cursor-pointer"
                              title="Valider le paiement et ACTIVER le boost"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valider</span>
                            </button>

                            <button
                              onClick={() => handleRejectPayment(p)}
                              disabled={isLoading}
                              className="bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
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
                          <span className="text-slate-500 text-[11px]">Rejeté / Inactif</span>
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

      {/* ========================================================================= */}
      {/* MODAL 1 : EXAMEN DE LA CAPTURE D'ÉCRAN DE PAIEMENT                       */}
      {/* ========================================================================= */}
      {selectedProofPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Preuve de paiement soumise par le client</h3>
                  <p className="text-xs text-slate-400">Réf : {selectedProofPayment.transaction_reference}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProofPayment(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corps du modal */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Infos Récapitulatives */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Client</span>
                  <p className="text-xs font-bold text-white truncate">{selectedProofPayment.payer_name || 'Client'}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Téléphone</span>
                  <p className="text-xs font-bold text-emerald-400 truncate">{selectedProofPayment.payer_phone || '—'}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Montant Attendu</span>
                  <p className="text-xs font-black text-amber-400">${selectedProofPayment.amount} USD</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Durée Boost</span>
                  <p className="text-xs font-bold text-blue-400">{selectedProofPayment.duration_days || selectedProofPayment.metadata?.duration_days || 7} jours</p>
                </div>
              </div>

              {/* Véhicule ciblé */}
              {selectedProofPayment.vehicle_title && (
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedProofPayment.vehicle_image && (
                    <img 
                      src={selectedProofPayment.vehicle_image} 
                      alt="Véhicule" 
                      className="w-12 h-9 object-cover rounded-lg border border-slate-700" 
                    />
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Véhicule à mettre à la une :</span>
                    <p className="text-xs font-bold text-white">{selectedProofPayment.vehicle_title}</p>
                  </div>
                </div>
              )}

              {/* Aperçu de la Capture d'écran */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Capture d’écran du transfert / SMS</span>
                  </label>
                  {(selectedProofPayment.proof_image || selectedProofPayment.metadata?.proof_image) && (
                    <a
                      href={selectedProofPayment.proof_image || selectedProofPayment.metadata?.proof_image}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                    >
                      <ExternalLink className="w-3 h-3" /> Ouvrir en grand
                    </a>
                  )}
                </div>

                {(selectedProofPayment.proof_image || selectedProofPayment.metadata?.proof_image) ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 flex items-center justify-center max-h-[380px] overflow-hidden">
                    <img 
                      src={selectedProofPayment.proof_image || selectedProofPayment.metadata?.proof_image} 
                      alt="Preuve de paiement" 
                      className="max-h-[360px] w-auto max-w-full rounded-xl object-contain shadow-md"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                    <p className="text-xs font-medium">Aucune image n’a été téléversée pour ce paiement.</p>
                  </div>
                )}
              </div>

              {/* Note / Référence utilisateur */}
              {selectedProofPayment.notes && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Note / Message du client :</span>
                  <p className="text-slate-300 mt-0.5">{selectedProofPayment.notes}</p>
                </div>
              )}
            </div>

            {/* Actions de validation */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedProofPayment(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Fermer
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRejectPayment(selectedProofPayment)}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  <span>Rejeter</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmPayment(selectedProofPayment)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider & Activer la Mise à la Une</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : CONFIGURATION DES COMPTES MOBILE MONEY DE RÉCEPTION             */}
      {/* ========================================================================= */}
      {isAccountsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Mes Coordonnées Mobile Money</h3>
                  <p className="text-xs text-slate-400">Ces numéros sont affichés aux clients pour effectuer leurs règlements</p>
                </div>
              </div>
              <button
                onClick={() => setIsAccountsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSaveAccounts} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom du Titulaire / Bénéficiaire</label>
                <input
                  type="text"
                  value={accountsForm.titulaire}
                  onChange={(e) => setAccountsForm({ ...accountsForm, titulaire: e.target.value })}
                  placeholder="Ex: AutoKin RDC / Patrick M."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              {/* M-Pesa */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Vodacom M-Pesa</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Numéro de téléphone</label>
                    <input
                      type="text"
                      value={accountsForm.mpesa_number}
                      onChange={(e) => setAccountsForm({ ...accountsForm, mpesa_number: e.target.value })}
                      placeholder="+243 812 345 678"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Nom associé M-Pesa</label>
                    <input
                      type="text"
                      value={accountsForm.mpesa_name}
                      onChange={(e) => setAccountsForm({ ...accountsForm, mpesa_name: e.target.value })}
                      placeholder="AutoKin M-Pesa"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Airtel Money */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Airtel Money</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Numéro de téléphone</label>
                    <input
                      type="text"
                      value={accountsForm.airtel_number}
                      onChange={(e) => setAccountsForm({ ...accountsForm, airtel_number: e.target.value })}
                      placeholder="+243 991 234 567"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Nom associé Airtel</label>
                    <input
                      type="text"
                      value={accountsForm.airtel_name}
                      onChange={(e) => setAccountsForm({ ...accountsForm, airtel_name: e.target.value })}
                      placeholder="AutoKin Airtel Money"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Orange Money */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>Orange Money</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Numéro de téléphone</label>
                    <input
                      type="text"
                      value={accountsForm.orange_number}
                      onChange={(e) => setAccountsForm({ ...accountsForm, orange_number: e.target.value })}
                      placeholder="+243 899 876 543"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Nom associé Orange</label>
                    <input
                      type="text"
                      value={accountsForm.orange_name}
                      onChange={(e) => setAccountsForm({ ...accountsForm, orange_name: e.target.value })}
                      placeholder="AutoKin Orange Money"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp pour réception des captures */}
              <div>
                <label className="block text-slate-400 font-bold mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Numéro WhatsApp Officiel (pour recevoir aussi les captures en direct)</span>
                </label>
                <input
                  type="text"
                  value={accountsForm.whatsapp_number}
                  onChange={(e) => setAccountsForm({ ...accountsForm, whatsapp_number: e.target.value })}
                  placeholder="+243 812 345 678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              {/* Instructions pour les clients */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">Instructions affichées au client</label>
                <textarea
                  rows={2}
                  value={accountsForm.instructions}
                  onChange={(e) => setAccountsForm({ ...accountsForm, instructions: e.target.value })}
                  placeholder="Instructions de paiement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingAccounts}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingAccounts ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Enregistrer les coordonnées</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
