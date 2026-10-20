import React, { useState } from 'react';
import { Building2, Lock, Mail, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, X, UserCheck, Sparkles, Home, Wrench, Shield } from 'lucide-react';
import { DealershipAccount } from '../../types';
import { authApi } from '../../services/api';

interface DealershipAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealershipAccounts: DealershipAccount[];
  onLoginSuccess: (account: DealershipAccount, userProfile?: any) => void;
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
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // 1. Tenter la connexion auprès du backend Node.js / MySQL
      const res = await authApi.login({
        email: emailInput.trim(),
        password: passwordInput
      });

      if (res.success && res.data) {
        const { user, token } = res.data;
        if (token) {
          localStorage.setItem('congocar_token', token);
          localStorage.setItem('autoconcession_token', token);
        }
        if (user) {
          localStorage.setItem('congocar_user', JSON.stringify(user));
        }

        // Trouver un compte existant ou créer un compte proxy
        let matchedAccount = dealershipAccounts.find(
          (acc) => acc.emailLogin.toLowerCase().trim() === emailInput.toLowerCase().trim()
        );

        if (!matchedAccount) {
          matchedAccount = {
            id: user.garage?.id ? `garage-${user.garage.id}` : (user.dealership?.id ? `account-${user.dealership.id}` : `user-${user.id}`),
            responsableNom: user.name,
            emailLogin: user.email,
            motDePasse: '***',
            role: user.role,
            planId: 'pro',
            dateInscription: '2025-01-01',
            finEssaiGratuit: '2027-12-31',
            prochaineFacturation: '2027-12-31',
            prixFactureMensuel: 0,
            invoices: [],
            info: {
              id: user.garage?.id ? `garage-${user.garage.id}` : `acc-${user.id}`,
              nom: user.garage?.nom || user.dealership?.nom || user.name,
              slogan: 'Service Automobile & Entretien Certifié',
              ville: user.city || 'Kinshasa',
              adresse: user.garage?.adresse || 'Kinshasa',
              codePostal: '00243',
              telephone: user.phone || '+243 99 888 0303',
              email: user.email,
              horaires: '08h00 - 18h00',
              siteWeb: 'https://congocar.cd',
              logoUrl: user.avatar || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=200',
              bannerUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1600',
              sippCode: 'CD001',
              siret: 'CD-KIN-2025'
            },
            statutAbonnement: 'actif',
            planAbonnement: 'concessionnaire_pro',
            dateExpiration: '2027-12-31',
            nbVehiculesActifs: 0,
            nbLeadsRecus: 0,
            dateCreation: '2025-01-01'
          };
        }

        const roleLabel = user.role === 'garage' 
          ? 'Garagiste & Atelier Mécanique' 
          : (user.role === 'admin' ? 'Super Administrateur' : 'Concessionnaire');

        setSuccessMsg(`Connexion réussie ! Bienvenue ${user.name} (${roleLabel}).`);
        setTimeout(() => {
          onLoginSuccess(matchedAccount!, user);
          onClose();
          setSuccessMsg('');
          setEmailInput('');
          setPasswordInput('');
          setIsLoading(false);
        }, 800);
        return;
      }
    } catch (apiErr: any) {
      // 2. Repli local sur les comptes démonstrations si backend indisponible
      const targetAccount = dealershipAccounts.find(
        (acc) => acc.emailLogin.toLowerCase().trim() === emailInput.toLowerCase().trim()
      );

      if (targetAccount) {
        if (targetAccount.motDePasse && targetAccount.motDePasse !== passwordInput) {
          setIsLoading(false);
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
          setIsLoading(false);
        }, 800);
        return;
      }

      setIsLoading(false);
      setErrorMsg(apiErr?.message || 'Identifiants invalides : adresse e-mail ou mot de passe incorrect.');
    }
  };

  const handleSelectQuickAccount = (acc: DealershipAccount) => {
    setEmailInput(acc.emailLogin);
    setPasswordInput(acc.motDePasse || 'password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative overflow-hidden text-slate-900">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-amber-500 rounded-full"></div>

        {/* Close & Home Top Buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition cursor-pointer"
            title="Retourner à l'accueil"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Accueil</span>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 font-black">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Connexion Espace Pro Concessionnaire
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Connectez-vous à votre espace privé sécurisé pour gérer votre stock, vos leads et vos paramètres de concession.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Email Professionnel Concession
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="ex: directeur@autoprestige.fr"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Mot de passe / Code d'accès
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe secret"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500 transition"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer text-xs"
          >
            <Lock className="w-4 h-4" />
            <span>Accéder à mon Espace Concession</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts Quick Fill */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Comptes Démo Réseau Concessions :
            </span>
            <span className="text-[10px] text-slate-400">Cliquez pour pré-remplir</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {/* Compte Garagiste Certifié */}
            <button
              type="button"
              onClick={() => {
                setEmailInput('garage@congocar.cd');
                setPasswordInput('password123');
              }}
              className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition cursor-pointer ${
                emailInput === 'garage@congocar.cd' 
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold' 
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div>
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🔧 Atelier SOS Dépannage Kin Mécanique (Garagiste)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">Atelier</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                  <span>garage@congocar.cd</span>
                  <span>•</span>
                  <span>password123</span>
                </div>
              </div>
              {emailInput === 'garage@congocar.cd' && <UserCheck className="w-4 h-4 text-emerald-600" />}
            </button>

            {dealershipAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectQuickAccount(acc)}
                className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition cursor-pointer ${
                  emailInput === acc.emailLogin 
                    ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold' 
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>🏢 {acc.info.nom}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({acc.info.ville})</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                    <span>{acc.emailLogin}</span>
                    <span>•</span>
                    <span className="text-slate-400 flex items-center gap-0.5">
                      <Lock className="w-3 h-3 text-slate-400 inline" /> Mot de passe protégé
                    </span>
                  </div>
                </div>
                {emailInput === acc.emailLogin && <UserCheck className="w-4 h-4 text-amber-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Registration CTA */}
        <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Pas encore inscrit ?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegisterModal();
            }}
            className="text-amber-600 hover:text-amber-500 font-bold underline transition cursor-pointer"
          >
            Créer un compte Concession (14j gratuits)
          </button>
        </div>

      </div>
    </div>
  );
};
