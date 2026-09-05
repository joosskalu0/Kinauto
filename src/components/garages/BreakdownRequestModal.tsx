import React, { useState, useRef, useEffect } from 'react';
import { 
  X, AlertTriangle, Phone, MapPin, Send, CheckCircle2, 
  Car, Clock, Wrench, ShieldAlert, Sparkles, MessageSquare,
  Camera, Image as ImageIcon, Trash2, Building2
} from 'lucide-react';
import { GarageProfile, KinshasaCommune, BreakdownRequest } from '../../types';
import { KINSHASA_COMMUNES } from '../../data/mockGarages';

interface BreakdownRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGarage?: GarageProfile | null;
  availableGarages?: GarageProfile[];
  onSubmitRequest: (request: BreakdownRequest) => void;
}

export const BreakdownRequestModal: React.FC<BreakdownRequestModalProps> = ({
  isOpen,
  onClose,
  selectedGarage,
  availableGarages = [],
  onSubmitRequest
}) => {
  const [chosenGarageId, setChosenGarageId] = useState<string>(selectedGarage?.id || 'BROADCAST');
  const [clientNom, setClientNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [communePanne, setCommunePanne] = useState<KinshasaCommune>(selectedGarage?.commune || 'Gombe');
  const [adresseLieuPanne, setAdresseLieuPanne] = useState('');
  const [marqueVehicule, setMarqueVehicule] = useState('');
  const [modeleVehicule, setModeleVehicule] = useState('');
  const [typePanne, setTypePanne] = useState<BreakdownRequest['typePanne']>('demarrage');
  const [descriptionPanne, setDescriptionPanne] = useState('');
  const [besoinRemorquage, setBesoinRemorquage] = useState(false);
  const [photosPanne, setPhotosPanne] = useState<string[]>([]);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync selected garage when modal opens
  useEffect(() => {
    if (selectedGarage) {
      setChosenGarageId(selectedGarage.id);
      setCommunePanne(selectedGarage.commune);
    } else {
      setChosenGarageId('BROADCAST');
    }
  }, [selectedGarage, isOpen]);

  if (!isOpen) return null;

  // Find targeted garage
  const activeTargetGarage = chosenGarageId !== 'BROADCAST' 
    ? (availableGarages.find(g => g.id === chosenGarageId) || selectedGarage || null)
    : null;

  // Handle phone file upload (camera / gallery)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhoto(true);
    const readers: Promise<string>[] = [];

    Array.from(files).forEach((file: File) => {
      const p = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject('Erreur lecture');
          }
        };
        reader.onerror = () => reject('Erreur');
        reader.readAsDataURL(file);
      });
      readers.push(p);
    });

    Promise.all(readers)
      .then((images) => {
        setPhotosPanne((prev) => [...prev, ...images]);
        setIsProcessingPhoto(false);
      })
      .catch((err) => {
        console.error('Erreur photo:', err);
        setIsProcessingPhoto(false);
      });

    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotosPanne((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom.trim() || !telephone.trim() || !adresseLieuPanne.trim()) {
      alert("Veuillez renseigner votre nom, votre numéro de téléphone et l'emplacement exact de la panne à Kinshasa.");
      return;
    }

    setIsSubmitting(true);
    const newRequest: BreakdownRequest = {
      id: `sos-${Date.now()}`,
      garageId: activeTargetGarage ? activeTargetGarage.id : undefined,
      garageNom: activeTargetGarage ? activeTargetGarage.nom : `Diffusion Dépanneurs ${communePanne}`,
      clientNom: clientNom.trim(),
      telephone: telephone.trim(),
      communePanne,
      adresseLieuPanne: adresseLieuPanne.trim(),
      marqueVehicule: marqueVehicule.trim(),
      modeleVehicule: modeleVehicule.trim(),
      typePanne,
      descriptionPanne: descriptionPanne.trim(),
      besoinRemorquage,
      photosPanne,
      statut: 'en_attente',
      dateDemande: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmitRequest(newRequest);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  const handleOpenWhatsAppDirect = () => {
    const targetPhone = activeTargetGarage?.whatsapp || '243829450112';
    const garageNomAffiche = activeTargetGarage?.nom || `Réseau Dépanneurs Kinshasa (${communePanne})`;
    
    const message = `🚨 *URGENCE SOS PANNE KINSHASA*\n\n` +
      `🏢 *Destinataire :* ${garageNomAffiche}\n` +
      `👤 *Client :* ${clientNom || 'Automobiliste en panne'}\n` +
      `📞 *Tél d'urgence :* ${telephone}\n` +
      `📍 *Localisation :* ${communePanne} - ${adresseLieuPanne}\n` +
      `🚗 *Véhicule :* ${marqueVehicule || 'Véhicule'} ${modeleVehicule}\n` +
      `⚠️ *Type de Panne :* ${typePanne} (${besoinRemorquage ? 'Remorquage Plateau Requis' : 'Dépannage sur place'})\n` +
      `📸 *Photos jointes :* ${photosPanne.length > 0 ? `${photosPanne.length} photo(s) disponible(s)` : 'Non'}\n` +
      `📝 *Précisions :* ${descriptionPanne || 'Véhicule immobilisé, besoin d\'une assistance immédiate'}\n\n` +
      `👉 *Pouvez-vous confirmer la prise en charge ou envoyer un dépanneur ? Merci.*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-2xl w-full text-slate-100 shadow-2xl overflow-hidden my-4 sm:my-8">
        
        {/* Hidden inputs for phone uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-rose-500/30 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-lg shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  SOS Dépannage Immédiat
                </span>
                <span className="text-xs text-rose-300 font-bold hidden sm:inline">Kinshasa 24/7</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Formulaire d'Assistance & Dépanneur d'Urgence
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="space-y-6 text-center py-8 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Demande de secours transmise !</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Votre alerte de panne à <strong className="text-amber-400">{communePanne}</strong> a été transmise à <strong className="text-white">{activeTargetGarage ? activeTargetGarage.nom : `tous les dépanneurs de ${communePanne}`}</strong>.
                </p>
              </div>

              {/* Direct WhatsApp Action */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-left">
                <p className="text-xs text-slate-300 font-medium">
                  Pour aller plus vite et envoyer directement votre localisation GPS et vos photos au dépanneur :
                </p>
                <button
                  type="button"
                  onClick={handleOpenWhatsAppDirect}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Envoyer ma Position & Message sur WhatsApp ({activeTargetGarage ? activeTargetGarage.nom : 'Dépanneur'})</span>
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {activeTargetGarage?.telephonePrincipal && (
                  <a
                    href={`tel:${activeTargetGarage.telephonePrincipal.replace(/\s+/g, '')}`}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Appeler Directement ({activeTargetGarage.telephonePrincipal})</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* SECTION: NOM DU GARAGE / ATELIER CIBLÉ (PROMINENT) */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    Garage & Dépanneur Destinataire
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    Kinshasa
                  </span>
                </div>

                {/* Dropdown / Selection of Garage */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Choisissez le garage auquel envoyer cette demande :
                  </label>
                  <select
                    value={chosenGarageId}
                    onChange={(e) => setChosenGarageId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="BROADCAST">
                      🚨 Diffusion d'urgence à TOUS les dépanneurs disponibles ({communePanne})
                    </option>
                    {availableGarages.map((g) => (
                      <option key={g.id} value={g.id}>
                        🔧 {g.nom} — {g.commune} ({g.responsable} • {g.telephonePrincipal})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Garage details preview if selected */}
                {activeTargetGarage && (
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/30 flex items-start justify-between gap-3 text-slate-300 animate-fadeIn">
                    <div className="space-y-1">
                      <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                        <span className="text-amber-400">🔧</span>
                        {activeTargetGarage.nom}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Responsable : <strong className="text-slate-200">{activeTargetGarage.responsable}</strong> • {activeTargetGarage.commune} ({activeTargetGarage.repere})
                      </p>
                      <p className="text-[11px] text-amber-400 font-mono font-bold">
                        Tél direct : {activeTargetGarage.telephonePrincipal}
                      </p>
                    </div>
                    {activeTargetGarage.estDepannageMobile24h && (
                      <span className="bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shrink-0 uppercase">
                        24/7
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION: CLIENT CONTACTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Votre Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Christian Malonda"
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Votre Téléphone (Appel direct / WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +243 82 000 0000"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SECTION: LIEU EXACT DE LA PANNE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Commune où vous êtes immobilisé *
                  </label>
                  <select
                    value={communePanne}
                    onChange={(e) => setCommunePanne(e.target.value as KinshasaCommune)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    {KINSHASA_COMMUNES.map((com) => (
                      <option key={com} value={com}>📍 {com}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Avenue & Repère précis à Kinshasa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bd du 30 Juin, en face Socimat"
                    value={adresseLieuPanne}
                    onChange={(e) => setAdresseLieuPanne(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SECTION: VÉHICULE & PANNE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Marque du Véhicule</label>
                  <input
                    type="text"
                    placeholder="Ex: Toyota, Mercedes, Hyundai..."
                    value={marqueVehicule}
                    onChange={(e) => setMarqueVehicule(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Modèle / Année</label>
                  <input
                    type="text"
                    placeholder="Ex: RAV4, Prado TXL, Hilux, Corolla..."
                    value={modeleVehicule}
                    onChange={(e) => setModeleVehicule(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Nature de la Panne */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Nature du Problème</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'demarrage', label: '⚡ Batterie / Démarreur' },
                    { id: 'moteur_chauffe', label: '🔥 Surchauffe / Eau Moteur' },
                    { id: 'crevaison', label: '🛞 Crevaison / Roue' },
                    { id: 'freins', label: '🛑 Freinage / Blocage' },
                    { id: 'accident_remorquage', label: '🚚 Remorquage Plateau' },
                    { id: 'autre', label: '⚙️ Autre Panne Mécanique' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTypePanne(item.id as any)}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        typePanne === item.id
                          ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] block">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Remorquage checkbox */}
              <label className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                <div>
                  <span className="font-bold text-white block">Besoin d'un camion dépanneur / remorquage plateau ?</span>
                  <span className="text-[10px] text-slate-400">Le véhicule ne peut pas du tout rouler</span>
                </div>
                <input
                  type="checkbox"
                  checked={besoinRemorquage}
                  onChange={(e) => setBesoinRemorquage(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </label>

              {/* SECTION: AJOUTER UNE PHOTO DEPUIS LE TÉLÉPHONE */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Photo de la panne (Directement depuis votre Téléphone)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {photosPanne.length} photo{photosPanne.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Prendre Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>Galerie Téléphone</span>
                  </button>
                </div>

                {isProcessingPhoto && (
                  <p className="text-[11px] text-amber-400 text-center animate-pulse">
                    Chargement de la photo...
                  </p>
                )}

                {/* Photo Previews */}
                {photosPanne.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {photosPanne.map((photo, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 group">
                        <img src={photo} alt="Panne" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-90 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional details */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Précisions supplémentaires sur la panne</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Le moteur s'est coupé subitement, voyant rouge batterie allumé..."
                  value={descriptionPanne}
                  onChange={(e) => setDescriptionPanne(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppDirect}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Direct</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition cursor-pointer"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black py-3 px-6 rounded-xl shadow-lg shadow-rose-500/25 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Envoi...' : 'Déclencher Secours Panne'}</span>
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
