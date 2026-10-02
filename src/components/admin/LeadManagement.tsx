import React, { useState } from 'react';
import { UserCheck, Phone, Mail, Calendar, MessageSquare, CheckCircle, Clock, XCircle, Search, Save, Home, ArrowLeft, X } from 'lucide-react';
import { Lead } from '../../types';

interface LeadManagementProps {
  leads: Lead[];
  onUpdateLeadStatus: (id: string, statut: Lead['statut'], notesAdmin?: string) => void;
  onDeleteLead: (id: string) => void;
  onNavigateHome?: () => void;
}

export const LeadManagement: React.FC<LeadManagementProps> = ({
  leads,
  onUpdateLeadStatus,
  onDeleteLead,
  onNavigateHome
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.nomClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.vehicleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.telephone.includes(searchTerm) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || l.statut === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSaveNotes = (id: string, currentStatus: Lead['statut']) => {
    onUpdateLeadStatus(id, currentStatus, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer mr-1"
                title="Quitter la gestion des demandes et revenir à l'accueil"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Accueil / Vitrine</span>
              </button>
            )}
            <UserCheck className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900">Gestion des Demandes Clients & Essais</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Traitez les demandes de renseignements, réservations d'essais et simulations de financement.
          </p>
        </div>

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Fermer la page et revenir au catalogue public"
          >
            <X className="w-4 h-4 text-rose-500" />
            <span>Fermer la page</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom client, téléphone, véhicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Statut:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="nouveau">Nouveau (En attente)</option>
            <option value="contacte">Client Contacté</option>
            <option value="rdv_fixe">Rendez-vous / Essai Fixé</option>
            <option value="conclu">Vente Conclue</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="bg-white p-8 text-center text-slate-500 rounded-2xl border border-slate-200 shadow-xs">
            Aucune demande ne correspond à vos filtres.
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">{lead.nomClient}</h3>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase text-[10px]">
                      {lead.typeDemande === 'essai' ? '🚗 Essai Véhicule' : lead.typeDemande === 'financement' ? '💳 Financement' : 'ℹ️ Information'}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Intéressé par : <span className="text-amber-600 font-bold">{lead.vehicleTitle}</span> ({lead.vehiclePrice.toLocaleString('fr-FR')} €)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Dropdown */}
                  <select
                    value={lead.statut}
                    onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as any, lead.notesAdmin)}
                    className={`font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                      lead.statut === 'nouveau'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : lead.statut === 'rdv_fixe'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : lead.statut === 'contacte'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <option value="nouveau">🔴 Nouveau (À traiter)</option>
                    <option value="contacte">🔵 Client Contacté</option>
                    <option value="rdv_fixe">🟢 RDV Essai Confirmé</option>
                    <option value="conclu">★ Vente Conclue</option>
                    <option value="annule">Annulé</option>
                  </select>

                  <button
                    onClick={() => onDeleteLead(lead.id)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                    title="Supprimer la demande"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contact Info & Message */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 text-slate-600">
                  <p className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <a href={`tel:${lead.telephone}`} className="hover:underline">{lead.telephone}</a>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                  </p>
                  {lead.dateSouhaitee && (
                    <p className="text-amber-600 font-semibold pt-1">
                      📅 Date souhaitée : {lead.dateSouhaitee} à {lead.horaireSouhaite}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Message du Client :</p>
                  <p className="italic">{lead.message || "Aucun message particulier fourni."}</p>
                </div>
              </div>

              {/* Admin Notes Section */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                {editingNotesId === lead.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Ajouter une note de suivi interne..."
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleSaveNotes(lead.id, lead.statut)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Enregistrer
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600">
                      📝 Note interne : <span className="text-slate-900 font-medium">{lead.notesAdmin || "Aucune note interne."}</span>
                    </p>
                    <button
                      onClick={() => {
                        setEditingNotesId(lead.id);
                        setTempNotes(lead.notesAdmin || '');
                      }}
                      className="text-amber-600 hover:text-amber-700 hover:underline font-bold cursor-pointer"
                    >
                      Modifier la note
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
