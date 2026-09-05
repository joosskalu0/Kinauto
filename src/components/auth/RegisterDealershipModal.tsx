import React, { useState } from 'react';
import { X, Building2, ShieldCheck, Sparkles, CheckCircle2, CreditCard, Clock, Lock, ArrowRight, Eye, EyeOff, Home } from 'lucide-react';
import { DealershipAccount, SubscriptionPlanId, SubscriptionPlan } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../data/mockSaas';

interface RegisterDealershipModalProps {
  subscriptionPlans?: SubscriptionPlan[];
  onClose: () => void;
  onRegister: (account: DealershipAccount) => void;
}

export const RegisterDealershipModal: React.FC<RegisterDealershipModalProps> = ({
  subscriptionPlans,
  onClose,
  onRegister
}) => {
  const plans = subscriptionPlans && subscriptionPlans.length > 0 ? subscriptionPlans : SUBSCRIPTION_PLANS;
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [nom, setNom] = useState('');
  const [slogan, setSlogan] = useState('Votre spécialiste automobile de confiance');
  const [responsableNom, setResponsableNom] = useState('');
  const [emailLogin, setEmailLogin] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [siret, setSiret] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('pro');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !emailLogin || !responsableNom) return;

    // Calculate trial end date (14 days from today)
    const today = new Date();
    const trialEnd = new Date(today);
    trialEnd.setDate(today.getDate() + 14);

    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const newAccount: DealershipAccount = {
      id: `dealership-${Date.now()}`,
      info: {
        nom,
        slogan: slogan || 'Concession Automobile & Occasions Certifiées',
        adresse: adresse || '10 Grande Rue',
        ville: ville || 'Paris',
        codePostal: codePostal || '75001',
        telephone: telephone || '01 00 00 00 00',
        email: emailLogin,
        horaires: 'Lun - Sam : 09h00 - 19h00',
        siteWeb: `www.${nom.toLowerCase().replace(/[^a-z0-9]/g, '')}.fr`,
        logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200',
        bannerUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
        sippCode: `FR${Math.floor(10000000 + Math.random() * 90000000)}`,
        siret: siret || `${Math.floor(100000000 + Math.random() * 900000000)} 00012`
      },
      responsableNom,
      emailLogin,
      motDePasse: motDePasse || 'password123',
      planId: selectedPlanId,
      dateInscription: today.toISOString().split('T')[0],
      finEssaiGratuit: trialEnd.toISOString().split('T')[0],
      statutAbonnement: 'essai_gratuit',
      prochaineFacturation: trialEnd.toISOString().split('T')[0],
      prixFactureMensuel: selectedPlan.prixMensuel,
      nbVehiculesActifs: 0,
      estMasque: false,
      invoices: []
    };

    onRegister(newAccount);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Inscription Concessionnaire SaaS</h2>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  14 Jours Gratuits
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rejoignez le réseau. Testez sans engagement, facturation automatisée par l'administrateur.
              </p>
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
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Trial Highlight Bar */}
        <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 px-6 py-2.5 border-b border-indigo-800/40 text-xs flex flex-wrap items-center justify-between gap-2 text-indigo-200">
          <span className="flex items-center gap-1.5 font-bold">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            Aucune carte bancaire requise aujourd'hui. Essai 100% gratuit pendant 14 jours.
          </span>
          <span className="flex items-center gap-1 text-[11px] text-indigo-300">
            <Lock className="w-3.5 h-3.5" /> Sécurisé par l'Administrateur
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {step === 1 ? (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Étape 1 sur 2 : Informations de votre Concession
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nom de la Concession *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Prestige Auto Paris, Garage Central..."
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Slogan ou spécialité</label>
                  <input
                    type="text"
                    placeholder="ex: Occasions révisées & garanties"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nom du Responsable / Directeur *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Laurent Martinez"
                    value={responsableNom}
                    onChange={(e) => setResponsableNom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Professionnel (Identifiant) *</label>
                  <input
                    type="email"
                    required
                    placeholder="directeur@concession.fr"
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mot de passe de gestion *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pr-10 text-white focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Téléphone Direct *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01 23 45 67 89"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Adresse du Point de Vente *</label>
                  <input
                    type="text"
                    required
                    placeholder="12 Boulevard de la République"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ville *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bordeaux"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Code Postal *</label>
                  <input
                    type="text"
                    required
                    placeholder="33000"
                    value={codePostal}
                    onChange={(e) => setCodePostal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Numéro SIRET (Pour la facturation)</label>
                  <input
                    type="text"
                    placeholder="123 456 789 00012"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (nom && emailLogin && responsableNom) {
                      setStep(2);
                    } else {
                      alert('Veuillez remplir le nom de la concession, le responsable et l\'email.');
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs"
                >
                  <span>Choisir ma Formule d'Essai</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Étape 2 sur 2 : Choisissez votre Formule d'Abonnement
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-white underline text-xs"
                >
                  ← Retour coordonnées
                </button>
              </div>

              <p className="text-slate-400">
                Vous bénéficiez automatiquement de <strong className="text-white">14 jours d'essai gratuit complet</strong>.
                À la fin de la période d'essai, l'administrateur SaaS émettra votre première facture mensuelle.
              </p>

              {/* Plans Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/50 shadow-xl'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-slate-400">{plan.nom}</span>
                          {plan.id === 'pro' && (
                            <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full">
                              Recommandé
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <span className="text-2xl font-black text-white">{plan.prixMensuel.toLocaleString('fr-FR')} FC</span>
                          <span className="text-xs text-slate-400"> / mois HT</span>
                        </div>

                        <p className="text-[11px] text-amber-400 font-semibold mt-1">
                          🎁 14 Jours Gratuits puis {plan.prixMensuel.toLocaleString('fr-FR')} FC / mois
                        </p>

                        <p className="text-[11px] text-slate-400 mt-2">{plan.description}</p>

                        <ul className="mt-4 space-y-1.5 text-[11px] text-slate-300">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2">
                        <div className={`w-full text-center py-2 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isSelected ? '✓ Formule Sélectionnée' : 'Choisir cette formule'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Formule choisie :</span>
                  <span className="font-bold text-white">{selectedPlan.nom} ({selectedPlan.prixMensuel} € / mois)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Début de l'essai gratuit :</span>
                  <span className="font-bold text-emerald-400">Aujourd'hui</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Fin d'essai gratuit & première facture :</span>
                  <span className="font-bold text-amber-400">Dans 14 jours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition cursor-pointer shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Finaliser mon Inscription & Démarrer l'Essai
                </button>
              </div>

            </div>
          )}

        </form>
      </div>
    </div>
  );
};
