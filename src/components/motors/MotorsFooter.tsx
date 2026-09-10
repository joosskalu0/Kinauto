import React from 'react';
import { MotorsLogo } from './MotorsLogo';
import { Wrench, Shield, Car, Heart, Phone, Mail, MapPin } from 'lucide-react';

interface MotorsFooterProps {
  onNavigate: (view: string) => void;
  openAuthModal: () => void;
}

export const MotorsFooter: React.FC<MotorsFooterProps> = ({ onNavigate, openAuthModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: AutoConcession Brand Info */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-xl inline-block shadow-sm">
              <MotorsLogo size="md" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AutoConcession Kinshasa — Plateforme automobile de référence pour l'achat, la vente de véhicules neufs et d'occasion certifiés, et le dépannage d'urgence 24/7.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Kinshasa (Gombe, Limete, Ngaliema)</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>+243 820 000 000</span>
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <button onClick={() => onNavigate('public')} className="hover:text-white transition cursor-pointer">
                  Inventory / Catalogue
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('garages')} className="hover:text-white transition cursor-pointer flex items-center gap-1.5 text-blue-400">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>SOS Dépannage Kinshasa</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('super-admin')} className="hover:text-white transition cursor-pointer">
                  Administration SaaS
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Profiles & Pro Access */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Espace Professionnel</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <button onClick={openAuthModal} className="hover:text-white transition cursor-pointer">
                  Dealer Profile (Concessionnaires)
                </button>
              </li>
              <li>
                <button onClick={openAuthModal} className="hover:text-white transition cursor-pointer">
                  Seller Profile (Vendeurs Agréés)
                </button>
              </li>
              <li>
                <button onClick={openAuthModal} className="hover:text-white transition cursor-pointer text-blue-400">
                  Créer un compte Concessionnaire
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Guarantee */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Garanties & Confiance</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Véhicules Certifiés & Contrôlés</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Car className="w-3.5 h-3.5 text-blue-400" />
                <span>Historique CARFAX & AutoCheck</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Service Client & Assistance 24/7</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 AutoConcession Kinshasa. Tous droits réservés.</p>
          <div className="flex items-center gap-4 font-semibold text-slate-400">
            <button onClick={openAuthModal} className="hover:text-white transition cursor-pointer">
              Dealer Profile
            </button>
            <span>|</span>
            <button onClick={openAuthModal} className="hover:text-white transition cursor-pointer">
              Seller Profile
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
