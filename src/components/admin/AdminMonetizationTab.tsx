import React, { useState, useEffect } from 'react';
import { 
  Megaphone, DollarSign, TrendingUp, Sparkles, PlusCircle, Trash2, 
  ExternalLink, Eye, MousePointerClick, CheckCircle2, XCircle, Clock,
  RefreshCw, Building2, Phone, Mail, FileText, ArrowUpRight
} from 'lucide-react';

interface MonetizationOrder {
  id: string;
  type: string;
  item_id: string;
  item_nom: string;
  target_vehicle_id?: number | null;
  dealership_id?: number | null;
  client_nom: string;
  client_phone: string;
  client_email?: string;
  montant_usd: number;
  devise: string;
  payment_method: string;
  payment_reference?: string;
  status: string;
  created_at: string;
}

interface AdCampaign {
  id: string;
  titre: string;
  annonceur: string;
  tag: string;
  format: string;
  emplacement: string;
  image_url: string;
  description: string;
  cta_text: string;
  cta_url: string;
  badge_color: string;
  impressions: number;
  clics: number;
  date_debut?: string;
  date_fin?: string;
  is_active: boolean;
}

interface AdInquiry {
  id: string;
  nom_entreprise: string;
  contact_nom: string;
  email: string;
  telephone: string;
  format_souhaite: string;
  duree_mois: number;
  budget_estime?: number;
  message: string;
  statut: string;
  created_at: string;
}

