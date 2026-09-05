import React, { useState } from 'react';
import { Building2, Lock, Mail, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, X, UserCheck, Sparkles, Home } from 'lucide-react';
import { DealershipAccount } from '../../types';

interface DealershipAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealershipAccounts: DealershipAccount[];
  onLoginSuccess: (account: DealershipAccount) => void;
  onOpenRegisterModal: () => void;
  currentAccountId?: string;
  isLoggedIn: boolean;
}

export const DealershipAuthModal: React.FC<DealershipAuthModalProps> = ({
  isOpen,
  onClose,
  dealershipAccounts,
  onLoginSuccess,
  onOpenRegisterModal,
  currentAccountId,
  isLoggedIn
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetAccount = dealershipAccounts.find(
      (acc) => acc.emailLogin.toLowerCase().trim() === emailInput.toLowerCase().trim()
    );

    if (!targetAccount) {
      setErrorMsg('Aucun compte concessionnaire trouvé avec cet email.');
      return;
    }

    if (targetAccount.motDePasse && targetAccount.motDePasse !== passwordInput) {
      setErrorMsg('Mot de passe incorrect.');
      return;
    }

    setSuccessMsg(`Connexion réussie ! Bienvenue ${targetAccount.responsableNom} (${targetAccount.info.nom}).`);
    setTimeout(() => {
      onLoginSuccess(targetAccount);
      onClose();
      setSuccessMsg('');
      setEmailInput('');
      setPasswordInput('');
    }, 1200);
  };

  const handleSelectQuickAccount = (acc: DealershipAccount) => {
    setEmailInput(acc.emailLogin);
    setPasswordInput(acc.motDePasse || 'password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-amber-500/30 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full blur-xs"></div>

        {/* Close & Home Top Buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow transition cursor-pointer"
            title="Retourner à l'accueil"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Accueil</span>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/20 font-black">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Connexion Espace Pro Concessionnaire
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Connectez-vous à votre espace privé sécurisé pour gérer votre stock, vos leads et vos paramètres de concession.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Email Professionnel Concession
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="ex: directeur@autoprestige.fr"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Mot de passe / Code d'accès
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe secret"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer text-xs"
          >
            <Lock className="w-4 h-4" />
            <span>Accéder à mon Espace Concession</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts Quick Fill */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Comptes Démo Réseau Concessions :
            </span>
            <span className="text-[10px] text-slate-500">Cliquez pour pré-remplir</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {dealershipAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectQuickAccount(acc)}
                className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition cursor-pointer ${
                  emailInput === acc.emailLogin 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800/80 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>🏢 {acc.info.nom}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({acc.info.ville})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                    <span>{acc.emailLogin}</span>
                    <span>•</span>
                    <span className="text-slate-500 flex items-center gap-0.5">
                      <Lock className="w-3 h-3 text-slate-500 inline" /> Mot de passe protégé
                    </span>
                  </div>
                </div>
                {emailInput === acc.emailLogin && <UserCheck className="w-4 h-4 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Registration CTA */}
        <div className="text-center pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Pas encore inscrit ?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegisterModal();
            }}
            className="text-amber-400 hover:text-amber-300 font-bold underline transition cursor-pointer"
          >
            Créer un compte Concession (14j gratuits)
          </button>
        </div>

      </div>
    </div>
  );
};
