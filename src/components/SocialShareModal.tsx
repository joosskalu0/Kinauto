import React, { useState, useEffect } from 'react';
import { 
  X, Share2, Copy, Check, QrCode, Mail, Smartphone, 
  ExternalLink, Sparkles, CheckCircle2, FileText, ArrowRight,
  Eye, Building2, Tag, Car
} from 'lucide-react';
import { Vehicle, DealershipInfo } from '../types';
import { trackSocialShare } from '../lib/analytics';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  dealership: DealershipInfo;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  dealership
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAdText, setCopiedAdText] = useState(false);
  const [activeTab, setActiveTab] = useState<'networks' | 'adText' | 'qrcode'>('networks');
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://autoconcessions.fr';
  const shareUrl = vehicle 
    ? `${currentOrigin}?vehicleId=${vehicle.id}`
    : `${currentOrigin}?dealershipId=${dealership.id || 'dealership-1'}`;

  const isVehicleShare = Boolean(vehicle);

  const title = isVehicleShare && vehicle
    ? `${vehicle.marque} ${vehicle.modele} ${vehicle.finition || ''} (${vehicle.annee}) - ${vehicle.prix.toLocaleString('fr-FR')} €`
    : `${dealership.nom} - Concessionnaire & Vente de Véhicules d'Exception`;

  const vehicleSummary = vehicle 
    ? `🚗 ${vehicle.marque} ${vehicle.modele} ${vehicle.finition || ''}
💰 Prix : ${vehicle.prix.toLocaleString('fr-FR')} €
📅 Année : ${vehicle.annee} | ⚡ ${vehicle.puissanceCh} ch
⛽ ${vehicle.carburant} | 🕹️ ${vehicle.transmission} | 🛣️ ${vehicle.kilometrage.toLocaleString('fr-FR')} km
📍 Disponible chez ${dealership.nom} (${dealership.ville})
📞 Contact : ${dealership.telephone}`
    : `🏢 Retrouvez tout le stock de véhicules chez ${dealership.nom} à ${dealership.ville} !
🚗 Large choix de véhicules récents, garantis et révisés.
📍 ${dealership.adresse}, ${dealership.codePostal} ${dealership.ville}
📞 ${dealership.telephone} | ✉️ ${dealership.email}`;

  const adTextFormatted = isVehicleShare && vehicle
    ? `🔥 À VENDRE : ${vehicle.marque.toUpperCase()} ${vehicle.modele.toUpperCase()} ${vehicle.finition ? vehicle.finition.toUpperCase() : ''} (${vehicle.annee})

✨ PRIX EXCLUSIF : ${vehicle.prix.toLocaleString('fr-FR')} €
📍 CONCESSION : ${dealership.nom} (${dealership.ville})

📋 CARACTÉRISTIQUES PRINCIPALES :
• Kilométrage : ${vehicle.kilometrage.toLocaleString('fr-FR')} km
• Motorisation : ${vehicle.carburant} (${vehicle.puissanceCh} ch)
• Boîte de vitesse : ${vehicle.transmission}
• Énergie : ${vehicle.consommation || 'Faible conso'}
• État : ${vehicle.etat === 'neuf' ? 'Neuf 0 km' : 'Occasion certifiée'}

⭐ ÉQUIPEMENTS INCLUS :
${vehicle.equipements.slice(0, 6).map(e => `• ${e}`).join('\n')}

🛡️ Véhicule révisé et sous garantie constructeur/concession.
Possibilité de reprise de votre ancien véhicule et financement sur mesure.

🔗 Consulter la fiche complète avec photos HD :
${shareUrl}

📞 Contactez-nous dès maintenant au ${dealership.telephone} ou par email à ${dealership.email}`
    : `🚗 DÉCOUVREZ LE PARC AUTOMOBILE DE ${dealership.nom.toUpperCase()} !

📍 Situé à ${dealership.ville} (${dealership.codePostal}), découvrez notre sélection de véhicules neufs et d'occasion certifiés.
🛡️ Tous nos véhicules sont révisés avec garantie et possibilité de reprise & financement.

🔗 Visitez notre showroom en ligne :
${shareUrl}
📞 Téléphone : ${dealership.telephone}
✉️ Email : ${dealership.email}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    trackSocialShare('copy_link', isVehicleShare ? 'vehicle' : 'dealership', {
      id: vehicle?.id,
      name: isVehicleShare ? `${vehicle?.marque} ${vehicle?.modele}` : dealership.nom,
      dealershipName: dealership.nom,
      price: vehicle?.prix
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyAdText = () => {
    navigator.clipboard.writeText(adTextFormatted);
    setCopiedAdText(true);
    trackSocialShare('copy_ad_text', isVehicleShare ? 'vehicle' : 'dealership', {
      id: vehicle?.id,
      name: isVehicleShare ? `${vehicle?.marque} ${vehicle?.modele}` : dealership.nom,
      dealershipName: dealership.nom
    });
    setTimeout(() => setCopiedAdText(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: vehicleSummary,
        url: shareUrl
      }).then(() => {
        trackSocialShare('native_share_sheet', isVehicleShare ? 'vehicle' : 'dealership', {
          id: vehicle?.id,
          name: isVehicleShare ? `${vehicle?.marque} ${vehicle?.modele}` : dealership.nom,
          dealershipName: dealership.nom
        });
      }).catch(() => {});
    }
  };

  const onSocialClick = (networkName: string) => {
    trackSocialShare(networkName, isVehicleShare ? 'vehicle' : 'dealership', {
      id: vehicle?.id,
      name: isVehicleShare ? `${vehicle?.marque} ${vehicle?.modele}` : dealership.nom,
      dealershipName: dealership.nom,
      price: vehicle?.prix
    });
  };

  // Generate SVG QR Code URL via reliable public API
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&color=0f172a&bgcolor=ffffff&margin=10`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col font-sans">
        
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Partager sur les réseaux sociaux
              </h2>
              <p className="text-xs text-slate-400">
                {isVehicleShare && vehicle 
                  ? `${vehicle.marque} ${vehicle.modele} ${vehicle.finition || ''}` 
                  : dealership.nom}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Preview Card Summary */}
        {vehicle && (
          <div className="px-5 pt-4 pb-2 bg-slate-950/60 border-b border-slate-800/80">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
              <img
                src={vehicle.images[0] || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300"}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                className="w-16 h-12 object-cover rounded-lg shrink-0 border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-white truncate">
                    {vehicle.marque} {vehicle.modele}
                  </h4>
                  <span className="font-black text-amber-400 text-sm whitespace-nowrap">
                    {vehicle.prix.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>{vehicle.annee}</span>
                  <span>•</span>
                  <span>{vehicle.kilometrage.toLocaleString('fr-FR')} km</span>
                  <span>•</span>
                  <span className="text-sky-400">{vehicle.carburant}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('networks')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'networks'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Réseaux & Applications</span>
          </button>

          <button
            onClick={() => setActiveTab('adText')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'adText'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Texte d'annonce prêt</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'qrcode'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: SOCIAL NETWORKS */}
          {activeTab === 'networks' && (
            <div className="space-y-4">
              
              {/* Native System Share Banner (iOS/Android/Mac/Windows) */}
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black p-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer text-sm"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Partager avec le menu de votre appareil (AirDrop, Insta, SMS...)</span>
                </button>
              )}

              {/* Social Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(vehicleSummary + '\n\n🔗 ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onSocialClick('whatsapp')}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black p-3 rounded-xl flex items-center gap-2.5 transition text-xs shadow-md group"
                >
                  <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.81 9.81 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.18 8.18 0 0 1-5.82 2.42c-1.48 0-2.93-.39-4.2-1.13l-.3-.18-3.12.82.83-3.04-.2-.31c-.81-1.3-1.24-2.8-1.24-4.34 0-4.54 3.7-8.24 8.24-8.24m4.52 10.97c-.25-.12-1.47-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.66.83-.81 1-.15.17-.3.19-.55.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.43 1.03 2.6.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z"/>
                  </svg>
                  <span className="truncate">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onSocialClick('facebook')}
                  className="bg-[#1877F2] hover:bg-[#1567d3] text-white font-extrabold p-3 rounded-xl flex items-center gap-2.5 transition text-xs shadow-md group"
                >
                  <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
                  </svg>
                  <span className="truncate">Facebook</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onSocialClick('linkedin')}
                  className="bg-[#0A66C2] hover:bg-[#08529c] text-white font-extrabold p-3 rounded-xl flex items-center gap-2.5 transition text-xs shadow-md group"
                >
                  <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.6 1.6 0 0 0-1.6 1.6c0 .88.72 1.6 1.6 1.6a1.6 1.6 0 0 0 1.6-1.6c0-.88-.72-1.6-1.6-1.6Z"/>
                  </svg>
                  <span className="truncate">LinkedIn</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&hashtags=Auto,Voiture,Occasion,Dealership`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onSocialClick('twitter_x')}
                  className="bg-black hover:bg-slate-950 border border-slate-700 text-white font-extrabold p-3 rounded-xl flex items-center gap-2.5 transition text-xs shadow-md group"
                >
                  <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="truncate">Twitter / X</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onSocialClick('telegram')}
                  className="bg-[#24A1DE] hover:bg-[#1f8ec4] text-white font-extrabold p-3 rounded-xl flex items-center gap-2.5 transition text-xs shadow-md group"
                >
                  <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .39z"/>
                  </svg>
                  <span className="truncate">Telegram</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(vehicleSummary + '\n\nConsultez l\'annonce en ligne ici :\n' + shareUrl)}`}
                  onClick={() => onSocialClick('email')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold p-3 rounded-xl flex items-center gap-2.5 transition text-xs shadow-md group"
                >
                  <Mail className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Par Email</span>
                </a>
              </div>

              {/* Copy URL Link Section */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Lien direct vers l'annonce
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-xs text-slate-300 px-2 outline-none select-all truncate font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Lien Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: READY-TO-USE AD TEXT */}
          {activeTab === 'adText' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Texte formaté pour vos publications (Facebook Marketplace, Leboncoin, Instagram, Groupes auto...) :
                </p>
                <button
                  onClick={handleCopyAdText}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                    copiedAdText 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {copiedAdText ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Texte copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier tout le texte</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={10}
                value={adTextFormatted}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed resize-none focus:border-amber-500 focus:outline-none select-all"
              />
            </div>
          )}

          {/* TAB 3: QR CODE */}
          {activeTab === 'qrcode' && (
            <div className="text-center space-y-4 py-2">
              <p className="text-xs text-slate-300">
                Scannez ce QR Code avec un smartphone pour ouvrir directement la fiche de ce véhicule :
              </p>

              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border border-slate-700">
                <img
                  src={qrCodeApiUrl}
                  alt="QR Code Annonce"
                  className="w-48 h-48 mx-auto"
                />
                <p className="text-[11px] font-black text-slate-900 mt-2 uppercase tracking-wide">
                  {dealership.nom}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <a
                  href={qrCodeApiUrl}
                  download={`qrcode-${vehicle?.marque || 'dealership'}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 inline-flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>Ouvrir l'image du QR Code</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Partage immédiat et sécurisé sans inscription requise</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
