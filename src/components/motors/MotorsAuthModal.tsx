import React, { useState, useEffect } from 'react';
import { 
  X, Eye, EyeOff, Check, User, Building2, Lock, Mail, Phone, Home, 
  Wrench, ShieldCheck, KeyRound, ArrowRight, RefreshCw, Users, AlertCircle, LogOut
} from 'lucide-react';
import { DealershipAccount } from '../../types';
import { authApi, setAuthToken, removeAuthToken } from '../../services/api';

interface MotorsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealershipAccounts: DealershipAccount[];
  onLoginSuccess: (account: DealershipAccount, userProfile?: any) => void;
  onRegisterAccount?: (accountData: any) => void;
  isLoggedIn: boolean;
  onGoHome?: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

type TabType = 'login' | 'register' | 'forgot' | 'profile' | 'admin_users';

export const MotorsAuthModal: React.FC<MotorsAuthModalProps> = ({
  isOpen,
  onClose,
  dealershipAccounts,
  onLoginSuccess,
  onRegisterAccount,
  isLoggedIn,
  onGoHome,
  currentUser: initialUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('login');

  // Authenticated user state
  const [user, setUser] = useState<any>(() => {
    if (initialUser) return initialUser;
    try {
      const saved = localStorage.getItem('congocar_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('contact@autoprestige-paris.fr');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Kinshasa');
  const [regRole, setRegRole] = useState<'user' | 'dealer' | 'seller' | 'garage' | 'admin'>('dealer');
  const [regDealershipName, setRegDealershipName] = useState('');
  const [regGarageName, setRegGarageName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAcceptTerms, setRegAcceptTerms] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Forgot / Reset Password state
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [receivedCodeBanner, setReceivedCodeBanner] = useState('');

  // Profile state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Admin users & roles state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersMsg, setAdminUsersMsg] = useState('');

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileCity(user.city || 'Kinshasa');
    }
  }, [user]);

  // Si déjà connecté à l'ouverture, aller par défaut sur l'onglet profil
  useEffect(() => {
    if (isOpen && (user || isLoggedIn)) {
      setActiveTab('profile');
    } else if (isOpen) {
      setActiveTab('login');
    }
  }, [isOpen, isLoggedIn, user]);

  // Charger la liste des utilisateurs si onglet admin
  useEffect(() => {
    if (activeTab === 'admin_users' && user?.role === 'admin') {
      loadAdminUsers();
    }
  }, [activeTab, user]);

  if (!isOpen) return null;

  const loadAdminUsers = async () => {
    setAdminUsersLoading(true);
    setAdminUsersMsg('');
    try {
      const res = await authApi.getUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsersList(res.data);
      }
    } catch (err: any) {
      setAdminUsersMsg(err.message || 'Impossible de charger la liste des utilisateurs.');
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: any) => {
    try {
      const res = await authApi.updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setAdminUsersMsg(`Rôle mis à jour avec succès : ${newRole}`);
      }
    } catch (err: any) {
      setAdminUsersMsg(`Erreur : ${err.message}`);
    }
  };

  // Quick Demo Logins
  const handleQuickDemo = (role: 'admin' | 'dealer' | 'seller' | 'garage' | 'user') => {
    setLoginError('');
    setLoginSuccess('');
    if (role === 'admin') {
      setLoginEmail('admin@congocar.cd');
      setLoginPassword('AdminPassword2026!');
    } else if (role === 'dealer') {
      setLoginEmail('contact@autoprestige-paris.fr');
      setLoginPassword('password123');
    } else if (role === 'seller') {
      setLoginEmail('vendeur@autoprestige-paris.fr');
      setLoginPassword('password123');
    } else if (role === 'garage') {
      setLoginEmail('sos@kin-mecanique.cd');
      setLoginPassword('password123');
    } else if (role === 'user') {
      setLoginEmail('client@gmail.com');
      setLoginPassword('password123');
    }
  };

  // 1. CONNEXION
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setLoginLoading(true);

    try {
      const res = await authApi.login({
        email: loginEmail,
        password: loginPassword
      });

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        localStorage.setItem('congocar_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setLoginSuccess(res.message || `Bienvenue ${res.data.user.name} !`);

        // Adapter au compte concessionnaire existant pour compatibilité frontend
        const targetDealership = dealershipAccounts[0] || {
          id: 'dealership-1',
          nomEntreprise: res.data.user.name,
          emailLogin: res.data.user.email,
          role: res.data.user.role,
          statutAbonnement: 'actif',
          planId: 'concessionnaire_pro',
          responsableNom: res.data.user.name
        };

        setTimeout(() => {
          onLoginSuccess(targetDealership as DealershipAccount, res.data.user);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Identifiants incorrects ou serveur indisponible.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 2. INSCRIPTION
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regAcceptTerms) {
      setRegError('Veuillez accepter les conditions générales d’utilisation.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await authApi.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone,
        city: regCity,
        dealershipName: regRole === 'dealer' || regRole === 'seller' ? regDealershipName || regName : undefined,
        garageName: regRole === 'garage' ? regGarageName || regName : undefined
      });

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        localStorage.setItem('congocar_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setRegSuccess('Compte créé avec succès ! Authentification en cours...');

        if (onRegisterAccount) {
          onRegisterAccount(res.data.user);
        }

        const targetDealership = {
          id: `dealership-${res.data.user.id}`,
          nomEntreprise: regDealershipName || regName,
          emailLogin: res.data.user.email,
          role: res.data.user.role,
          statutAbonnement: 'actif',
          planId: 'starter',
          responsableNom: res.data.user.name
        };

        setTimeout(() => {
          onLoginSuccess(targetDealership as any, res.data.user);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setRegError(err.message || 'Erreur lors de l’inscription.');
    } finally {
      setRegLoading(false);
    }
  };

  // 3. RÉCUPÉRATION DE MOT DE PASSE (Step 1: Code generation, Step 2: Reset)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      if (forgotStep === 1) {
        const res = await authApi.forgotPassword({ email: forgotEmail });
        if (res.success) {
          setForgotSuccess(res.message);
          if (res.data?.resetCode) {
            setReceivedCodeBanner(`Votre code de vérification : ${res.data.resetCode}`);
            setResetCode(res.data.resetCode);
          }
          setForgotStep(2);
        }
      } else {
        if (!resetCode || !resetNewPassword) {
          setForgotError('Veuillez renseigner le code et votre nouveau mot de passe.');
          setForgotLoading(false);
          return;
        }

        const res = await authApi.resetPassword({
          email: forgotEmail,
          code: resetCode,
          newPassword: resetNewPassword
        });

        if (res.success) {
          setForgotSuccess(res.message);
          setLoginEmail(forgotEmail);
          setLoginPassword(resetNewPassword);
          setTimeout(() => {
            setActiveTab('login');
            setForgotStep(1);
            setReceivedCodeBanner('');
          }, 1500);
        }
      }
    } catch (err: any) {
      setForgotError(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 4. MISE À JOUR DU PROFIL
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const payload: any = {
        name: profileName,
        phone: profilePhone,
        city: profileCity
      };

      if (newPwd) {
        if (!currentPwd) {
          setProfileError('Veuillez saisir votre mot de passe actuel pour le modifier.');
          setProfileLoading(false);
          return;
        }
        payload.currentPassword = currentPwd;
        payload.newPassword = newPwd;
      }

      const res = await authApi.updateProfile(payload);
      if (res.success) {
        setProfileSuccess(res.message || 'Profil mis à jour avec succès.');
        setUser(res.data);
        localStorage.setItem('congocar_user', JSON.stringify(res.data));
        setCurrentPwd('');
        setNewPwd('');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setProfileLoading(false);
    }
  };

  // 5. DÉCONNEXION
  const handleLogoutClick = async () => {
    try {
      await authApi.logout();
    } catch (_) {}
    removeAuthToken();
    setUser(null);
    if (onLogout) onLogout();
    setActiveTab('login');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-800">
              CONGOCAR <span className="text-blue-600">• Node.js + MySQL Auth</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onGoHome && (
              <button
                onClick={() => {
                  onGoHome();
                  onClose();
                }}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white flex items-center gap-1.5 transition shadow-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Accueil</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Connexion</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Inscription</span>
          </button>

          <button
            onClick={() => setActiveTab('forgot')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'forgot' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Récupération</span>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mon Profil</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin_users')}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'admin_users' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Rôles RBAC</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto space-y-6">

          {/* ============================================================ */}
          {/* 1. ONGLET CONNEXION */}
          {/* ============================================================ */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Connexion</h2>
                  <p className="text-xs text-slate-500 font-medium">Authentification sécurisée par JWT & hash bcrypt</p>
                </div>

                {/* Badges de connexion démo rapides */}
                <div className="flex flex-wrap items-center gap-1 text-[11px] bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 px-1">Rôles :</span>
                  <button 
                    type="button" 
                    onClick={() => handleQuickDemo('admin')} 
                    className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-black hover:bg-purple-200 transition"
                    title="Super Admin"
                  >
                    Admin
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleQuickDemo('dealer')} 
                    className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-black hover:bg-blue-200 transition"
                    title="Concessionnaire"
                  >
                    Dealer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleQuickDemo('seller')} 
                    className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-black hover:bg-sky-200 transition"
                    title="Commercial Showroom"
                  >
                    Seller
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleQuickDemo('garage')} 
                    className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-black hover:bg-amber-200 transition"
                    title="Atelier Mécanique / SOS"
                  >
                    Garage
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleQuickDemo('user')} 
                    className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black hover:bg-emerald-200 transition"
                    title="Client Particulier"
                  >
                    User
                  </button>
                </div>
              </div>

              {/* Formulaire Dark Navy */}
              <form onSubmit={handleLoginSubmit} className="bg-[#1e293b] text-white p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl border border-slate-700">
                {loginError && (
                  <div className="bg-rose-500/20 border border-rose-500 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                {loginSuccess && (
                  <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{loginSuccess}</span>
                  </div>
                )}

                {/* Email / Identifiant */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Adresse E-mail</span>
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: contact@autoprestige-paris.fr"
                    required
                    className="w-full bg-slate-800/90 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Mot de passe */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mot de passe</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Mot de passe sécurisé"
                      required
                      className="w-full bg-slate-800/90 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Options & Récupération */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Se souvenir de moi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setActiveTab('forgot');
                    }}
                    className="text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Vérification bcrypt & JWT...</span>
                    </>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. ONGLET INSCRIPTION */}
          {/* ============================================================ */}
          {activeTab === 'register' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Créer un compte</h2>
                <p className="text-xs text-slate-500 font-medium">Rejoignez la plateforme automobile de référence en RDC</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {regError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* Sélecteur de Rôle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Sélectionnez votre profil (Rôle CONGOCAR) :</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'user', label: 'Client / Acheteur', icon: User, desc: 'Recherche & Favoris' },
                      { id: 'dealer', label: 'Concessionnaire', icon: Building2, desc: 'Showroom & Stock' },
                      { id: 'seller', label: 'Commercial Vendeur', icon: ShieldCheck, desc: 'Leads & Vente' },
                      { id: 'garage', label: 'Garage / SOS', icon: Wrench, desc: 'Dépannage 24/7' }
                    ].map((r) => {
                      const Icon = r.icon;
                      const isSelected = regRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRegRole(r.id as any)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div className="font-extrabold text-xs leading-tight">{r.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nom complet & Téléphone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nom & Prénom</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="ex: Dieudonné Kasongo"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Téléphone (avec WhatsApp)</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+243 81 000 0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Nom entreprise si concessionnaire ou garage */}
                {(regRole === 'dealer' || regRole === 'seller') && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nom de la Concession Automobile</label>
                    <input
                      type="text"
                      value={regDealershipName}
                      onChange={(e) => setRegDealershipName(e.target.value)}
                      placeholder="ex: Prestige Motors Kinshasa"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                )}

                {regRole === 'garage' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nom du Garage / Atelier</label>
                    <input
                      type="text"
                      value={regGarageName}
                      onChange={(e) => setRegGarageName(e.target.value)}
                      placeholder="ex: Garage Central Dépannage Gombe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                )}

                {/* Email & Ville */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Adresse E-mail</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="contact@exemple.cd"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Ville / Commune</label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="Kinshasa, Lubumbashi..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Mot de passe (chiffré par bcrypt)</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Conditions */}
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={regAcceptTerms}
                    onChange={(e) => setRegAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span>J'accepte les conditions générales d'utilisation et la politique de confidentialité de CONGOCAR.</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {regLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Création du compte et hashage bcrypt...</span>
                    </>
                  ) : (
                    <>
                      <span>Créer mon compte</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. ONGLET RÉCUPÉRATION DE MOT DE PASSE */}
          {/* ============================================================ */}
          {activeTab === 'forgot' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Récupération de mot de passe</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {forgotStep === 1 
                    ? 'Étape 1 sur 2 : Renseignez votre e-mail pour recevoir un code de sécurité' 
                    : 'Étape 2 sur 2 : Saisissez le code de validation et votre nouveau mot de passe'}
                </p>
              </div>

              {receivedCodeBanner && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{receivedCodeBanner}</span>
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}
                {forgotSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                {/* Step 1 : Saisie de l'e-mail */}
                {forgotStep === 1 ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Adresse E-mail de votre compte</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="votre-email@domaine.cd"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Code de vérification (6 chiffres)</label>
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="ex: 839201"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono tracking-wider focus:bg-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Nouveau mot de passe</label>
                      <div className="relative">
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          placeholder="Minimum 6 caractères"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  {forgotStep === 2 && (
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Retour
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Traitement sécurisé...</span>
                      </>
                    ) : forgotStep === 1 ? (
                      <>
                        <span>Générer le code de réinitialisation</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Enregistrer le nouveau mot de passe</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. ONGLET MON PROFIL */}
          {/* ============================================================ */}
          {activeTab === 'profile' && user && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Profil Utilisateur</h2>
                  <p className="text-xs text-slate-500 font-medium">Gérez vos informations personnelles et identifiants</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </button>
              </div>

              {/* Badge du rôle actif */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Rôle assigné</span>
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black capitalize ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'dealer' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'seller' ? 'bg-sky-100 text-sky-800' :
                    user.role === 'garage' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {profileError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}
                {profileSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nom affiché</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Numéro de téléphone</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Ville de rattachement</label>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Modification du mot de passe */}
                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <div className="text-xs font-bold text-slate-700">Changer de mot de passe (optionnel) :</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Mot de passe actuel</label>
                      <input
                        type="password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder="Requis pour changer"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {profileLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mise à jour en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Enregistrer les modifications</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. ONGLET GESTION DES RÔLES (ADMIN SEULEMENT) */}
          {/* ============================================================ */}
          {activeTab === 'admin_users' && user?.role === 'admin' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Rôles (RBAC)</h2>
                  <p className="text-xs text-slate-500 font-medium">Contrôle d'accès basé sur les rôles Node.js + MySQL</p>
                </div>
                <button
                  type="button"
                  onClick={loadAdminUsers}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${adminUsersLoading ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>

              {adminUsersMsg && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-3 rounded-xl">
                  {adminUsersMsg}
                </div>
              )}

              {adminUsersLoading ? (
                <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Chargement des utilisateurs...</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-3.5">Utilisateur</th>
                          <th className="py-3 px-3.5">Email</th>
                          <th className="py-3 px-3.5">Rôle Actuel</th>
                          <th className="py-3 px-3.5 text-right">Modifier le Rôle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-3.5 font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-[10px]">
                                {u.name ? u.name[0].toUpperCase() : 'U'}
                              </span>
                              <span>{u.name}</span>
                            </td>
                            <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                            <td className="py-3 px-3.5">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black capitalize ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                u.role === 'dealer' ? 'bg-blue-100 text-blue-800' :
                                u.role === 'seller' ? 'bg-sky-100 text-sky-800' :
                                u.role === 'garage' ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                              >
                                <option value="admin">admin</option>
                                <option value="dealer">dealer</option>
                                <option value="seller">seller</option>
                                <option value="garage">garage</option>
                                <option value="user">user</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
