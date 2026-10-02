import React, { useState } from 'react';
import { X, DollarSign, Send, CheckCircle2, ShieldCheck, Car, Home } from 'lucide-react';
import { Vehicle, Lead } from '../types';

interface MakeOfferModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSubmitLead: (lead: Omit<Lead, 'id' | 'dateDemande' | 'statut'>) => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  vehicle,
  onClose,
  onSubmitLead,
}) => {
  const [offerPrice, setOfferPrice] = useState<number>(Math.round(vehicle.prix * 0.95));
  const [nomClient, setNomClient] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitLead({
      vehicleId: vehicle.id,
      vehicleTitle: `${vehicle.marque} ${vehicle.modele} ${vehicle.finition}`,
      vehiclePrice: vehicle.prix,
      nomClient,
      email,
      telephone,
      typeDemande: 'offre_prix',
      offrePrixProposee: offerPrice,
      message: `Offre de prix proposée: ${offerPrice.toLocaleString('fr-FR')} € (Prix affiché: ${vehicle.prix.toLocaleString('fr-FR')} €). ${message}`
    });
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 text-slate-900 max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden my-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Faire une offre de prix</h2>
              <p className="text-xs text-slate-500">{vehicle.marque} {vehicle.modele} ({vehicle.prix.toLocaleString('fr-FR')} €)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Retourner à l'accueil"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-xs"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span>Fermer</span>
            </button>
          </div>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Offre transmise au concessionnaire !</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Votre proposition de <strong className="text-amber-600">{offerPrice.toLocaleString('fr-FR')} €</strong> a été envoyée. Notre conseiller commercial étudiera votre offre et vous recontactera sous 24h.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Home className="w-4 h-4" />
                <span>Retour à l'Accueil</span>
              </button>
              <button
                onClick={onClose}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-4 py-2.5 rounded-xl text-sm transition cursor-pointer shadow-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Offer price input */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-slate-700 font-semibold">
                <span>Votre proposition de prix :</span>
                <span className="text-amber-600 font-extrabold text-base">{offerPrice.toLocaleString('fr-FR')} €</span>
              </div>
              <input
                type="number"
                min={Math.round(vehicle.prix * 0.7)}
                max={vehicle.prix}
                step={500}
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-bold text-base focus:outline-none focus:border-amber-500 shadow-xs"
                required
              />
              <p className="text-[11px] text-slate-500">Prix affiché en concession : {vehicle.prix.toLocaleString('fr-FR')} €</p>
            </div>

            {/* Client Inputs */}
            <div>
              <label className="block text-slate-700 mb-1 font-medium">Votre nom complet *</label>
              <input
                type="text"
                value={nomClient}
                onChange={(e) => setNomClient(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Adresse email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Téléphone *</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-medium">Message ou conditions particulières (optionnel)</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Achat comptant sans reprise sous 15 jours..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              Soumettre mon offre
            </button>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Engagement de confidentialité — Aucune obligation d'achat</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
