import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Plus, Trash2, CheckCircle, Car, AlertCircle, RefreshCw,
  Globe, Search, Award, Zap, Check, FileText, SlidersHorizontal, Bot, Tag, Home,
  Camera, Image as ImageIcon, UploadCloud, Clock, ShieldCheck
} from 'lucide-react';
import { Vehicle, FuelType, TransmissionType, BodyType, CarCondition } from '../../types';
import { compressImageFile } from '../../lib/imageOptimization';

interface VehicleFormModalProps {
  vehicleToEdit?: Vehicle | null;
  onClose: () => void;
  onSave: (vehicleData: Omit<Vehicle, 'id' | 'dateAjout'>, editId?: string) => void;
}

const DEFAULT_EQUIPMENTS = [
  'Pack Sport M / S Line / AMG',
  'Cockpit Virtuel 3D',
  'Toit panoramique ouvrant',
  'Caméra de recul 360°',
  'Phares LED Matrix',
  'Sièges chauffants & massants',
  'Apple CarPlay & Android Auto',
  'Affichage Tête Haute (HUD)',
  'Régulateur de vitesse adaptatif',
  'Système audio Premium',
  'Avertisseur d\'angle mort',
  'Jantes alliage 19"'
];

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  vehicleToEdit,
  onClose,
  onSave
}) => {
  const [marque, setMarque] = useState(vehicleToEdit?.marque || 'BMW');
  const [modele, setModele] = useState(vehicleToEdit?.modele || '');
  const [finition, setFinition] = useState(vehicleToEdit?.finition || '');
  const [annee, setAnnee] = useState<number>(vehicleToEdit?.annee || new Date().getFullYear());
  const [prix, setPrix] = useState<number>(vehicleToEdit?.prix || 25000);
  const [kilometrage, setKilometrage] = useState<number>(vehicleToEdit?.kilometrage || 15000);
  const [carburant, setCarburant] = useState<FuelType>(vehicleToEdit?.carburant || 'Essence');
  const [transmission, setTransmission] = useState<TransmissionType>(vehicleToEdit?.transmission || 'Automatique');
  const [categorie, setCategorie] = useState<BodyType>(vehicleToEdit?.categorie || 'Berline');
  const [etat, setEtat] = useState<CarCondition>(vehicleToEdit?.etat || 'occasion');
  const [puissanceCh, setPuissanceCh] = useState<number>(vehicleToEdit?.puissanceCh || 180);
  const [puissanceFiscale, setPuissanceFiscale] = useState<number>(vehicleToEdit?.puissanceFiscale || 10);
  const [couleur, setCouleur] = useState(vehicleToEdit?.couleur || 'Gris Métallisé');
  const [portes, setPortes] = useState<number>(vehicleToEdit?.portes || 5);
  const [places, setPlaces] = useState<number>(vehicleToEdit?.places || 5);
  const [co2Gkm, setCo2Gkm] = useState<number>(vehicleToEdit?.co2Gkm || 135);
  const [garantieMois, setGarantieMois] = useState<number>(vehicleToEdit?.garantieMois || 24);
  const [vin, setVin] = useState(vehicleToEdit?.vin || `WBA${Math.floor(1000000000000 + Math.random() * 9000000000000)}`);
  
  const [description, setDescription] = useState(vehicleToEdit?.description || '');
  const [equipements, setEquipements] = useState<string[]>(vehicleToEdit?.equipements || DEFAULT_EQUIPMENTS.slice(0, 5));
  const [listingTier, setListingTier] = useState<'free' | 'premium' | 'featured'>(
    vehicleToEdit?.listingTier || (vehicleToEdit?.enVedette ? 'featured' : 'free')
  );
  const [visibilityBadge, setVisibilityBadge] = useState<string>(vehicleToEdit?.visibilityBadge || '');
  const [boostTopSearch, setBoostTopSearch] = useState<boolean>(Boolean(vehicleToEdit?.boostTopSearch));
  const [images, setImages] = useState<string[]>(
    vehicleToEdit?.images || [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200'
    ]
  );
  
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Quotas utilisateur & Monétisation
  const [userQuota, setUserQuota] = useState<{
    active_count: number;
    max_free_listings: number;
    max_allowed: number;
    remaining: number;
    is_pro: boolean;
    plan_name: string;
    can_publish: boolean;
    limit_reached_message: string | null;
  } | null>(null);

  // 2. Options payantes pour promouvoir une annonce (À la une, sponsorisée, remontée, badge premium)
  // Durées configurables : 3, 7, 15, 30 jours
  const [promotionOption, setPromotionOption] = useState<'none' | 'featured' | 'sponsored' | 'bump' | 'badge_premium'>(
    vehicleToEdit?.enVedette ? 'featured' : (vehicleToEdit?.listingTier === 'featured' ? 'featured' : (vehicleToEdit?.listingTier === 'premium' ? 'badge_premium' : 'none'))
  );
  const [promotionDuration, setPromotionDuration] = useState<number>(7);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
        if (!token) return;
        const res = await fetch('/api/monetization/user-quota', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUserQuota(data);
        }
      } catch (e) {}
    };
    fetchQuota();
  }, []);

  const handlePhoneFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhoto(true);
    try {
      const compressionPromises = Array.from(files).map((file: File) => 
        compressImageFile(file, 1600, 1200, 0.82)
      );

      const compressedImages = await Promise.all(compressionPromises);
      setImages((prev) => [...prev, ...compressedImages]);
    } catch (err) {
      console.error("Erreur d'importation des photos:", err);
    } finally {
      setIsProcessingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };
  
  // AI SEO Generator state
  const [seoCity, setSeoCity] = useState('Paris / Île-de-France');
  const [seoTone, setSeoTone] = useState('Professionnel & Vendeur');
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('Garantie concession, révisé, financement sans apport');
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [aiError, setAiError] = useState('');
  const [seoResult, setSeoResult] = useState<{
    seoTitle?: string;
    metaDescription?: string;
    description?: string;
    keywords?: string[];
    seoScore?: number;
    seoAdvice?: string;
  } | null>(null);

  // Dedicated AI SEO Description Generator call to Express Server
  const handleGenerateSeoDescription = async () => {
    if (!marque || !modele) {
      setAiError('Veuillez au moins indiquer la marque et le modèle.');
      return;
    }

    setIsGeneratingSeo(true);
    setAiError('');

    try {
      const response = await fetch('/api/ai/generate-seo-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marque,
          modele,
          finition,
          annee,
          kilometrage,
          carburant,
          transmission,
          puissance: puissanceCh,
          prix,
          etat,
          equipements,
          ville: seoCity,
          tone: seoTone,
          targetKeywords: seoKeywordsInput
        })
      });

      const data = await response.json();
      if (data.description) {
        setSeoResult(data);
        setDescription(data.description);
      } else {
        setAiError(data.error || 'Erreur lors de la génération SEO.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Erreur de connexion au serveur IA Gemini.');
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  const toggleEquipment = (eq: string) => {
    if (equipements.includes(eq)) {
      setEquipements(equipements.filter((e) => e !== eq));
    } else {
      setEquipements([...equipements, eq]);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marque || !modele) return;

    const finalTier = promotionOption === 'featured' ? 'featured' : (promotionOption === 'badge_premium' ? 'premium' : 'free');
    const isFeatured = promotionOption === 'featured';
    const isBump = promotionOption === 'bump';
    const badge = promotionOption === 'badge_premium' ? 'top_deal' : ((visibilityBadge as any) || undefined);

    onSave(
      {
        marque,
        modele,
        finition,
        annee,
        prix,
        kilometrage,
        carburant,
        transmission,
        categorie,
        etat,
        status: vehicleToEdit?.status || 'disponible',
        puissanceCh,
        puissanceFiscale,
        couleur,
        portes,
        places,
        co2Gkm,
        garantieMois,
        vin,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200'],
        description,
        equipements,
        enVedette: isFeatured,
        listingTier: finalTier,
        visibilityBadge: badge,
        boostTopSearch: isBump
      },
      vehicleToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {vehicleToEdit ? 'Éditer la Fiche Véhicule' : 'Publier un Nouveau Véhicule au Stock'}
              </h2>
              <p className="text-xs text-slate-400">Remplissez les caractéristiques pour la vitrine en ligne</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Retourner à l'accueil"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Fermer sans enregistrer"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Fermer</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* BANDEAU QUOTA D'ANNONCES (1. ANNONCES GRATUITES) */}
          {userQuota && (
            <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              !userQuota.can_publish
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : userQuota.remaining <= 1
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 shrink-0 text-amber-400" />
                <div>
                  <span className="font-extrabold uppercase tracking-wider text-[11px] block">
                    {userQuota.is_pro ? userQuota.plan_name : 'Formule Particulier (Gratuit)'}
                  </span>
                  <span>
                    Vous avez <strong>{userQuota.active_count}</strong> sur <strong>{userQuota.max_allowed}</strong> annonces actives ({userQuota.remaining} restante{userQuota.remaining > 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {!userQuota.can_publish ? (
                <div className="flex items-center gap-1.5 text-rose-400 font-bold bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/50">
                  <AlertCircle className="w-4 h-4" />
                  <span>Limite de 3 annonces atteinte. Souscrivez un forfait Pro.</span>
                </div>
              ) : (
                <span className="bg-slate-900/90 text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/30">
                  ✓ Publication autorisée ({userQuota.remaining} restante{userQuota.remaining > 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}

          {/* Main Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Marque *</label>
              <input
                type="text"
                required
                placeholder="ex: BMW, Audi, Peugeot..."
                value={marque}
                onChange={(e) => setMarque(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Modèle *</label>
              <input
                type="text"
                required
                placeholder="ex: Série 3, Q5, 3008..."
                value={modele}
                onChange={(e) => setModele(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Finition</label>
              <input
                type="text"
                placeholder="ex: M Sport, S Line, GT..."
                value={finition}
                onChange={(e) => setFinition(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Prix de vente TTC (€) *</label>
              <input
                type="number"
                required
                value={prix}
                onChange={(e) => setPrix(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-bold text-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Kilométrage (km) *</label>
              <input
                type="number"
                required
                value={kilometrage}
                onChange={(e) => setKilometrage(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Année modèle *</label>
              <input
                type="number"
                required
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Carburant</label>
              <select
                value={carburant}
                onChange={(e) => setCarburant(e.target.value as FuelType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="Essence">Essence</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybride">Hybride</option>
                <option value="Électrique">Électrique</option>
                <option value="GPL">GPL</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Boîte de vitesses</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="Automatique">Automatique</option>
                <option value="Manuelle">Manuelle</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Catégorie carrosserie</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as BodyType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="SUV">SUV / Crossover</option>
                <option value="Berline">Berline</option>
                <option value="Citadine">Citadine</option>
                <option value="Coupé">Coupé</option>
                <option value="Cabriolet">Cabriolet</option>
                <option value="Break">Break</option>
                <option value="Utilitaire">Utilitaire</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">État du véhicule</label>
              <select
                value={etat}
                onChange={(e) => setEtat(e.target.value as CarCondition)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="occasion">Occasion Certifiée</option>
                <option value="neuf">Neuf (0 km)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Puissance (ch DIN)</label>
              <input
                type="number"
                value={puissanceCh}
                onChange={(e) => setPuissanceCh(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Garantie (Mois)</label>
              <input
                type="number"
                value={garantieMois}
                onChange={(e) => setGarantieMois(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          {/* AI Gemini Generator & SEO Section */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-indigo-500/40 shadow-xl space-y-4">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-xl shadow-md">
                  <Sparkles className="w-5 h-5 font-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-sm">Génération SEO & Référencement par l'IA Gemini</h3>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Optimisé Moteurs de Recherche
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Générez une description captivante et structurée pour Google, Leboncoin et votre vitrine web
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateSeoDescription}
                disabled={isGeneratingSeo}
                className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isGeneratingSeo ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
                <span>{isGeneratingSeo ? 'Analyse & Rédaction IA...' : 'Générer la Description SEO'}</span>
              </button>
            </div>

            {/* SEO Tuning Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-400" /> Ville / Zone SEO Local
                </label>
                <input
                  type="text"
                  placeholder="ex: Paris, Lyon, Bordeaux, France..."
                  value={seoCity}
                  onChange={(e) => setSeoCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> Ton Marketing
                </label>
                <select
                  value={seoTone}
                  onChange={(e) => setSeoTone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Professionnel & Vendeur">Professionnel & Vendeur</option>
                  <option value="Luxe & Haut de Gamme">Luxe & Premium</option>
                  <option value="Sportif & Dynamique">Sportif & Passionné</option>
                  <option value="Confiance & Famille">Confiance & Sécurité</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" /> Mots-Clés Prioritaires
                </label>
                <input
                  type="text"
                  placeholder="ex: Garantie 24 mois, première main..."
                  value={seoKeywordsInput}
                  onChange={(e) => setSeoKeywordsInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {aiError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Google Search Snippet Live Preview */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Search className="w-3.5 h-3.5 text-amber-400" /> Aperçu Résultat Recherche Google (SERP Snippet)
                </span>
                {seoResult?.seoScore && (
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    Score SEO Gemini : {seoResult.seoScore}/100
                  </span>
                )}
              </div>

              {/* Google Search Result Card */}
              <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800/80 font-sans space-y-1">
                <div className="text-[11px] text-emerald-400 truncate flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-500" />
                  <span>https://votre-concession.fr › stock › {marque.toLowerCase() || 'auto'}-{modele.toLowerCase() || 'occasion'}</span>
                </div>
                <div className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer truncate">
                  {seoResult?.seoTitle || `${marque} ${modele} ${finition ? finition : ''} ${annee} - Occasion Révisée Garantite ${seoCity}`}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {seoResult?.metaDescription || `Achetez votre ${marque} ${modele} (${annee}) à ${seoCity}. Véhicule de ${kilometrage ? Number(kilometrage).toLocaleString('fr-FR') : '0'} km révisé et garanti ${garantieMois} mois. Essai immédiat en concession.`}
                </div>
              </div>

              {/* Keywords chips */}
              {seoResult?.keywords && seoResult.keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">Mots-clés ciblés :</span>
                  {seoResult.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}

              {/* SEO Advice Callout */}
              {seoResult?.seoAdvice && (
                <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/60 rounded-lg text-[11px] text-indigo-200 flex items-start gap-2">
                  <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-300 font-bold">Conseil de l'Expert SEO Gemini : </strong>
                    {seoResult.seoAdvice}
                  </div>
                </div>
              )}
            </div>

            {/* Main Editable Description Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold text-xs flex items-center justify-between">
                <span>Description Commerciale Complète (Résultat de la fiche)</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {description.length} caractères • Modifiable librement
                </span>
              </label>
              <textarea
                rows={6}
                placeholder="La description générée automatiquement par Gemini apparaîtra ici..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white leading-relaxed focus:outline-none focus:border-amber-500 text-xs font-mono"
              ></textarea>
            </div>

          </div>

          {/* Equipment Checkbox Tags */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">Équipements & Options</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_EQUIPMENTS.map((eq) => {
                const isSelected = equipements.includes(eq);
                return (
                  <button
                    type="button"
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{eq}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hidden inputs for phone uploads */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhoneFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handlePhoneFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Photos Manager - Phone & URL */}
          <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Photos du Véhicule (Depuis Téléphone ou URL)</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {images.length} photo{images.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Direct Phone Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 text-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Prendre une photo (Appareil)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 text-xs"
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Galerie du Téléphone</span>
              </button>
            </div>

            {isProcessingPhoto && (
              <p className="text-xs text-amber-400 text-center animate-pulse">
                Chargement des photos en cours...
              </p>
            )}
            
            {/* Optional URL input */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                placeholder="Ou coller une URL d'image (https://...)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 rounded-lg flex items-center gap-1 text-xs"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 group bg-slate-900">
                  <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 font-bold text-[8px] px-1 py-0.2 rounded">
                      Principale
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-80 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MONÉTISATION : 2. ANNONCES PREMIUM & OPTIONS DE PROMOTION */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Options Payantes de Promotion (Annonces Premium)</h3>
                  <p className="text-[11px] text-slate-400">Multipliez les contacts acheteurs grâce à la visibilité surclassée AutoKin</p>
                </div>
              </div>
              <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Paiement Mobile Money / Carte
              </span>
            </div>

            {/* Sélecteur de Durée Configurable (3, 7, 15 ou 30 jours) */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Durée de la promotion souhaitée :
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { days: 3, label: '3 jours' },
                  { days: 7, label: '7 jours (Populaire)' },
                  { days: 15, label: '15 jours' },
                  { days: 30, label: '30 jours' }
                ].map(({ days, label }) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => setPromotionDuration(days)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      promotionDuration === days
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grille des 4 Options Officielles + Gratuit Standard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Option 0 : Gratuit Standard */}
              <div
                onClick={() => setPromotionOption('none')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  promotionOption === 'none'
                    ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Standard</span>
                    <span className="text-xs font-black text-emerald-400">Gratuit</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                    Publication classique dans les résultats selon la date d'ajout.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <Check className="w-3 h-3 text-blue-400" /> Inclus dans le quota
                </div>
              </div>

              {/* Option 1 : À la une */}
              <div
                onClick={() => setPromotionOption('featured')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between relative ${
                  promotionOption === 'featured'
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  ⭐ Top Vente
                </span>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">⭐ À la une</span>
                    <span className="text-xs font-black text-amber-300">
                      ${promotionDuration === 3 ? 8 : promotionDuration === 7 ? 15 : promotionDuration === 15 ? 25 : 40}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
                    Carrousel d'accueil & position prioritaire en tête de liste.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-amber-400/90 font-semibold">
                  Durée : {promotionDuration} jours
                </div>
              </div>

              {/* Option 2 : Annonce sponsorisée */}
              <div
                onClick={() => setPromotionOption('sponsored')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  promotionOption === 'sponsored'
                    ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-purple-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400">🔥 Sponsorisée</span>
                    <span className="text-xs font-black text-purple-300">
                      ${promotionDuration === 3 ? 6 : promotionDuration === 7 ? 12 : promotionDuration === 15 ? 20 : 35}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
                    Encart publicitaire ciblé dans les recherches similaires.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-purple-400/90 font-semibold">
                  Durée : {promotionDuration} jours
                </div>
              </div>

              {/* Option 3 : Remonter l'annonce dans les résultats */}
              <div
                onClick={() => setPromotionOption('bump')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  promotionOption === 'bump'
                    ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">⚡ Remontée Top</span>
                    <span className="text-xs font-black text-blue-300">
                      ${promotionDuration === 3 ? 4 : promotionDuration === 7 ? 7 : promotionDuration === 15 ? 12 : 20}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
                    Repositionne instantanément l'annonce tout en haut comme neuve.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-blue-400/90 font-semibold">
                  Durée : {promotionDuration} jours
                </div>
              </div>

              {/* Option 4 : Badge "Premium" */}
              <div
                onClick={() => setPromotionOption('badge_premium')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  promotionOption === 'badge_premium'
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">👑 Badge Premium</span>
                    <span className="text-xs font-black text-emerald-300">
                      ${promotionDuration === 3 ? 5 : promotionDuration === 7 ? 9 : promotionDuration === 15 ? 15 : 25}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
                    Badge de confiance doré attirant l'attention immédiate des acheteurs.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-emerald-400/90 font-semibold">
                  Durée : {promotionDuration} jours
                </div>
              </div>
            </div>

            {/* Note de sécurité sur l'activation conditionnelle */}
            {promotionOption !== 'none' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Validation sécurisée : </strong>
                  L'option choisie génère une référence de paiement. La mise en avant sera activée dès réception et validation du règlement Mobile Money (M-Pesa, Airtel, Orange) ou Carte.
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md"
              >
                <Home className="w-4 h-4" />
                <span>Retour à l'Accueil</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Fermer sans enregistrer</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl transition cursor-pointer shadow-lg flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{vehicleToEdit ? 'Enregistrer les Modifications' : 'Publier le Véhicule au Stock'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
