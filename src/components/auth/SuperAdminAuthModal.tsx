import React, { useState } from 'react';
import { Shield, Lock, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, X, Home } from 'lucide-react';

interface SuperAdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (pinEntered: string) => boolean;
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
}

export const SuperAdminAuthModal: React.FC<SuperAdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  currentPin,
  onUpdatePin
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPinMode, setIsChangingPinMode] = useState(false);
  const [oldPinConfirm, setOldPinConfirm] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = onAuthenticate(pinInput);
    if (!success) {
      setErrorMsg('Code PIN Administrateur incorrect. Veuillez vérifier votre saisie.');
    } else {
      setPinInput('');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (oldPinConfirm !== currentPin) {
      setErrorMsg('L\'ancien code PIN est incorrect.');
      return;
    }

    if (newPinInput.length < 4) {
      setErrorMsg('Le nouveau code PIN doit contenir au moins 4 caractères.');
      return;
    }

    onUpdatePin(newPinInput);
    setSuccessMsg('Code PIN modifié avec succès !');
    setTimeout(() => {
      setIsChangingPinMode(false);
      setOldPinConfirm('');
      setNewPinInput('');
      setSuccessMsg('');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-indigo-500/40 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 rounded-full blur-xs"></div>

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
            <Shield className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Espace Réservé Super-Administrateur
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cet espace est strictement confidentiel. Entrez votre code PIN secret pour accéder au pilotage global de la plateforme SaaS.
            </p>
          </div>
        </div>

        {/* Auth Mode: Verification */}
        {!isChangingPinMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Code PIN Administrateur
                </span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> Accès chiffré & protégé
                </span>
              </label>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="Ex: 2026"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-center tracking-widest font-mono text-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Déverrouiller l'Espace Super-Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPinMode(true);
                  setErrorMsg('');
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium transition cursor-pointer"
              >
                Changer mon Code PIN Administrateur
              </button>
            </div>
          </form>
        ) : (
          /* Change PIN Mode */
          <form onSubmit={handleChangePinSubmit} className="space-y-4">
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                Modification du Code PIN Secret
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Ancien Code PIN
                </label>
                <input
                  type="password"
                  placeholder="Code actuel"
                  value={oldPinConfirm}
                  onChange={(e) => setOldPinConfirm(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs text-center font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Nouveau Code PIN (Min. 4 caractères)
                </label>
                <input
                  type="password"
                  placeholder="Nouveau PIN secret"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs text-center font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsChangingPinMode(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Enregistrer le PIN
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[10px] text-slate-500 font-mono">
            Accès sécurisé réservé aux exploitants de la plateforme SaaS AutoConcession
          </p>
        </div>

      </div>
    </div>
  );
};