export const AdminMonetizationTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'orders' | 'ads' | 'inquiries'>('orders');
  const [orders, setOrders] = useState<MonetizationOrder[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [inquiries, setInquiries] = useState<AdInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire nouvelle campagne pub
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAdvertiser, setNewAdvertiser] = useState('');
  const [newTag, setNewTag] = useState('Partenaire Officiel');
  const [newFormat, setNewFormat] = useState('banner_inline');
  const [newEmplacement, setNewEmplacement] = useState('catalogue_inline');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCtaText, setNewCtaText] = useState('En savoir plus');
  const [newCtaUrl, setNewCtaUrl] = useState('https://');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resOrders, resAds] = await Promise.all([
        fetch('/api/monetization/orders'),
        fetch('/api/monetization/admin/ads')
      ]);

      const dataOrders = await resOrders.json();
      if (dataOrders.success) {
        setOrders(dataOrders.orders || []);
        setTotalRevenue(dataOrders.total_revenue_usd || 0);
      }

      const dataAds = await resAds.json();
      if (dataAds.success) {
        setCampaigns(dataAds.campaigns || []);
        setInquiries(dataAds.inquiries || []);
      }
    } catch (err) {
      console.error('Erreur chargement données monétisation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAdvertiser || !newImageUrl) return;

    try {
      const res = await fetch('/api/monetization/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: newTitle,
          annonceur: newAdvertiser,
          tag: newTag,
          format: newFormat,
          emplacement: newEmplacement,
          image_url: newImageUrl,
          description: newDescription,
          cta_text: newCtaText,
          cta_url: newCtaUrl
        })
      });

      const data = await res.json();
      if (data.success && data.campaign) {
        setCampaigns([data.campaign, ...campaigns]);
        setIsModalOpen(false);
        setNewTitle('');
        setNewAdvertiser('');
        setNewImageUrl('');
        setNewDescription('');
      }
    } catch (err) {
      console.error('Erreur création campagne:', err);
    }
  };

  const handleToggleCampaign = async (campaign: AdCampaign) => {
    const nextStatus = !campaign.is_active;
    try {
      await fetch(`/api/monetization/admin/ads/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextStatus })
      });
      setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, is_active: nextStatus } : c));
    } catch (err) {
      console.error('Erreur toggle campagne:', err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Supprimer cette campagne publicitaire ?')) return;
    try {
      await fetch(`/api/monetization/admin/ads/${id}`, { method: 'DELETE' });
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur suppression campagne:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenus Monétisation</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">{totalRevenue.toLocaleString('fr-FR')} $</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Paiements Mobile Money & Virements encaissés</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Commandes Enregistrées</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">{orders.length}</div>
            <div className="text-xs text-blue-400 mt-1">Boosts, Vedettes & Abonnements</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Campagnes Publicitaires</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">{campaigns.filter(c => c.is_active).length} / {campaigns.length}</div>
            <div className="text-xs text-amber-400 mt-1">Bannières actives en ligne</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Demandes Annonceurs</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">{inquiries.length}</div>
            <div className="text-xs text-purple-400 mt-1">Prospects régie publicitaire</div>
          </div>
        </div>
      </div>

      {/* Navigation sous-onglets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              subTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Commandes & Boosts ({orders.length})</span>
          </button>

          <button
            onClick={() => setSubTab('ads')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              subTab === 'ads'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Régie Publicitaire ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setSubTab('inquiries')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              subTab === 'inquiries'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Demandes d'Encarts ({inquiries.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {subTab === 'ads' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouvelle Campagne Pub</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. VUE DES COMMANDES */}
      {subTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Historique des Commandes & Boosts Monétisés</h3>
            <span className="text-xs text-slate-400 font-medium">Connecté à l'API `/api/monetization/orders`</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Réf. & Date</th>
                  <th className="px-5 py-3">Type / Forfait</th>
                  <th className="px-5 py-3">Client / Concession</th>
                  <th className="px-5 py-3">Montant</th>
                  <th className="px-5 py-3">Moyen Paiement</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Aucune commande de monétisation pour le moment.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3 font-mono font-medium text-white">
                        <div>{ord.id}</div>
                        <div className="text-[11px] text-slate-400">{new Date(ord.created_at).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-white">{ord.item_nom}</div>
                        <div className="text-xs text-slate-400">
                          {ord.type === 'listing_tier' ? '⭐ Forfait Annonce' :
                           ord.type === 'visibility_boost' ? '🚀 Option Visibilité' :
                           ord.type === 'dealership_subscription' ? '🏢 Abonnement Concession' : ord.type}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-200">{ord.client_nom}</div>
                        <div className="text-xs text-slate-400">{ord.client_phone}</div>
                      </td>
                      <td className="px-5 py-3 font-bold text-emerald-400">
                        {ord.montant_usd.toLocaleString('fr-FR')} {ord.devise}
                      </td>
                      <td className="px-5 py-3">
                        <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {ord.payment_method}
                        </span>
                        {ord.payment_reference && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ord.payment_reference}</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {ord.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Validée</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            <span>En attente</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. VUE DE LA RÉGIE PUBLICITAIRE */}
      {subTab === 'ads' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                    <img 
                      src={camp.image_url} 
                      alt={camp.titre} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${camp.badge_color || 'bg-blue-600 text-white'}`}>
                        {camp.tag}
                      </span>
                      <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 text-xs px-2 py-0.5 rounded-full border border-white/10">
                        {camp.format}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleCampaign(camp)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border transition ${
                          camp.is_active
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {camp.is_active ? 'Active' : 'Désactivée'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base line-clamp-1">{camp.titre}</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Annonceur : <strong className="text-slate-200">{camp.annonceur}</strong></p>
                    <p className="text-xs text-slate-400 line-clamp-2">{camp.description}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="flex items-center gap-1.5" title="Impressions totales">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>{camp.impressions.toLocaleString('fr-FR')} vues</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Clics enregistrés">
                      <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
                      <span>{camp.clics.toLocaleString('fr-FR')} clics</span>
                    </div>
                    <div className="text-slate-400 font-medium">
                      CTR : {camp.impressions > 0 ? ((camp.clics / camp.impressions) * 100).toFixed(1) : 0}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCampaign(camp.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Supprimer la bannière"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VUE DES DEMANDES D'ENCARTS (ANNONCEURS) */}
      {subTab === 'inquiries' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Demandes d'Espaces Publicitaires (Devenir Annonceur)</h3>
            <span className="text-xs text-slate-400">Leads entreprises collectés via l'application</span>
          </div>

          <div className="divide-y divide-slate-800">
            {inquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Aucune demande d'espace publicitaire reçue pour le moment.
              </div>
            ) : (
              inquiries.map((inq) => (
                <div key={inq.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">{inq.nom_entreprise}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {inq.format_souhaite}
                      </span>
                      <span className="text-xs text-slate-400">({inq.duree_mois} mois)</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>Contact :</span>
                        <strong className="text-slate-200">{inq.contact_nom}</strong>
                      </div>
                      <a href={`tel:${inq.telephone}`} className="flex items-center gap-1 text-amber-400 hover:underline">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{inq.telephone}</span>
                      </a>
                      {inq.email && (
                        <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-slate-400 hover:underline">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{inq.email}</span>
                        </a>
                      )}
                    </div>

                    {inq.message && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 mt-2">
                        "{inq.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={`https://wa.me/${inq.telephone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${inq.contact_nom}, suite à votre demande pour ${inq.nom_entreprise} concernant un encart publicitaire sur AutoConcession...`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Répondre WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Ajout Campagne Pub */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Créer une Campagne Publicitaire</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-sm">
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Titre de l'encart *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex : Crédit Auto jusqu'à 80%"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Annonceur *</label>
                  <input
                    type="text"
                    required
                    value={newAdvertiser}
                    onChange={(e) => setNewAdvertiser(e.target.value)}
                    placeholder="Ex : Rawbank RDC"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tag / Label</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ex : Partenaire Officiel"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Format</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                  >
                    <option value="banner_inline">Bannière Inline (Catalogue)</option>
                    <option value="banner_leaderboard">Top Leaderboard (Accueil)</option>
                    <option value="sidebar_box">Sidebar Rectangle</option>
                    <option value="banner_sos">Bannière SOS Dépannage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Emplacement</label>
                  <input
                    type="text"
                    value={newEmplacement}
                    onChange={(e) => setNewEmplacement(e.target.value)}
                    placeholder="catalogue_inline"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">URL de l'image / Bannière *</label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description / Slogan</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Texte explicatif pour les utilisateurs..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Texte du Bouton</label>
                  <input
                    type="text"
                    value={newCtaText}
                    onChange={(e) => setNewCtaText(e.target.value)}
                    placeholder="En savoir plus"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Lien de Destination</label>
                  <input
                    type="text"
                    value={newCtaUrl}
                    onChange={(e) => setNewCtaUrl(e.target.value)}
                    placeholder="https://partenaire.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition"
                >
                  Publier la Bannière
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
