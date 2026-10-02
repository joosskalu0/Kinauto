import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Wrench, Camera, Image as ImageIcon, Plus, Trash2, CheckCircle2, 
  MapPin, Phone, MessageSquare, Clock, ShieldCheck, Truck, DollarSign, 
  Sparkles, User, Mail, Tag, Award, CreditCard, Calendar
} from 'lucide-react';
import { GarageProfile, KinshasaCommune, GarageSpecialty, GarageTarifIndicatif, GaragePlanId, SubscriptionStatus } from '../../types';
import { KINSHASA_COMMUNES, GARAGE_SPECIALTY_LABELS } from '../../data/mockGarages';
import { GARAGE_SUBSCRIPTION_PLANS } from '../../data/mockSaas';
import { compressImageFile } from '../../lib/imageOptimization';

interface GarageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGarage: (garage: GarageProfile) => void;
  garageToEdit?: GarageProfile | null;
}

const ALL_SPECIALTIES: GarageSpecialty[] = [
  'Mecanique_Generale',
  'Diagnostic_Electronique',
  'Depannage_Urgence_24h',
  'Electricite_Auto',
  'Climatisation',
  'Tolerie_Peinture',
  'Vulcanisateur_Pneus',
  'Freinage_Suspension',
  'Vidange_Entretien_Rapide',
  'Boite_Automatique',
  'Pieces_Rechange'
];

const POPULAR_BRANDS = [
  'Toyota', 'Mercedes-Benz', 'Hyundai', 'Nissan', 'Kia', 'Mitsubishi', 
  'Suzuki', 'BMW', 'Volkswagen', 'Peugeot', 'Renault', 'Ford', 'Honda', 'Land Rover'
];

