import React, { useState } from 'react';
import { X, RefreshCw, Send, CheckCircle2, ShieldCheck, Car, Home } from 'lucide-react';
import { Vehicle, Lead } from '../types';

interface TradeInModalProps {
  targetVehicle: Vehicle;
  onClose: () => void;
  onSubmitLead: (lead: Omit<Lead, 'id' | 'dateDemande' | 'statut'>) => void;
}

export const TradeInModal: React.FC<TradeInModalProps> = ({
  targetVehicle,
  onClose,
  onSubmitLead,
}) => {
  const [marqueAncien, setMarqueAncien] = useState('');
  const [modeleAncien, setModeleAncien] = useState('');
  const [anneeAncien, setAnneeAncien] = useState<number>(2018);
  const [kmAncien, setKmAncien] = useState<number>(80000);
  const [etatAncien, setEtatAncien] = useState('Tres Bon Etat');

  const [nomClient, setNomClient] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tradeInDetails = `${marqueAncien} ${modeleAncien} (${anneeAncien}) - ${kmAncien.toLocaleString('fr-FR')} km - État: ${etatAncien}`;
    
    onSubmitLead({
      vehicleId: targetVehicle.id,
      vehicleTitle: `${targetVehicle.marque} ${targetVehicle.modele}`,
      vehiclePrice: targetVehicle.prix,
      nomClient,
      email,
      telephone,
      typeDemande: 'offre_reprise',
      vehiculeRepriseInfo: tradeInDetails,
      message: `Demande d'estimation de reprise pour: ${tradeInDetails}. ${message}`
    });
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Demande d'estimation de reprise</h2>
              <p className="text-xs text-slate-400">Pour l'achat de : {targetVehicle.marque} {targetVehicle.modele}</p>
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

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">Demande de reprise enregistrée !</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Notre expert côte d'occasion étudiera votre véhicule <strong className="text-amber-400">{marqueAncien} {modeleAncien}</strong> et vous contactera rapidement avec une offre ferme de reprise.
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
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Ancient vehicle specs */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400" /> Votre véhicule actuel à reprendre
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Marque *</label>
                  <input
                    type="text"
                    placeholder="Ex: Renault, Golf, Audi"
                    value={marqueAncien}
                    onChange={(e) => setMarqueAncien(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Modèle *</label>
                  <input
                    type="text"
                    placeholder="Ex: Clio 5, A3, Golf 7"
                    value={modeleAncien}
                    onChange={(e) => setModeleAncien(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Année</label>
                  <input
                    type="number"
                    value={anneeAncien}
                    onChange={(e) => setAnneeAncien(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Kilométrage</label>
                  <input
                    type="number"
                    value={kmAncien}
                    onChange={(e) => setKmAncien(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">État Général</label>
                  <select
                    value={etatAncien}
                    onChange={(e) => setEtatAncien(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Tres Bon Etat">Très Bon État</option>
                    <option value="Bon Etat">Bon État</option>
                    <option value="A Rénover">À Rénover</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Client Inputs */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Votre nom complet *</label>
              <input
                type="text"
                value={nomClient}
                onChange={(e) => setNomClient(e.target.value)}
                placeholder="Ex: Sophie Martin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Adresse email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Téléphone *</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Send className="w-4 h-4" />
              Demander mon offre de reprise
            </button>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estimation gratuite sans engagement</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
