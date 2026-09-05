import React, { useState } from 'react';
import { Settings, Building, MapPin, Phone, Mail, Clock, Globe, Save, RefreshCw, CheckCircle2, Home, ArrowLeft, X } from 'lucide-react';
import { DealershipInfo } from '../../types';

interface DealershipSettingsProps {
  dealership: DealershipInfo;
  onSaveDealership: (info: DealershipInfo) => void;
  onResetStock: () => void;
  onNavigateHome?: () => void;
}

export const DealershipSettings: React.FC<DealershipSettingsProps> = ({
  dealership,
  onSaveDealership,
  onResetStock,
  onNavigateHome
}) => {
  const [formData, setFormData] = useState<DealershipInfo>(dealership);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDealership(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow cursor-pointer mr-1"
                  title="Quitter les paramètres et revenir à l'accueil"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Accueil / Vitrine</span>
                </button>
              )}
              <h2 className="text-xl font-black text-white">Paramètres de la Concession</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">Configurez le nom, l'adresse, les horaires et les informations légales.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4" /> Enregistré !
            </span>
          )}
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Fermer les paramètres et revenir au catalogue public"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Fermer la page</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Nom de la Concession *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Slogan Commercial</label>
            <input
              type="text"
              value={formData.slogan}
              onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Téléphone *</label>
            <input
              type="text"
              required
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 font-bold mb-1">Adresse physique *</label>
            <input
              type="text"
              required
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Ville *</label>
            <input
              type="text"
              required
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Code Postal *</label>
            <input
              type="text"
              required
              value={formData.codePostal}
              onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 font-bold mb-1">Horaires d'ouverture</label>
            <input
              type="text"
              value={formData.horaires}
              onChange={(e) => setFormData({ ...formData, horaires: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <span className="text-amber-400">📊</span>
                  <span>Suivi des Performances & Tracking Publicitaire</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Les balises Google Tag Manager et les pixels publicitaires (Meta, TikTok, Google Ads) sont administrés de manière centralisée par l'Administrateur SaaS pour garantir une couverture maximale de vos annonces.
                </p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/30 shrink-0">
                Géré par Admin SaaS
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Réinitialiser le stock d'origine avec les véhicules de démonstration ?")) {
                onResetStock();
              }
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-4 h-4" /> Réinitialiser le stock démo
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Enregistrer la Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