export const GarageFormModal: React.FC<GarageFormModalProps> = ({
  isOpen,
  onClose,
  onSaveGarage,
  garageToEdit
}) => {
  const [nom, setNom] = useState('');
  const [responsable, setResponsable] = useState('');
  const [titreResponsable, setTitreResponsable] = useState('');
  const [commune, setCommune] = useState<KinshasaCommune>('Gombe');
  const [adresse, setAdresse] = useState('');
  const [repere, setRepere] = useState('');
  const [telephonePrincipal, setTelephonePrincipal] = useState('+243 ');
  const [telephoneUrgence, setTelephoneUrgence] = useState('');
  const [whatsapp, setWhatsapp] = useState('+243 ');
  const [email, setEmail] = useState('');
  const [horaires, setHoraires] = useState('Lun - Sam: 07h30 - 18h00');
  const [ouvertDimanche, setOuvertDimanche] = useState(false);
  const [estDepannageMobile24h, setEstDepannageMobile24h] = useState(true);
  const [estCertifie, setEstCertifie] = useState(true);
  const [noteGlobale, setNoteGlobale] = useState<number>(5.0);
  const [description, setDescription] = useState('');
  
  // Specialties
  const [selectedSpecialties, setSelectedSpecialties] = useState<GarageSpecialty[]>([
    'Mecanique_Generale',
    'Diagnostic_Electronique',
    'Depannage_Urgence_24h'
  ]);

  // Brands
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Toyota', 'Mercedes-Benz', 'Hyundai', 'Nissan']);
  const [newBrandInput, setNewBrandInput] = useState('');

  // Tarifs
  const [tarifs, setTarifs] = useState<GarageTarifIndicatif[]>([
    { prestation: 'Diagnostic Scanner Électronique OBD2', prixEstime: '25 $ - 40 $' },
    { prestation: 'Vidange & Remplacement Filtre à Huile', prixEstime: '30 $ - 55 $' },
    { prestation: 'Recharge Climatisation R134a', prixEstime: '40 $ - 65 $' }
  ]);
  const [newPrestation, setNewPrestation] = useState('');
  const [newPrix, setNewPrix] = useState('');

  // Services Inclus
  const [servicesInclus, setServicesInclus] = useState<string[]>([
    'Devis clair et transparent avant intervention',
    'Diagnostic électronique complet sur place ou en atelier',
    'Garantie sur pièces et main-d’œuvre'
  ]);
  const [newServiceInput, setNewServiceInput] = useState('');

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // SaaS Pricing & Subscription fields
  const [planId, setPlanId] = useState<GaragePlanId>('garage_pro');
  const [statutAbonnement, setStatutAbonnement] = useState<SubscriptionStatus>('essai_gratuit');
  const [prixFactureMensuel, setPrixFactureMensuel] = useState<number>(185000);
  const [finEssaiGratuit, setFinEssaiGratuit] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [estMasque, setEstMasque] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (garageToEdit) {
      setNom(garageToEdit.nom);
      setResponsable(garageToEdit.responsable);
      setTitreResponsable(garageToEdit.titreResponsable || '');
      setCommune(garageToEdit.commune);
      setAdresse(garageToEdit.adresse);
      setRepere(garageToEdit.repere);
      setTelephonePrincipal(garageToEdit.telephonePrincipal);
      setTelephoneUrgence(garageToEdit.telephoneUrgence || '');
      setWhatsapp(garageToEdit.whatsapp);
      setEmail(garageToEdit.email || '');
      setHoraires(garageToEdit.horaires);
      setOuvertDimanche(!!garageToEdit.ouvertDimanche);
      setEstDepannageMobile24h(garageToEdit.estDepannageMobile24h);
      setEstCertifie(garageToEdit.estCertifie);
      setNoteGlobale(garageToEdit.noteGlobale || 5.0);
      setDescription(garageToEdit.description);
      setSelectedSpecialties(garageToEdit.specialites || []);
      setSelectedBrands(garageToEdit.marquesExpertise || []);
      setTarifs(garageToEdit.tarifsIndicatifs || []);
      setServicesInclus(garageToEdit.servicesInclus || []);
      setPhotos(garageToEdit.photos || []);

      // SaaS fields
      const normalizedPlanId: GaragePlanId = 
        garageToEdit.planId === 'starter' ? 'garage_starter' :
        garageToEdit.planId === 'pro' ? 'garage_pro' :
        garageToEdit.planId === 'enterprise' ? 'garage_enterprise' :
        (garageToEdit.planId as GaragePlanId) || 'garage_pro';
      setPlanId(normalizedPlanId);
      setStatutAbonnement(garageToEdit.statutAbonnement || 'essai_gratuit');
      setPrixFactureMensuel(garageToEdit.prixFactureMensuel ?? 185000);
      setFinEssaiGratuit(garageToEdit.finEssaiGratuit || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setEstMasque(!!garageToEdit.estMasque);
    } else {
      // Defaults for new garage
      setNom('');
      setResponsable('');
      setTitreResponsable('Chef d’Atelier / Maître Garagiste');
      setCommune('Gombe');
      setAdresse('');
      setRepere('');
      setTelephonePrincipal('+243 ');
      setTelephoneUrgence('');
      setWhatsapp('+243 ');
      setEmail('');
      setHoraires('Lun - Sam: 07h30 - 18h00');
      setOuvertDimanche(false);
      setEstDepannageMobile24h(true);
      setEstCertifie(true);
      setNoteGlobale(5.0);
      setDescription('');
      setSelectedSpecialties(['Mecanique_Generale', 'Diagnostic_Electronique', 'Depannage_Urgence_24h']);
      setSelectedBrands(['Toyota', 'Mercedes-Benz', 'Hyundai', 'Nissan']);
      setTarifs([
        { prestation: 'Diagnostic Scanner Électronique OBD2', prixEstime: '25 $ - 40 $' },
        { prestation: 'Vidange & Remplacement Filtre à Huile', prixEstime: '30 $ - 55 $' },
        { prestation: 'Recharge Climatisation R134a', prixEstime: '40 $ - 65 $' }
      ]);
      setServicesInclus([
        'Devis clair et transparent avant intervention',
        'Diagnostic électronique complet sur place ou en atelier',
        'Garantie sur pièces et main-d’œuvre'
      ]);
      setPhotos([
        'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80'
      ]);
      setPlanId('garage_pro');
      setStatutAbonnement('essai_gratuit');
      setPrixFactureMensuel(185000);
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setFinEssaiGratuit(d.toISOString().split('T')[0]);
      setEstMasque(false);
    }
  }, [garageToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhoneFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhoto(true);
    try {
      const compressionPromises = Array.from(files).map((file: File) => 
        compressImageFile(file, 1600, 1200, 0.82)
      );

      const newImgs = await Promise.all(compressionPromises);
      setPhotos((prev) => [...prev, ...newImgs]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddPhotoUrl = () => {
    if (!newImageUrl.trim()) return;
    setPhotos((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleSpecialty = (spec: GarageSpecialty) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleAddCustomBrand = () => {
    if (!newBrandInput.trim()) return;
    if (!selectedBrands.includes(newBrandInput.trim())) {
      setSelectedBrands([...selectedBrands, newBrandInput.trim()]);
    }
    setNewBrandInput('');
  };

  const handleAddTarif = () => {
    if (!newPrestation.trim() || !newPrix.trim()) return;
    setTarifs([...tarifs, { prestation: newPrestation.trim(), prixEstime: newPrix.trim() }]);
    setNewPrestation('');
    setNewPrix('');
  };

  const handleRemoveTarif = (idx: number) => {
    setTarifs(tarifs.filter((_, i) => i !== idx));
  };

  const handleAddServiceInclus = () => {
    if (!newServiceInput.trim()) return;
    setServicesInclus([...servicesInclus, newServiceInput.trim()]);
    setNewServiceInput('');
  };

  const handleRemoveServiceInclus = (idx: number) => {
    setServicesInclus(servicesInclus.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !responsable.trim() || !adresse.trim() || !repere.trim()) {
      alert('Veuillez remplir au minimum le nom de l’atelier, le responsable, l’adresse et le repère.');
      return;
    }

    const defaultPhotos = photos.length > 0 
      ? photos 
      : ['https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80'];

    const savedProfile: GarageProfile = {
      id: garageToEdit?.id || `garage-${Date.now()}`,
      nom: nom.trim(),
      responsable: responsable.trim(),
      titreResponsable: titreResponsable.trim() || 'Chef d’Atelier',
      commune,
      adresse: adresse.trim(),
      repere: repere.trim(),
      telephonePrincipal: telephonePrincipal.trim(),
      telephoneUrgence: telephoneUrgence.trim() || undefined,
      whatsapp: whatsapp.trim() || telephonePrincipal.trim(),
      email: email.trim() || undefined,
      horaires: horaires.trim(),
      ouvertDimanche,
      estDepannageMobile24h,
      estCertifie,
      noteGlobale: Number(noteGlobale) || 5.0,
      nombreAvis: garageToEdit?.nombreAvis || 1,
      specialites: selectedSpecialties.length > 0 ? selectedSpecialties : ['Mecanique_Generale'],
      marquesExpertise: selectedBrands,
      photos: defaultPhotos,
      description: description.trim() || `Garage automobile et atelier mécanique basé à Kinshasa ${commune}. Réparations multimarques, entretien régulier et assistance dépannage.`,
      servicesInclus: servicesInclus.length > 0 ? servicesInclus : ['Devis clair et diagnostic avant réparation'],
      tarifsIndicatifs: tarifs,
      avisClients: garageToEdit?.avisClients || [],
      dateCreation: garageToEdit?.dateCreation || new Date().toISOString().split('T')[0],
      planId,
      statutAbonnement,
      prixFactureMensuel: Number(prixFactureMensuel) || 185000,
      finEssaiGratuit,
      estMasque,
      invoices: garageToEdit?.invoices || []
    };

    onSaveGarage(savedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full text-slate-900 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center font-bold shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {garageToEdit ? `Modifier : ${garageToEdit.nom}` : 'Ajouter un Nouveau Garage Partenaire'}
              </h2>
              <p className="text-xs text-slate-500">
                Gestion complète du profil d'atelier, coordonnées Kinshasa, services et dépannage SOS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-full bg-white border border-slate-200 transition cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs for smartphone photo capture */}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* SECTION 1: INFORMATIONS GÉNÉRALES & RESPONSABLE */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" /> Identification & Direction de l'Atelier
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-slate-700 font-bold">
                  Nom Officiel de l'Atelier / Garage <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Garage Mécanique Pro Socimat, Expert Auto Kin..."
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Nom & Prénom du Maître Responsable <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dieudonné Kabwe, Jean-Paul Tshimanga..."
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Titre Professionnel / Rôle
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chef d’Atelier & Électricien Diagnostic, Maître Mécanicien..."
                  value={titreResponsable}
                  onChange={(e) => setTitreResponsable(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCALISATION PRÉCISE À KINSHASA */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" /> Localisation & Repères Kinshasa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Commune de Kinshasa <span className="text-rose-500">*</span>
                </label>
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value as KinshasaCommune)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                >
                  {KINSHASA_COMMUNES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Repère Visuel Clé (Crucial pour les clients) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: En face de la station Total Socimat, Réf. Rond-point Ngaba..."
                  value={repere}
                  onChange={(e) => setRepere(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl p-3 text-amber-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-slate-700 font-bold">
                  Adresse Complète (Avenue, Numéro, Quartier) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 45 Avenue de la Justice, Quartier Batetela, Kinshasa"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTACTS DIRECTS & WHATSAPP */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600" /> Contacts Directs & Dépannage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Téléphone Principal d'Appel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+243 81 234 5678"
                  value={telephonePrincipal}
                  onChange={(e) => setTelephonePrincipal(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-amber-800 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold flex items-center justify-between">
                  <span>Numéro WhatsApp Direct</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Devis & GPS</span>
                </label>
                <input
                  type="tel"
                  placeholder="+243 89 123 4567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-emerald-800 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Téléphone Urgence Nuit (Optionnel)
                </label>
                <input
                  type="tel"
                  placeholder="+243 99 000 1122"
                  value={telephoneUrgence}
                  onChange={(e) => setTelephoneUrgence(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Email de Contact (Optionnel)
                </label>
                <input
                  type="email"
                  placeholder="contact@garage-kinshasa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: HORAIRES & OPTIONS STATUT EN 1 CLIC */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Horaires & Statuts de Service
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Horaires d'Ouverture d'Atelier</label>
                <input
                  type="text"
                  placeholder="Lun - Sam: 07h30 - 18h00"
                  value={horaires}
                  onChange={(e) => setHoraires(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Note Globale d'Avis (sur 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={noteGlobale}
                  onChange={(e) => setNoteGlobale(parseFloat(e.target.value) || 5.0)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Toggle Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition shadow-xs ${
                estCertifie ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  checked={estCertifie}
                  onChange={(e) => setEstCertifie(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <div className="space-y-0.5">
                  <span className="font-black text-xs block">Atelier Certifié & Vérifié</span>
                  <span className="text-[10px] opacity-80 block">Badge de confiance visible</span>
                </div>
              </label>

              <label className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition shadow-xs ${
                estDepannageMobile24h ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  checked={estDepannageMobile24h}
                  onChange={(e) => setEstDepannageMobile24h(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded"
                />
                <div className="space-y-0.5">
                  <span className="font-black text-xs block">Dépannage Mobile SOS 24/7</span>
                  <span className="text-[10px] opacity-80 block">Reçoit les alertes urgentes</span>
                </div>
              </label>

              <label className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition shadow-xs ${
                ouvertDimanche ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  checked={ouvertDimanche}
                  onChange={(e) => setOuvertDimanche(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <div className="space-y-0.5">
                  <span className="font-black text-xs block">Ouvert le Dimanche</span>
                  <span className="text-[10px] opacity-80 block">Disponibilité week-end</span>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 5: PHOTOS (TÉLÉPHONE OU URL) */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" /> Photos de l'Atelier ({photos.length})
              </h3>
              <span className="text-[11px] text-slate-500">Devanture, matériel, équipement</span>
            </div>

            {/* Direct Phone Upload Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Prendre une photo (Appareil Smartphone)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-xs"
              >
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Galerie du Téléphone</span>
              </button>
            </div>

            {isProcessingPhoto && (
              <p className="text-amber-700 text-center animate-pulse">
                Traitement des photos en cours...
              </p>
            )}

            {/* Optional URL addition */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                placeholder="Ou coller une URL d'image web (https://...)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>

            {/* Photos Preview Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-xs">
                    <img src={url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 font-black text-[8px] px-1 py-0.5 rounded shadow">
                        Principale
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-md opacity-80 group-hover:opacity-100 transition cursor-pointer shadow"
                      title="Supprimer la photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 6: SPÉCIALITÉS TECHNIQUES */}
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" /> Spécialités Techniques & Compétences
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ALL_SPECIALTIES.map((spec) => {
                const info = GARAGE_SPECIALTY_LABELS[spec];
                const isSelected = selectedSpecialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-600' : 'bg-slate-300'}`}></span>
                    <span className="line-clamp-1">{info?.label || spec}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 7: MARQUES MAÎTRISÉES */}
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" /> Marques Automobiles Maîtrisées
            </h3>

            <div className="flex flex-wrap gap-2">
              {POPULAR_BRANDS.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-blue-100 border-blue-400 text-blue-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Ajouter une autre marque (ex: Volvo, Jeep)..."
                value={newBrandInput}
                onChange={(e) => setNewBrandInput(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomBrand}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
          </div>

          {/* SECTION 8: TARIFS INDICATIFS */}
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" /> Grille Tarifaire Indicative Kinshasa
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                {tarifs.length} prestation{tarifs.length > 1 ? 's' : ''} configurée{tarifs.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Suggestions en 1 clic */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-500 font-bold block">
                ⚡ Suggestions rapides de prix (cliquer pour ajouter directement à l'atelier) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { prestation: 'Diagnostic Scanner Électronique', prixEstime: '25 $ (65.000 FC)' },
                  { prestation: 'Vidange Moteur + Filtre à Huile', prixEstime: '35 $ (90.000 FC)' },
                  { prestation: 'Recharge Climatisation (R134a)', prixEstime: '40 $ (100.000 FC)' },
                  { prestation: 'Dépannage Batterie & Démarrage SOS', prixEstime: '20 $ (50.000 FC)' },
                  { prestation: 'Remplacement Plaquettes de Frein', prixEstime: '25 $ (65.000 FC)' },
                  { prestation: 'Remorquage Dépanneuse Plateau', prixEstime: '50 $ (130.000 FC)' }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!tarifs.some(item => item.prestation.toLowerCase() === p.prestation.toLowerCase())) {
                        setTarifs([...tarifs, p]);
                      }
                    }}
                    className="bg-white hover:bg-emerald-50 text-[10px] text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                  >
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{p.prestation}</span>
                    <span className="font-mono text-emerald-700 font-bold">({p.prixEstime})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {tarifs.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 bg-white rounded-xl border border-dashed border-slate-200 text-center">
                  Aucun tarif n'a encore été défini. Ajoutez-en ci-dessous ou cliquez sur les suggestions rapides.
                </p>
              ) : (
                tarifs.map((t, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                    <span className="font-bold text-slate-900 flex-1 text-xs">{t.prestation}</span>
                    <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-300 text-xs">
                      {t.prixEstime}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTarif(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <input
                type="text"
                placeholder="Prestation (ex: Changement Plaquettes)"
                value={newPrestation}
                onChange={(e) => setNewPrestation(e.target.value)}
                className="sm:col-span-2 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Prix (ex: 20 $ - 35 $)"
                  value={newPrix}
                  onChange={(e) => setNewPrix(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddTarif}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 9: TARIFICATION SAAS & FORMULE D'ABONNEMENT */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" /> Formule SaaS & Statut d'Abonnement de l'Atelier
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Administration Centrale
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GARAGE_SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = planId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setPlanId(plan.id);
                      setPrixFactureMensuel(plan.prixMensuel);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between shadow-xs ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">{plan.nom}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{plan.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-xs font-black text-amber-800 font-mono">
                        {plan.prixMensuel.toLocaleString('fr-FR')} FC
                      </span>
                      <span className="text-[10px] text-slate-500"> / mois</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Tarif Mensuel Facturé (FC) *
                </label>
                <input
                  type="number"
                  required
                  value={prixFactureMensuel}
                  onChange={(e) => setPrixFactureMensuel(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-amber-800 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Statut de l'Abonnement *
                </label>
                <select
                  value={statutAbonnement}
                  onChange={(e) => setStatutAbonnement(e.target.value as SubscriptionStatus)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="essai_gratuit">🟡 Essai Gratuit Actif</option>
                  <option value="actif">🟢 Actif (Abonnement Payé)</option>
                  <option value="facture_en_attente">🟠 Facture Émise / En Attente</option>
                  <option value="suspendu">🔴 Suspendu (Impayé)</option>
                  <option value="expire">⚪ Expiré</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Fin Période d'Essai / Échéance
                </label>
                <input
                  type="date"
                  value={finEssaiGratuit}
                  onChange={(e) => setFinEssaiGratuit(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={estMasque}
                  onChange={(e) => setEstMasque(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span className="text-slate-700 font-bold">
                  Masquer cet atelier du portail public (invisible pour les automobilistes)
                </span>
              </label>
            </div>
          </div>

          {/* SECTION 10: DESCRIPTION DÉTAILLÉE */}
          <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> Présentation & Historique de l'Atelier
            </h3>
            <textarea
              rows={4}
              placeholder="Décrivez l'historique du garage, les équipements clés, l'expérience des techniciens..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 leading-relaxed focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl transition cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-7 py-3 rounded-xl transition cursor-pointer shadow-md shadow-amber-500/20 active:scale-98 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{garageToEdit ? 'Enregistrer les Modifications' : 'Créer le Profil Garage'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
