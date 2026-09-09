import React, { useState } from 'react';
import { Share2, Copy, Check, Mail } from 'lucide-react';
import { Vehicle, DealershipInfo } from '../types';
import { trackSocialShare } from '../lib/analytics';

interface SocialShareButtonsProps {
  vehicle?: Vehicle | null;
  dealership: DealershipInfo;
  className?: string;
  variant?: 'compact' | 'full' | 'pills';
  onOpenFullModal?: () => void;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  vehicle,
  dealership,
  className = '',
  variant = 'compact',
  onOpenFullModal
}) => {
  const [copied, setCopied] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://autoconcessions.fr';
  const shareUrl = vehicle 
    ? `${currentOrigin}?vehicleId=${vehicle.id}`
    : `${currentOrigin}?dealershipId=${dealership.id || 'dealership-1'}`;

  const title = vehicle
    ? `${vehicle.marque} ${vehicle.modele} ${vehicle.finition || ''} (${vehicle.annee}) - ${vehicle.prix.toLocaleString('fr-FR')} €`
    : `${dealership.nom} - Concessionnaire Automobile`;

  const summary = vehicle
    ? `À vendre chez ${dealership.nom} : ${vehicle.marque} ${vehicle.modele} (${vehicle.annee}) au prix de ${vehicle.prix.toLocaleString('fr-FR')} €.`
    : `Découvrez le showroom et toutes les offres de la concession ${dealership.nom} (${dealership.ville}).`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackSocialShare('copy_link', vehicle ? 'vehicle' : 'dealership', {
      id: vehicle?.id,
      name: vehicle ? `${vehicle.marque} ${vehicle.modele}` : dealership.nom,
      dealershipName: dealership.nom,
      price: vehicle?.prix
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareClick = (network: string) => {
    trackSocialShare(network, vehicle ? 'vehicle' : 'dealership', {
      id: vehicle?.id,
      name: vehicle ? `${vehicle.marque} ${vehicle.modele}` : dealership.nom,
      dealershipName: dealership.nom,
      price: vehicle?.prix
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(summary + ' ' + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick('whatsapp')}
          className="w-8 h-8 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 flex items-center justify-center transition"
          title="Partager sur WhatsApp"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.81 9.81 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.18 8.18 0 0 1-5.82 2.42c-1.48 0-2.93-.39-4.2-1.13l-.3-.18-3.12.82.83-3.04-.2-.31c-.81-1.3-1.24-2.8-1.24-4.34 0-4.54 3.7-8.24 8.24-8.24m4.52 10.97c-.25-.12-1.47-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.66.83-.81 1-.15.17-.3.19-.55.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.43 1.03 2.6.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z"/>
          </svg>
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick('facebook')}
          className="w-8 h-8 rounded-lg bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center transition"
          title="Partager sur Facebook"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
          </svg>
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick('twitter_x')}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition"
          title="Partager sur Twitter / X"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick('linkedin')}
          className="w-8 h-8 rounded-lg bg-[#0A66C2]/20 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white flex items-center justify-center transition"
          title="Partager sur LinkedIn"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.6 1.6 0 0 0-1.6 1.6c0 .88.72 1.6 1.6 1.6a1.6 1.6 0 0 0 1.6-1.6c0-.88-.72-1.6-1.6-1.6Z"/>
          </svg>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
          title="Copier le lien"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* More options button */}
        {onOpenFullModal && (
          <button
            onClick={onOpenFullModal}
            className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 flex items-center justify-center transition cursor-pointer"
            title="Toutes les options de partage (QR code, texte...)"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(summary + ' ' + shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleShareClick('whatsapp')}
        className="bg-[#25D366] hover:bg-[#1eae52] text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow-sm transition"
      >
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.81 9.81 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.18 8.18 0 0 1-5.82 2.42c-1.48 0-2.93-.39-4.2-1.13l-.3-.18-3.12.82.83-3.04-.2-.31c-.81-1.3-1.24-2.8-1.24-4.34 0-4.54 3.7-8.24 8.24-8.24m4.52 10.97c-.25-.12-1.47-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.66.83-.81 1-.15.17-.3.19-.55.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.43 1.03 2.6.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z"/>
        </svg>
        <span>WhatsApp</span>
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleShareClick('facebook')}
        className="bg-[#1877F2] hover:bg-[#125ecc] text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow-sm transition"
      >
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
        </svg>
        <span>Facebook</span>
      </a>

      <button
        onClick={handleCopy}
        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs border border-slate-700 transition cursor-pointer"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copié !' : 'Copier Lien'}</span>
      </button>

      {onOpenFullModal && (
        <button
          onClick={onOpenFullModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow-sm transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Partager...</span>
        </button>
      )}
    </div>
  );
};
