import React, { useState } from 'react';
import { 
  X, Phone, MessageSquare, MapPin, Clock, ShieldCheck, 
  Star, Wrench, Award, CheckCircle2, ChevronRight, AlertTriangle, 
  Truck, DollarSign, Calendar, Navigation, Share2, Sparkles, User,
  Mail, Check, ExternalLink, HelpCircle, Shield, Copy, Camera
} from 'lucide-react';
import { GarageProfile } from '../../types';
import { GARAGE_SPECIALTY_LABELS } from '../../data/mockGarages';

interface GarageDetailModalProps {
  garage: GarageProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestBreakdown: (garage: GarageProfile) => void;
}

export const GarageDetailModal: React.FC<GarageDetailModalProps> = ({
  garage,
  isOpen,
  onClose,
  onRequestBreakdown
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!isOpen || !garage) return null;

  const handleCopyPhone = (phoneNum: string) => {
    navigator.clipboard.writeText(phoneNum);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${garage.adresse}, ${garage.repere}, ${garage.commune} - Kinshasa`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleWhatsApp = () => {
    const cleanNum = garage.whatsapp.replace(/\D/g, '') || garage.telephonePrincipal.replace(/\D/g, '');
    const msg = `Bonjour ${garage.nom}, je vous contacte depuis AutoConcession Kinshasa concernant vos services d'atelier / dépannage automobile.`;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const activePhoto = garage.photos && garage.photos.length > 0 
    ? (garage.photos[selectedPhotoIndex] || garage.photos[0])
    : 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full text-slate-100 shadow-2xl overflow-hidden my-4 sm:my-8">
        
        {/* Top Header Image & Badges */}
        <div className="relative bg-slate-950">
          <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-slate-950">
            <img 
              src={activePhoto} 
              alt={garage.nom}
              className="w-full h-full object-cover transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-950/85 hover:bg-slate-800 text-slate-200 hover:text-white p-2.5 rounded-full border border-slate-700 transition cursor-pointer z-10 shadow-lg"
            title="Fermer la fiche"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10 max-w-[80%]">
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Kinshasa • {garage.commune}</span>
            </span>

            {garage.estDepannageMobile24h && (
              <span className="bg-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-pulse">
                <Truck className="w-3.5 h-3.5" />
                <span>Dépannage SOS 24/7</span>
              </span>
            )}

            {garage.estCertifie && (
              <span className="bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Atelier Vérifié</span>
              </span>
            )}
          </div>

          {/* Photo Gallery Thumbnails Bar */}
          {garage.photos && garage.photos.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar z-10">
              <div className="bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-xl">
                <span className="text-[10px] text-amber-400 font-bold px-2 flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {garage.photos.length} photos :
                </span>
                {garage.photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`h-11 w-14 rounded-lg overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      selectedPhotoIndex === idx ? 'border-amber-400 scale-105 shadow-md' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* SECTION 1: HEADER TITLE & RESPONSABLE */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-slate-800 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Fiche Technique Officielle
                </span>
                <span className="text-xs text-slate-400">Réf. {garage.id}</span>
              </div>

              {/* Nom du Garage */}
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {garage.nom}
              </h2>

              {/* Responsable & Titre */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Maître Responsable : <strong className="text-white">{garage.responsable}</strong></span>
                </div>
                {garage.titreResponsable && (
                  <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-300 font-medium">
                    {garage.titreResponsable}
                  </div>
                )}
              </div>
            </div>

            {/* Note & Avis */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(garage.noteGlobale || 5) ? 'fill-amber-400' : 'text-slate-700'}`} 
                    />
                  ))}
                </div>
                <span className="font-black text-white text-base ml-1">{garage.noteGlobale || 5.0}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {garage.nombreAvis || 1} avis client{(garage.nombreAvis || 1) > 1 ? 's' : ''} vérifié{(garage.nombreAvis || 1) > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* SECTION 2: QUICK ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={`tel:${garage.telephonePrincipal.replace(/\s+/g, '')}`}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-98"
            >
              <Phone className="w-4 h-4" />
              <span>Appeler : {garage.telephonePrincipal}</span>
            </a>

            <button
              onClick={handleWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black p-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp (Position & Devis)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onRequestBreakdown(garage);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-black p-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer active:scale-98"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Déclencher SOS Panne</span>
            </button>
          </div>

          {/* SECTION 3: EMPLACEMENT & REPÈRES KINSHASA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Address & Landmark */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Localisation Exacte Kinshasa
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                  title="Copier l'adresse"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedAddress ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-white font-bold flex items-center gap-1.5">
                  <span className="text-slate-400">Commune :</span> {garage.commune}
                </p>
                <p className="text-xs text-slate-200 leading-relaxed">
                  <span className="text-slate-400">Adresse :</span> {garage.adresse}
                </p>
              </div>

              {/* Landmark Highlight */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                <span className="text-[10px] text-amber-400 font-bold uppercase block mb-0.5">
                  Repère Visuel & Accès :
                </span>
                <p className="text-xs text-amber-200 font-semibold">
                  {garage.repere}
                </p>
              </div>
            </div>

            {/* Hours & Availability */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Horaires & Disponibilité
              </span>

              <div className="space-y-1.5">
                <p className="text-xs text-slate-300 font-medium">
                  <span className="text-slate-400">Horaires d'atelier :</span> {garage.horaires}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  garage.ouvertDimanche 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{garage.ouvertDimanche ? 'Ouvert le Dimanche' : 'Fermé le Dimanche'}</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  garage.estDepannageMobile24h 
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>{garage.estDepannageMobile24h ? 'SOS Mobile 24/7' : 'En atelier uniquement'}</span>
                </div>
              </div>

              {/* Extra contacts if available */}
              {(garage.telephoneUrgence || garage.email) && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  {garage.telephoneUrgence && (
                    <p className="flex items-center gap-1.5">
                      <span className="text-slate-500">Urgence Nuit :</span>
                      <strong className="text-rose-400 font-mono">{garage.telephoneUrgence}</strong>
                    </p>
                  )}
                  {garage.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300">{garage.email}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: PRÉSENTATION DE L'ATELIER */}
          <div className="space-y-2.5 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Présentation de l'Établissement & Compétences
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              {garage.description}
            </p>
          </div>

          {/* SECTION 5: SERVICES INCLUS & ENGAGEMENTS */}
          {garage.servicesInclus && garage.servicesInclus.length > 0 && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Services Inclus & Engagements Qualité
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {garage.servicesInclus.map((srv, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: SPÉCIALITÉS TECHNIQUES */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> Spécialités Techniques & Équipements
              </h3>
              <span className="text-[11px] text-slate-400">
                {garage.specialites.length} compétence{garage.specialites.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {garage.specialites.map((spec) => {
                const info = GARAGE_SPECIALTY_LABELS[spec];
                return (
                  <span 
                    key={spec}
                    className="bg-slate-900 text-slate-100 border border-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                    <span>{info?.label || spec}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* SECTION 7: MARQUES PRISES EN CHARGE */}
          {garage.marquesExpertise && garage.marquesExpertise.length > 0 && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Marques Automobiles Maîtrisées
              </h3>
              <div className="flex flex-wrap gap-2">
                {garage.marquesExpertise.map((b) => (
                  <span key={b} className="bg-slate-900 text-amber-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-semibold">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: TARIFS INDICATIFS DES PRESTATIONS */}
          {garage.tarifsIndicatifs && garage.tarifsIndicatifs.length > 0 && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Grille Tarifaire Indicative (Kinshasa)
                </h3>
                <span className="text-[10px] text-slate-400">Devis final gratuit sur place</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {garage.tarifsIndicatifs.map((t, idx) => (
                  <div key={idx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-white block">{t.prestation}</span>
                      {t.description && <span className="text-[11px] text-slate-400 block">{t.description}</span>}
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 font-mono font-black text-xs px-3 py-1.5 rounded-xl shrink-0 border border-emerald-500/30">
                      {t.prixEstime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: AVIS CLIENTS KINSHASA */}
          {garage.avisClients && garage.avisClients.length > 0 && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400" /> Avis & Expériences Clients Vérifiées
              </h3>
              <div className="space-y-2.5">
                {garage.avisClients.map((rev) => (
                  <div key={rev.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rev.auteur}</span>
                        <span className="text-[10px] text-slate-400">({rev.commune})</span>
                        {rev.vehicule && (
                          <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-slate-800 font-medium">
                            {rev.vehicule}
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(rev.note || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 italic leading-relaxed">"{rev.commentaire}"</p>
                    <span className="text-[10px] text-slate-500 block">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={() => handleCopyPhone(garage.telephonePrincipal)}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer font-medium"
            >
              {copiedPhone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Phone className="w-4 h-4 text-amber-400" />}
              <span>{copiedPhone ? 'Numéro copié !' : `Copier : ${garage.telephonePrincipal}`}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
