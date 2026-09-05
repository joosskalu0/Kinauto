import React, { useState, useRef } from 'react';
import { 
  X, Wrench, Building2, MapPin, Phone, MessageSquare, 
  Clock, ShieldCheck, CheckCircle2, Send, Sparkles, PlusCircle,
  Camera, Image as ImageIcon, Trash2, UploadCloud, AlertCircle,
  Car, UserCheck, DollarSign, Layers, Check
} from 'lucide-react';
import { GarageProfile, KinshasaCommune, GarageSpecialty } from '../../types';
import { KINSHASA_COMMUNES, GARAGE_SPECIALTY_LABELS } from '../../data/mockGarages';

interface RegisterGarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterGarage: (garage: GarageProfile) => void;
}

const PRESET_GARAGE_PHOTOS = [
  'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
];

export const RegisterGarageModal: React.FC<RegisterGarageModalProps> = ({
  isOpen,
  onClose,
  onRegisterGarage
}) => {
  // Form fields
  const [nom, setNom] = useState('');
  const [slogan, setSlogan] = useState('');
  const [responsable, setResponsable] = useState('');
  const [titreResponsable, setTitreResponsable] = useState("Maître Chef d'Atelier");
  const [commune, setCommune] = useState<KinshasaCommune>('Gombe');
  const [quartier, setQuartier] = useState('');
  const [adresse, setAdresse] = useState('');
  const [repere, setRepere] = useState('');
  const [telephonePrincipal, setTelephonePrincipal] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telephoneUrgence, setTelephoneUrgence] = useState('');
  const [email, setEmail] = useState('');
  const [horaires, setHoraires] = useState('Lun - Sam: 07h30 - 18h30 • Dépannage 24/7');
  const [ouvertDimanche, setOuvertDimanche] = useState(true);
  const [estDepannageMobile24h, setEstDepannageMobile24h] = useState(true);
  const [description, setDescription] = useState('');
  const [marquesExpertiseText, setMarquesExpertiseText] = useState('Toyota, Mercedes-Benz, Hyundai, Nissan, Lexus, Kia');
  const [selectedSpecialties, setSelectedSpecialties] = useState<GarageSpecialty[]>([
    'Mecanique_Generale',
    'Diagnostic_Electronique',
    'Depannage_Urgence_24h',
    'Electricite_Auto'
  ]);
  
  // Photos from phone or URLs
  const [photos, setPhotos] = useState<string[]>([
    PRESET_GARAGE_PHOTOS[0]
  ]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle phone file upload (gallery or multiple)
  const handlePhoneFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            reject('Erreur de lecture');
          }
        };
        reader.onerror = () => reject('Erreur');
        reader.readAsDataURL(file);
      });
      readers.push(p);
    });

    Promise.all(readers)
      .then((base64Images) => {
        // If current photos only had the initial default preset and user uploaded new ones, replace it
        if (photos.length === 1 && photos[0] === PRESET_GARAGE_PHOTOS[0]) {
          setPhotos(base64Images);
        } else {
          setPhotos((prev) => [...prev, ...base64Images]);
        }
        setIsProcessingPhoto(false);
      })
      .catch((err) => {
        console.error('Erreur import photo téléphone:', err);
        setIsProcessingPhoto(false);
      });

    // Reset input so user can re-upload if needed
    if (e.target) e.target.value = '';
  };

  const handleAddUrlPhoto = () => {
    if (!urlInput.trim()) return;
    setPhotos((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      return filtered.length > 0 ? filtered : [PRESET_GARAGE_PHOTOS[0]];
    });
  };

  const toggleSpecialty = (spec: GarageSpecialty) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !responsable.trim() || !telephonePrincipal.trim() || !adresse.trim() || !repere.trim()) {
      alert("Veuillez renseigner les champs obligatoires : Nom du garage, Responsable, Téléphone, Adresse et Repère.");
      return;
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '') || telephonePrincipal.replace(/\D/g, '');
    const marquesArr = marquesExpertiseText
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const fullAdresse = quartier ? `${adresse} (${quartier})` : adresse;

    const newGarage: GarageProfile = {
      id: `garage-user-${Date.now()}`,
      nom: nom.trim(),
      responsable: responsable.trim(),
      titreResponsable: titreResponsable.trim() || "Maître Garagiste",
      commune,
      adresse: fullAdresse,
      repere: repere.startsWith('Réf') ? repere : `Réf: ${repere}`,
      telephonePrincipal: telephonePrincipal.trim(),
      telephoneUrgence: telephoneUrgence.trim() || telephonePrincipal.trim(),
      whatsapp: cleanWhatsapp,
      email: email.trim(),
      horaires,
      ouvertDimanche,
      estDepannageMobile24h,
      estCertifie: true,
      noteGlobale: 5.0,
      nombreAvis: 1,
      specialites: selectedSpecialties.length > 0 ? selectedSpecialties : ['Mecanique_Generale', 'Depannage_Urgence_24h'],
      marquesExpertise: marquesArr.length > 0 ? marquesArr : ['Toutes marques japonaises, européennes et américaines'],
      photos: photos.length > 0 ? photos : [PRESET_GARAGE_PHOTOS[0]],
      description: description.trim() || `${slogan ? slogan + '. ' : ''}Garage mécanique, électrique et service de dépannage automobile situé à Kinshasa (${commune}). Équipe de techniciens qualifiés pour tous vos travaux et urgences automobiles.`,
      servicesInclus: [
        'Prise en charge rapide et devis gratuit',
        'Intervention mécanique sur place ou en atelier',
        'Diagnostic scanner multimarques de dernière génération',
        'Garantie sur pièces et main d\'œuvre'
      ],
      tarifsIndicatifs: [
        { prestation: 'Diagnostic Scanner Électronique', prixEstime: '20$ - 30$', description: 'Effacement voyants et rapport complet' },
        { prestation: 'Dépannage Batterie & Démarrage', prixEstime: '15$ - 25$', description: 'Intervention express sur lieu de panne' },
        { prestation: 'Recharge Climatisation (R134a)', prixEstime: '30$ - 45$', description: 'Tirage au vide et gaz frigorifique' }
      ],
      avisClients: [
        {
          id: `rev-init-${Date.now()}`,
          auteur: 'AutoConcession Kinshasa',
          commune,
          note: 5,
          commentaire: 'Nouvel atelier certifié inscrit et vérifié sur le réseau Kinshasa.',
          date: 'Aujourd\'hui'
        }
      ],
      dateCreation: new Date().toISOString()
    };

    onRegisterGarage(newGarage);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full text-slate-100 shadow-2xl overflow-hidden my-4 sm:my-8">
        
        {/* Hidden inputs for phone uploads */}
        {/* 1. Phone Gallery / Multi-files */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhoneFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />

        {/* 2. Direct Camera Snap (Phone native camera) */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handlePhoneFileUpload}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-5 sm:p-6 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Répertoire Officiel Kinshasa
                </span>
                <span className="text-[11px] text-amber-400 font-bold hidden sm:inline">
                  24 Communes Couvertes
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Fiche d'Inscription : Garage, Atelier & Mécanicien
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="text-center py-12 space-y-4 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white">Garage inscrit avec succès !</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Le profil de <strong className="text-amber-400">{nom}</strong> est maintenant actif et visible par les automobilistes de Kinshasa en quête d'entretien ou d'intervention en cas de panne.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              
              {/* SECTION 1: IDENTITÉ & NOM DU GARAGE */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-black uppercase text-[11px] tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>1. Nom & Identité de l'Établissement</span>
                </div>

                {/* Garage Name - Highly Prominent */}
                <div className="space-y-1.5">
                  <label className="block text-slate-200 font-black text-sm flex items-center justify-between">
                    <span>Nom du Garage / Nom de l'Atelier *</span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Requis</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Garage Expert Limete 24/7, Atelier Mécanique Maître Dieudonné..."
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-xl p-3 text-white text-sm font-bold placeholder-slate-500 focus:outline-none transition shadow-inner"
                  />
                </div>

                {/* Slogan / Sous-titre */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Slogan / Enseigne commerciale (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Spécialiste Injection Électronique & Climatisation Auto"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Responsable & Titre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Nom et Prénom du Responsable / Garagiste en Chef *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maître Dieudonné Kabwe"
                      value={responsable}
                      onChange={(e) => setResponsable(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Titre / Rôle
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Maître Chef d'Atelier, Électricien Auto Senior..."
                      value={titreResponsable}
                      onChange={(e) => setTitreResponsable(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOCALISATION À KINSHASA */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-black uppercase text-[11px] tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>2. Localisation Précise à Kinshasa</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-200 font-bold mb-1">
                      Commune de Kinshasa *
                    </label>
                    <select
                      value={commune}
                      onChange={(e) => setCommune(e.target.value as KinshasaCommune)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
                    >
                      {KINSHASA_COMMUNES.map((c) => (
                        <option key={c} value={c}>📍 {c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Quartier (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Quartier Industriel, Socimat, Basoko, Mombele..."
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Avenue / Rue & Numéro de parcelle *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Avenue Colonel Mondjiba N° 45"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                    <span>Repère visuel pour retrouver facilement l'atelier *</span>
                    <span className="text-[10px] text-amber-400 font-mono">Essentiel à Kinshasa</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: En face de la station Total Socimat, à 50m du rond-point Mandela"
                    value={repere}
                    onChange={(e) => setRepere(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SECTION 3: CONTACTS & NUMÉROS DIRECTS */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-black uppercase text-[11px] tracking-wider">
                  <Phone className="w-4 h-4" />
                  <span>3. Contacts & WhatsApp Directs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-200 font-bold mb-1">
                      Téléphone Principal (Appel Client) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: +243 829 000 111"
                      value={telephonePrincipal}
                      onChange={(e) => setTelephonePrincipal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                      <span>Numéro WhatsApp (Position GPS & Devis)</span>
                      <span className="text-[10px] text-emerald-400 font-bold">1-Clic</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 243829000111 ou 0829000111"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Téléphone Dépannage Urgence Nuit 24h
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: +243 810 000 222"
                      value={telephoneUrgence}
                      onChange={(e) => setTelephoneUrgence(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Email Professionnel (Optionnel)
                    </label>
                    <input
                      type="email"
                      placeholder="contact@garagelimete.cd"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: PHOTOS DIRECTEMENT DEPUIS VOTRE TÉLÉPHONE */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-amber-500/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-[11px] tracking-wider">
                    <Camera className="w-4 h-4" />
                    <span>4. Photos de l'Atelier (Depuis votre Téléphone)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {photos.length} photo{photos.length > 1 ? 's' : ''} ajoutée{photos.length > 1 ? 's' : ''}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Prenez une photo de votre devanture, de vos ponts élévateurs, outillage ou choisissez des images depuis votre galerie photo :
                </p>

                {/* Phone Upload Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Camera Snap */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20 active:scale-98"
                  >
                    <Camera className="w-4 h-4 shrink-0" />
                    <span>Prendre une Photo</span>
                  </button>

                  {/* Phone Gallery */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold p-3 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Galerie Téléphone</span>
                  </button>

                  {/* Web URL / Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold p-3 rounded-xl border border-slate-800 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Lien URL / Modèles</span>
                  </button>
                </div>

                {isProcessingPhoto && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-center font-bold flex items-center justify-center gap-2 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    <span>Chargement des photos depuis le téléphone en cours...</span>
                  </div>
                )}

                {/* Optional URL Input */}
                {showUrlInput && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Coller l'URL d'une photo https://..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlPhoto}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 rounded-xl transition"
                      >
                        Ajouter
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 no-scrollbar">
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">Modèles recommandés :</span>
                      {PRESET_GARAGE_PHOTOS.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotos((prev) => [...prev, presetUrl])}
                          className="h-10 w-14 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 shrink-0"
                        >
                          <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Previews Gallery */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-bold block mb-2">
                    Photos actuelles de votre fiche :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photos.map((pUrl, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 group shadow-md bg-slate-900">
                        <img src={pUrl} alt={`Atelier photo ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Principal badge */}
                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                            Principale
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg opacity-80 group-hover:opacity-100 transition cursor-pointer shadow"
                          title="Supprimer la photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 5: SPÉCIALITÉS TECHNIQUES */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-[11px] tracking-wider">
                    <Wrench className="w-4 h-4" />
                    <span>5. Spécialités Techniques & Équipements</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {selectedSpecialties.length} sélectionnée{selectedSpecialties.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(GARAGE_SPECIALTY_LABELS) as GarageSpecialty[]).map((spec) => {
                    const info = GARAGE_SPECIALTY_LABELS[spec];
                    const isSelected = selectedSpecialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpecialty(spec)}
                        className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[11px] truncate">{info.label}</span>
                        {isSelected ? (
                          <span className="text-amber-400 font-black text-xs ml-1">✓</span>
                        ) : (
                          <span className="text-slate-600 text-xs ml-1">+</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Brands Expertise */}
                <div className="pt-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    Marques prises en charge (Séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    placeholder="Toyota, Mercedes-Benz, Hyundai, Nissan, Lexus, Kia, Land Rover, Peugeot..."
                    value={marquesExpertiseText}
                    onChange={(e) => setMarquesExpertiseText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SECTION 6: HORAIRES & DÉPANNAGE 24/7 */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-black uppercase text-[11px] tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>6. Horaires & Dépannage d'Urgence</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                    <div>
                      <span className="font-bold text-white block">Dépannage d'urgence mobile 24/7 ?</span>
                      <span className="text-[10px] text-slate-400">Équipe capable de se déplacer sur lieu de panne</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={estDepannageMobile24h}
                      onChange={(e) => setEstDepannageMobile24h(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                    <div>
                      <span className="font-bold text-white block">Ouvert / Permanence le Dimanche ?</span>
                      <span className="text-[10px] text-slate-400">Pour les pannes du week-end</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={ouvertDimanche}
                      onChange={(e) => setOuvertDimanche(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Horaires d'ouverture réguliers
                  </label>
                  <input
                    type="text"
                    placeholder="Lun - Sam: 07h30 - 18h30 • Dépannage 24/7"
                    value={horaires}
                    onChange={(e) => setHoraires(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SECTION 7: DESCRIPTION & OUTILLAGES */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-black uppercase text-[11px] tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>7. Présentation de l'Atelier & Outillages</span>
                </div>

                <textarea
                  rows={3}
                  placeholder="Décrivez vos compétences clés, vos équipements (ex: scanner OBD2 multimarques, pont élévateur, banc de géométrie, cabine de peinture au four, compresseur de climatisation) et vos garanties..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                ></textarea>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Validation instantanée et publication sur le réseau Kinshasa</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-3 rounded-xl transition cursor-pointer text-center"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-7 py-3 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Enregistrer mon Garage</span>
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
