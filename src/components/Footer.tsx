import React from 'react';
import { 
  Car, MapPin, Phone, Mail, Clock, ShieldCheck, Building2, 
  Sparkles, ExternalLink, UserPlus, KeyRound, Shield, CheckCircle2,
  Headphones, Send, HelpCircle, MessageSquare
} from 'lucide-react';
import { DealershipInfo, DealershipAccount, SiteAdminInfo } from '../types';
import { DEFAULT_SITE_ADMIN_INFO } from '../data/mockSaas';

interface FooterProps {
  dealership: DealershipInfo;
  siteAdminInfo?: SiteAdminInfo;
  isDealershipLoggedIn: boolean;
  isSuperAdminAuthenticated: boolean;
  currentAccount?: DealershipAccount;
  onOpenDealershipLogin: () => void;
  onOpenSuperAdminLogin: () => void;
  onOpenRegisterDealership: () => void;
  onOpenAdminDashboard: () => void;
  onOpenGarages?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  dealership,
  siteAdminInfo = DEFAULT_SITE_ADMIN_INFO,
  isDealershipLoggedIn,
  isSuperAdminAuthenticated,
  currentAccount,
  onOpenDealershipLogin,
  onOpenSuperAdminLogin,
  onOpenRegisterDealership,
  onOpenAdminDashboard,
  onOpenGarages
}) => {
  const isSomeoneLoggedIn = isDealershipLoggedIn || isSuperAdminAuthenticated;

  return (
    <footer className="bg-slate-100 text-slate-600 text-xs border-t border-slate-200 pt-12 pb-8 mt-16 font-sans relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* ========================================================================= */}
        {/* CASE 1: NO ONE IS LOGGED IN -> SITE ADMINISTRATOR & ONBOARDING PRO FOOTER */}
        {/* ========================================================================= */}
        {!isSomeoneLoggedIn ? (
          <>
            {/* Top Banner: For Prospective Dealerships & Contacts */}
            <div className="bg-white border border-amber-200 rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Vous êtes un Professionnel de l'Automobile ?</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Rejoignez notre réseau de concessions partenaires
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Contactez directement l'<strong>Administrateur du Site</strong> pour ouvrir votre espace showroom, multidiffuser vos annonces de véhicules et automatiser la réception de vos leads clients.
                  </p>
                </div>

                {/* Quick Action Buttons for New Dealerships */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <button
                    onClick={onOpenRegisterDealership}
                    className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Inscrire ma Concession (14j Gratuit)</span>
                  </button>

                  <button
                    onClick={onOpenDealershipLogin}
                    className="flex-1 sm:flex-initial bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer shadow-xs"
                  >
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Espace Déjà Membre</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main 4-Column Grid: Site Administrator Official Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Column 1: Site Admin Identity & Platform */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-xs">
                    <Shield className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block text-slate-900 leading-tight">{siteAdminInfo.nomPlateforme}</span>
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                      Administration Centrale
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {siteAdminInfo.slogan}
                </p>
                <div className="pt-1 text-[11px] text-slate-500 space-y-1 font-mono">
                  <p>SIRET : <span className="text-slate-700">{siteAdminInfo.siret}</span></p>
                  <p>RCS : <span className="text-slate-700">{siteAdminInfo.rcs}</span></p>
                  <p>TVA Intra : <span className="text-slate-700">{siteAdminInfo.tvaIntra}</span></p>
                </div>
              </div>

              {/* Column 2: Direct Administrator Contact Information */}
              <div className="space-y-3">
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-amber-600" />
                  <span>Contact Administrateur</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ligne directe réservée aux nouvelles concessions et partenariats :
                </p>
                <ul className="space-y-2.5 text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{siteAdminInfo.adresse}, {siteAdminInfo.codePostal} {siteAdminInfo.ville}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <a 
                        href={`tel:${siteAdminInfo.telephone}`} 
                        className="hover:text-emerald-700 transition font-bold text-emerald-700 block"
                      >
                        {siteAdminInfo.telephone}
                      </a>
                      <span className="text-[10px] text-slate-400">Appel direct inscriptions & support</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <a 
                        href={`mailto:${siteAdminInfo.email}?subject=Demande%20d%27inscription%20Concessionnaire%20AutoConcession`} 
                        className="hover:text-sky-700 transition font-medium text-sky-700 block"
                      >
                        {siteAdminInfo.email}
                      </a>
                      <span className="text-[10px] text-slate-400">Réponse garantie sous 2h ouvrées</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Column 3: Hours & Support Service */}
              <div className="space-y-3">
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Permanence & Support</span>
                </h4>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {siteAdminInfo.horaires}
                </p>
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Service Onboarding Disponible</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Accompagnement personnalisé pour l'import de votre parc automobile et configuration de votre vitrine.
                  </p>
                </div>
              </div>

              {/* Column 4: Solutions Pro & Portals */}
              <div className="space-y-3">
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Accès Portails & Outils</span>
                </h4>
                <ul className="space-y-2 text-slate-600">
                  {onOpenGarages && (
                    <li>
                      <button
                        onClick={onOpenGarages}
                        className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1.5 transition text-left cursor-pointer"
                      >
                        <span>🔧 Garages & SOS Panne Kinshasa (24/7)</span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={onOpenRegisterDealership}
                      className="hover:text-slate-950 flex items-center gap-1.5 transition text-left cursor-pointer"
                    >
                      <span>• Créer un compte concessionnaire</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onOpenDealershipLogin}
                      className="hover:text-slate-950 flex items-center gap-1.5 transition text-left cursor-pointer"
                    >
                      <span>• Connexion concessionnaire</span>
                    </button>
                  </li>
                  <li>
                    <a
                      href={`mailto:${siteAdminInfo.email}?subject=Demande%20de%20d%C3%A9monstration%20SaaS`}
                      className="hover:text-slate-950 flex items-center gap-1.5 transition text-left cursor-pointer"
                    >
                      <span>• Demander une démonstration</span>
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={onOpenSuperAdminLogin}
                      className="text-amber-800 hover:text-amber-900 flex items-center gap-1.5 font-semibold transition cursor-pointer pt-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Espace Super-Admin Plateforme</span>
                    </button>
                  </li>
                </ul>
              </div>

            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* CASE 2: USER / CONCESSION IS LOGGED IN -> DEALERSHIP SPECIFIC FOOTER     */
          /* ========================================================================= */
          <>
            {/* Active Session Status Bar */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-700">
                  Session active : <strong className="text-slate-900">{isSuperAdminAuthenticated ? 'Super-Administrateur Plateforme' : dealership.nom}</strong>
                  {currentAccount && !isSuperAdminAuthenticated && (
                    <span className="text-slate-500 ml-1">({currentAccount.responsableNom} • Plan {currentAccount.planId.toUpperCase()})</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenAdminDashboard}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isSuperAdminAuthenticated ? 'Console Super-Admin' : 'Mon Tableau de Bord Concession'}</span>
                </button>
              </div>
            </div>

            {/* Dealership Specific Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Info */}
              <div className="space-y-3 md:col-span-1">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
                    <Car className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span>{dealership.nom}</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{dealership.slogan}</p>
                <p className="text-[11px] text-slate-500 font-mono">SIRET : {dealership.siret}</p>
              </div>

              {/* Contact Details */}
              <div className="space-y-2">
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Contact Showroom</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{dealership.adresse}, {dealership.codePostal} {dealership.ville}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <a href={`tel:${dealership.telephone}`} className="hover:text-emerald-700 transition font-medium">{dealership.telephone}</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                    <a href={`mailto:${dealership.email}`} className="hover:text-sky-700 transition">{dealership.email}</a>
                  </li>
                </ul>
              </div>

              {/* Opening Hours */}
              <div className="space-y-2">
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Horaires Concession</h4>
                <p className="text-slate-700 leading-relaxed">{dealership.horaires}</p>
                <span className="inline-block mt-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Service Vente & Essais Ouverts
                </span>
              </div>

              {/* Support & Admin Contact for Connected Concession */}
              <div className="space-y-2">
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Support Administrateur</h4>
                <p className="text-xs text-slate-600">
                  Une question sur votre abonnement ou votre facturation ?
                </p>
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-xs shadow-xs">
                  <p className="text-slate-900 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <a href={`tel:${siteAdminInfo.telephone}`} className="hover:underline">{siteAdminInfo.telephone}</a>
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    <a href={`mailto:${siteAdminInfo.email}`} className="hover:underline truncate">{siteAdminInfo.email}</a>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM BAR: COPYRIGHT & LEGAL                                             */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-200 pt-6 flex flex-wrap justify-between items-center text-slate-500 text-[11px] gap-4">
          <div>
            <p>
              © {new Date().getFullYear()} {isSomeoneLoggedIn ? dealership.nom : siteAdminInfo.nomPlateforme}. Tous droits réservés.
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Plateforme SaaS éditée par {siteAdminInfo.nomPlateforme} • {siteAdminInfo.rcs}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-slate-500">
            <a href="#" className="hover:text-slate-800">Mentions Légales</a>
            <a href="#" className="hover:text-slate-800">Politique de Confidentialité</a>
            <a href="#" className="hover:text-slate-800">Conditions Générales de Vente (CGV)</a>
            <a 
              href={`mailto:${siteAdminInfo.email}?subject=Contact%20Administrateur%20Site`}
              className="text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              <span>Contacter l'Admin</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
