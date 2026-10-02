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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 text-slate-900 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-300">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {vehicleToEdit ? 'Éditer la Fiche Véhicule' : 'Publier un Nouveau Véhicule au Stock'}
              </h2>
              <p className="text-xs text-slate-500">Remplissez les caractéristiques pour la vitrine en ligne</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Retourner à l'accueil"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Fermer sans enregistrer"
            >
              <X className="w-4 h-4 text-rose-500" />
              <span>Fermer</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* BANDEAU QUOTA D'ANNONCES (1. ANNONCES GRATUITES) */}
          {userQuota && (
            <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs ${
              !userQuota.can_publish
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : userQuota.remaining <= 1
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 shrink-0 text-amber-600" />
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
                <div className="flex items-center gap-1.5 text-rose-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4" />
                  <span>Limite de 3 annonces atteinte. Souscrivez un forfait Pro.</span>
                </div>
              ) : (
                <span className="bg-white text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-200 shadow-2xs">
                  ✓ Publication autorisée ({userQuota.remaining} restante{userQuota.remaining > 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}

          {/* Main Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Marque *</label>
              <input
                type="text"
                required
                placeholder="ex: BMW, Audi, Peugeot..."
                value={marque}
                onChange={(e) => setMarque(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Modèle *</label>
              <input
                type="text"
                required
                placeholder="ex: Série 3, Q5, 3008..."
                value={modele}
                onChange={(e) => setModele(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Finition</label>
              <input
                type="text"
                placeholder="ex: M Sport, S Line, GT..."
                value={finition}
                onChange={(e) => setFinition(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Prix de vente TTC (€) *</label>
              <input
                type="number"
                required
                value={prix}
                onChange={(e) => setPrix(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-amber-700 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Kilométrage (km) *</label>
              <input
                type="number"
                required
                value={kilometrage}
                onChange={(e) => setKilometrage(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Année modèle *</label>
              <input
                type="number"
                required
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Carburant</label>
              <select
                value={carburant}
                onChange={(e) => setCarburant(e.target.value as FuelType)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value="Essence">Essence</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybride">Hybride</option>
                <option value="Électrique">Électrique</option>
                <option value="GPL">GPL</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Boîte de vitesses</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value="Automatique">Automatique</option>
                <option value="Manuelle">Manuelle</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Catégorie carrosserie</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as BodyType)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
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
              <label className="block text-slate-700 font-bold mb-1">État du véhicule</label>
              <select
                value={etat}
                onChange={(e) => setEtat(e.target.value as CarCondition)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value="occasion">Occasion Certifiée</option>
                <option value="neuf">Neuf (0 km)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Puissance (ch DIN)</label>
              <input
                type="number"
                value={puissanceCh}
                onChange={(e) => setPuissanceCh(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Garantie (Mois)</label>
              <input
                type="number"
                value={garantieMois}
                onChange={(e) => setGarantieMois(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>

          {/* AI Gemini Generator & SEO Section */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50/40 to-slate-50 p-5 rounded-3xl border border-indigo-200 shadow-xs space-y-4">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5 font-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">Génération SEO & Référencement par l'IA Gemini</h3>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <Globe className="w-3 h-3 text-emerald-600" /> Optimisé Moteurs de Recherche
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Générez une description captivante et structurée pour Google, Leboncoin et votre vitrine web
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateSeoDescription}
                disabled={isGeneratingSeo}
                className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isGeneratingSeo ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
                <span>{isGeneratingSeo ? 'Analyse & Rédaction IA...' : 'Générer la Description SEO'}</span>
              </button>
            </div>

            {/* SEO Tuning Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs shadow-2xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-600" /> Ville / Zone SEO Local
                </label>
                <input
                  type="text"
                  placeholder="ex: Paris, Lyon, Bordeaux, France..."
                  value={seoCity}
                  onChange={(e) => setSeoCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Ton Marketing
                </label>
                <select
                  value={seoTone}
                  onChange={(e) => setSeoTone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="Professionnel & Vendeur">Professionnel & Vendeur</option>
                  <option value="Luxe & Haut de Gamme">Luxe & Premium</option>
                  <option value="Sportif & Dynamique">Sportif & Passionné</option>
                  <option value="Confiance & Famille">Confiance & Sécurité</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> Mots-Clés Prioritaires
                </label>
                <input
                  type="text"
                  placeholder="ex: Garantie 24 mois, première main..."
                  value={seoKeywordsInput}
                  onChange={(e) => setSeoKeywordsInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {aiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Google Search Snippet Live Preview */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Search className="w-3.5 h-3.5 text-amber-600" /> Aperçu Résultat Recherche Google (SERP Snippet)
                </span>
                {seoResult?.seoScore && (
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                    Score SEO Gemini : {seoResult.seoScore}/100
                  </span>
                )}
              </div>

              {/* Google Search Result Card */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans space-y-1">
                <div className="text-[11px] text-emerald-700 truncate flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-600" />
                  <span>https://votre-concession.fr › stock › {marque.toLowerCase() || 'auto'}-{modele.toLowerCase() || 'occasion'}</span>
                </div>
                <div className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                  {seoResult?.seoTitle || `${marque} ${modele} ${finition ? finition : ''} ${annee} - Occasion Révisée Garantite ${seoCity}`}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {seoResult?.metaDescription || `Achetez votre ${marque} ${modele} (${annee}) à ${seoCity}. Véhicule de ${kilometrage ? Number(kilometrage).toLocaleString('fr-FR') : '0'} km révisé et garanti ${garantieMois} mois. Essai immédiat en concession.`}
                </div>
              </div>

              {/* Keywords chips */}
              {seoResult?.keywords && seoResult.keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Mots-clés ciblés :</span>
                  {seoResult.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-amber-900 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}

              {/* SEO Advice Callout */}
              {seoResult?.seoAdvice && (
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
                  <Bot className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-950 font-bold">Conseil de l'Expert SEO Gemini : </strong>
                    {seoResult.seoAdvice}
                  </div>
                </div>
              )}
            </div>

            {/* Main Editable Description Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs flex items-center justify-between">
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
                className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-slate-900 leading-relaxed focus:outline-none focus:border-amber-500 text-xs font-mono shadow-2xs"
              ></textarea>
            </div>

          </div>

          {/* Equipment Checkbox Tags */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-bold">Équipements & Options</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_EQUIPMENTS.map((eq) => {
                const isSelected = equipements.includes(eq);
                return (
                  <button
                    type="button"
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{eq}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
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
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-slate-800 font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Photos du Véhicule (Depuis Téléphone ou URL)</span>
              </label>
              <span className="text-xs text-slate-500 font-mono">
                {images.length} photo{images.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Direct Phone Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 text-xs shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Prendre une photo (Appareil)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 text-xs shadow-xs"
              >
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Galerie du Téléphone</span>
              </button>
            </div>

            {isProcessingPhoto && (
              <p className="text-xs text-amber-700 text-center animate-pulse">
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
                className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-3 rounded-xl flex items-center gap-1 text-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group bg-white shadow-2xs">
                  <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 font-bold text-[8px] px-1 py-0.5 rounded">
                      Principale
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-80 group-hover:opacity-100 transition cursor-pointer shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MONÉTISATION : 2. ANNONCES PREMIUM & OPTIONS DE PROMOTION */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Options Payantes de Promotion (Annonces Premium)</h3>
                  <p className="text-[11px] text-slate-500">Multipliez les contacts acheteurs grâce à la visibilité surclassée AutoKin</p>
                </div>
              </div>
              <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                Paiement Mobile Money / Carte
              </span>
            </div>

            {/* Sélecteur de Durée Configurable (3, 7, 15 ou 30 jours) */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> Durée de la promotion souhaitée :
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
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
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
                    ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Standard</span>
                    <span className="text-xs font-black text-emerald-600">Gratuit</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                    Publication classique dans les résultats selon la date d'ajout.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                  <Check className="w-3 h-3 text-blue-600" /> Inclus dans le quota
                </div>
              </div>

              {/* Option 1 : À la une */}
              <div
                onClick={() => setPromotionOption('featured')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between relative ${
                  promotionOption === 'featured'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-400'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-xs">
                  ⭐ Top Vente
                </span>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">⭐ À la une</span>
                    <span className="text-xs font-black text-amber-900">
                      ${promotionDuration === 3 ? 8 : promotionDuration === 7 ? 15 : promotionDuration === 15 ? 25 : 40}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">
                    Carrousel d'accueil & position prioritaire en tête de liste.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-amber-800 font-semibold">
                  Durée : {promotionDuration} jours
                </div>
              </div>

              {/* Option 2 : Annonce sponsorisée */}
              <div
                onClick={() => setPromotionOption('sponsored')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  promotionOption === 'sponsored'
                    ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-purple-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-800">🔥 Sponsorisée</span>
                    <span className="text-xs font-black text-purple-900">
                      ${promotionDuration === 3 ? 6 : promotionDuration === 7 ? 12 : promotionDuration === 15 ? 20 : 35}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">
                    Encart publicitaire ciblé dans les recherches similaires.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-purple-800 font-semibold">
                  Durée : {promotionDuration} jours
                </div>
              </div>

              {/* Option 3 : Remonter l'annonce dans les résultats */}
              <div
                onClick={() => setPromotionOption('bump')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  promotionOption === 'bump'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800">⚡ Remontée Top</span>
                    <span className="text-xs font-black text-blue-900">
                      ${promotionDuration === 3 ? 4 : promotionDuration === 7 ? 7 : promotionDuration === 15 ? 12 : 20}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">
                    Repositionne instantanément l'annonce tout en haut comme neuve.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-blue-800 font-semibold">
                  Durée : {promotionDuration} jours
                </div>
              </div>

              {/* Option 4 : Badge "Premium" */}
              <div
                onClick={() => setPromotionOption('badge_premium')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  promotionOption === 'badge_premium'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">👑 Badge Premium</span>
                    <span className="text-xs font-black text-emerald-900">
                      ${promotionDuration === 3 ? 5 : promotionDuration === 7 ? 9 : promotionDuration === 15 ? 15 : 25}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">
                    Badge de confiance doré attirant l'attention immédiate des acheteurs.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-emerald-800 font-semibold">
                  Durée : {promotionDuration} jours
                </div>
              </div>
            </div>

            {/* Note de sécurité sur l'activation conditionnelle */}
            {promotionOption !== 'none' && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Validation sécurisée : </strong>
                  L'option choisie génère une référence de paiement. La mise en avant sera activée dès réception et validation du règlement Mobile Money (M-Pesa, Airtel, Orange) ou Carte.
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Home className="w-4 h-4" />
                <span>Retour à l'Accueil</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4 text-rose-500" />
                <span>Fermer sans enregistrer</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl transition cursor-pointer shadow-md flex items-center gap-2 text-xs uppercase tracking-wider active:scale-95"
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
