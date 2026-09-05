import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, X, Car, Building2, Home } from 'lucide-react';
import { Vehicle, Lead, DealershipInfo } from '../types';

interface TestDriveModalProps {
  vehicle: Vehicle;
  dealership?: DealershipInfo;
  onClose: () => void;
  onSubmitLead: (lead: Omit<Lead, 'id' | 'dateDemande' | 'statut'>) => void;
}

export const TestDriveModal: React.FC<TestDriveModalProps> = ({
  vehicle,
  dealership,
  onClose,
  onSubmitLead
}) => {
  const [nomClient, setNomClient] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [typeDemande, setTypeDemande] = useState<'essai' | 'information' | 'offre_reprise' | 'financement'>('essai');
  const [dateSouhaitee, setDateSouhaitee] = useState('');
  const [horaireSouhaite, setHoraireSouhaite] = useState('14:00');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomClient || !email || !telephone) return;

    onSubmitLead({
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.marque} ${vehicle.modele} - ${vehicle.finition}`,
      vehiclePrice: vehicle.prix,
      nomClient,
      email,
      telephone,
      typeDemande,
      dateSouhaitee,
      horaireSouhaite,
      message
    });

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Demande pour le Vendeur</h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs text-amber-400 font-semibold">{vehicle.marque} {vehicle.modele} ({vehicle.prix.toLocaleString('fr-FR')} €)</p>
                {dealership && (
                  <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                    <Building2 className="w-3 h-3" /> {dealership.nom} ({dealership.ville})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Retourner à l'accueil"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Fermer</span>
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Demande transmise avec succès !</h3>
            <p className="text-sm text-slate-300">
              Merci <span className="font-bold text-amber-400">{nomClient}</span>. Un conseiller commercial de la concession prendra contact avec vous dans les plus brefs délais au <span className="font-semibold text-white">{telephone}</span>.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <Home className="w-4 h-4" />
                <span>Retour à l'Accueil</span>
              </button>
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-sm transition cursor-pointer"
              >
                Fermer la fenêtre
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type de Demande */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Objet de la demande</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'essai', label: '🚗 Réserver un essai' },
                  { id: 'information', label: 'ℹ️ Plus de renseignements' },
                  { id: 'financement', label: '💳 Offre de financement' },
                  { id: 'offre_reprise', label: '🔄 Reprise de mon véhicule' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setTypeDemande(item.id as any)}
                    className={`py-2 px-3 rounded-xl border font-medium text-left transition ${
                      typeDemande === item.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs: Nom, Email, Téléphone */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom & Prénom *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Thomas Martin"
                    value={nomClient}
                    onChange={(e) => setNomClient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="votre@email.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="06 12 34 56 78"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {typeDemande === 'essai' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Date souhaitée</label>
                    <input
                      type="date"
                      value={dateSouhaitee}
                      onChange={(e) => setDateSouhaitee(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Créneau horaire</label>
                    <select
                      value={horaireSouhaite}
                      onChange={(e) => setHoraireSouhaite(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    >
                      <option value="09:30">09h30</option>
                      <option value="11:00">11h00</option>
                      <option value="14:00">14h00</option>
                      <option value="16:00">16h00</option>
                      <option value="18:00">18h00</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message / Précisions</label>
                <textarea
                  rows={3}
                  placeholder="Inscrivez votre message ou vos questions ici..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 rounded-xl transition cursor-pointer shadow-lg text-xs uppercase tracking-wider"
              >
                Envoyer ma demande au concessionnaire
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
