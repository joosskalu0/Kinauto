import React, { useState } from 'react';
import { X, Eye, EyeOff, Check, User, Building2, Lock, Mail, Phone, Home } from 'lucide-react';
import { DealershipAccount } from '../../types';

interface MotorsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealershipAccounts: DealershipAccount[];
  onLoginSuccess: (account: DealershipAccount) => void;
  onRegisterAccount?: (accountData: any) => void;
  isLoggedIn: boolean;
  onGoHome?: () => void;
}

export const MotorsAuthModal: React.FC<MotorsAuthModalProps> = ({
  isOpen,
  onClose,
  dealershipAccounts,
  onLoginSuccess,
  onRegisterAccount,
  isLoggedIn,
  onGoHome,
}) => {
  // Sign in state
  const [loginIdentifier, setLoginIdentifier] = useState('contact@autoprestige-paris.fr');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [signInError, setSignInError] = useState('');
  const [signInSuccess, setSignInSuccess] = useState('');

  // Sign up state
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpHasWhatsApp, setSignUpHasWhatsApp] = useState(true);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpLogin, setSignUpLogin] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpAcceptTerms, setSignUpAcceptTerms] = useState(true);
  const [signUpIsDealer, setSignUpIsDealer] = useState(true);
  const [signUpSuccess, setSignUpSuccess] = useState('');

  if (!isOpen) return null;

  const handleDemoDealer = () => {
    const dealer = dealershipAccounts[0];
    if (dealer) {
      setLoginIdentifier(dealer.emailLogin);
      setLoginPassword(dealer.motDePasse || 'password123');
    }
  };

  const handleDemoSeller = () => {
    const seller = dealershipAccounts[1] || dealershipAccounts[0];
    if (seller) {
      setLoginIdentifier(seller.emailLogin);
      setLoginPassword(seller.motDePasse || 'password123');
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSignInSuccess('');

    const found = dealershipAccounts.find(
      (a) => a.emailLogin.toLowerCase() === loginIdentifier.toLowerCase().trim()
    );

    if (!found) {
      setSignInError('Identifiant ou mot de passe non reconnu.');
      return;
    }

    setSignInSuccess(`Bienvenue ${found.responsableNom} ! Redirection en cours...`);
    setTimeout(() => {
      onLoginSuccess(found);
      onClose();
    }, 1000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpAcceptTerms) {
      alert('Veuillez accepter les conditions d’utilisation.');
      return;
    }
    setSignUpSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
    setLoginIdentifier(signUpEmail || signUpLogin);
    setLoginPassword(signUpPassword);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">MOTORS Authentication</span>
          <div className="flex items-center gap-2">
            {onGoHome && (
              <button
                onClick={() => {
                  onGoHome();
                  onClose();
                }}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 px-2.5 py-1 rounded-lg border border-slate-200 bg-white flex items-center gap-1"
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

        {/* Modal Content matching 00:00 - 00:05 in video */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[85vh] overflow-y-auto">
          
          {/* 1. SIGN IN SECTION */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h2>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-semibold">
                <span>Demo login for:</span>
                <button 
                  type="button" 
                  onClick={handleDemoDealer}
                  className="text-blue-600 hover:underline font-black cursor-pointer"
                >
                  Dealer
                </button>
                <span>|</span>
                <button 
                  type="button" 
                  onClick={handleDemoSeller}
                  className="text-blue-600 hover:underline font-black cursor-pointer"
                >
                  Seller
                </button>
              </div>
            </div>

            {/* Dark Navy Form Container matching video */}
            <form onSubmit={handleSignIn} className="bg-[#1e293b] text-white p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl border border-slate-700">
              {signInError && (
                <div className="bg-rose-500/20 border border-rose-500 text-rose-300 text-xs p-3 rounded-xl">
                  {signInError}
                </div>
              )}
              {signInSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{signInSuccess}</span>
                </div>
              )}

              {/* Login or E-mail */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Login or E-mail</label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter login or E-mail"
                  required
                  className="w-full bg-slate-800/90 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
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

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Un lien de réinitialisation a été simulé."); }} className="text-slate-400 hover:text-white underline">
                  Forgot Password
                </a>
              </div>

              {/* Blue Login Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition shadow-md cursor-pointer"
              >
                Login
              </button>

              {/* Social Login buttons */}
              <div className="pt-2 text-center space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">or sign in with socials</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Connexion avec Google")}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Connexion avec Facebook")}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 2. SIGN UP SECTION matching video */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign Up</h2>

            <form onSubmit={handleSignUp} className="space-y-3.5">
              {signUpSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{signUpSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">First Name</label>
                  <input
                    type="text"
                    value={signUpFirstName}
                    onChange={(e) => setSignUpFirstName(e.target.value)}
                    placeholder="Enter First Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={signUpLastName}
                    onChange={(e) => setSignUpLastName(e.target.value)}
                    placeholder="Enter Last Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signUpHasWhatsApp}
                    onChange={(e) => setSignUpHasWhatsApp(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>I have a WhatsApp account with this number</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="Enter E-mail"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Login *</label>
                  <input
                    type="text"
                    required
                    value={signUpLogin}
                    onChange={(e) => setSignUpLogin(e.target.value)}
                    placeholder="Enter Login"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password *</label>
                <div className="relative">
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signUpAcceptTerms}
                    onChange={(e) => setSignUpAcceptTerms(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>I accept the terms of the service</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signUpIsDealer}
                    onChange={(e) => setSignUpIsDealer(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Sign Up as a Dealer</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition shadow-md cursor-pointer"
              >
                Sign Up Now!
              </button>

              <div className="pt-2 text-center space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">or sign up with socials</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Inscription avec Google")}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Inscription avec Facebook")}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer note matching video */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400 space-y-1">
            <p>Created by MOTORS 2025. All rights reserved.</p>
            <p className="font-semibold text-slate-500">Dealer Profile | Seller Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};
