import React, { useState, useEffect } from 'react';
import { 
  X, DollarSign, Wrench, Plus, Trash2, CheckCircle2, Sparkles, 
  Tag, Info, Building2, MapPin, Check, Save, ArrowRight
} from 'lucide-react';
import { GarageProfile, GarageTarifIndicatif } from '../../types';

interface GarageTarifsModalProps {
  isOpen: boolean;
  onClose: () => void;
  garages: GarageProfile[];
  selectedGarageId?: string | null;
  onSaveTarifs: (garageId: string, tarifs: GarageTarifIndicatif[]) => void;
}

const KINSHASA_SERVICE_PRESETS = [
  { prestation: 'Diagnostic Scanner Électronique OBD2', prixEstime: '25 $ (65.000 FC)', description: 'Effacement voyants et rapport électronique complet' },
  { prestation: 'Vidange & Remplacement Filtre à Huile', prixEstime: '35 $ (90.000 FC)', description: 'Huile multigrade adaptée + filtre à huile neuf' },
  { prestation: 'Recharge Climatisation (Gaz R134a)', prixEstime: '40 $ (100.000 FC)', description: 'Tirage au vide, détection fuites et recharge certifiée' },
  { prestation: 'Dépannage Batterie & Démarrage SOS', prixEstime: '20 $ (50.000 FC)', description: 'Intervention d’urgence sur lieu de panne à Kinshasa' },
  { prestation: 'Remplacement Plaquettes de Frein', prixEstime: '25 $ (60.000 FC)', description: 'Main d’œuvre essieu avant ou arrière' },
  { prestation: 'Remorquage Dépanneuse Plateau', prixEstime: '50 $ (130.000 FC)', description: 'Prise en charge sécurisée sur Kinshasa' },
  { prestation: 'Tôlerie & Peinture au Four', prixEstime: '45 $ (115.000 FC)', description: 'Par élément de carrosserie' },
  { prestation: 'Vulcanisation & Changement Pneu', prixEstime: '10 $ (25.000 FC)', description: 'Montage, équilibrage et contrôle pression' },
  { prestation: 'Révision Complète Boîte Automatique', prixEstime: '75 $ (195.000 FC)', description: 'Vidange fluide ATF et diagnostic électrovannes' },
  { prestation: 'Réparation Électrique / Alternateur / Démarreur', prixEstime: '30 $ (80.000 FC)', description: 'Diagnostic du circuit de charge et réparation' }
];

export const GarageTarifsModal: React.FC<GarageTarifsModalProps> = ({
  isOpen,
  onClose,
  garages,
  selectedGarageId,
  onSaveTarifs
}) => {
  const [activeGarageId, setActiveGarageId] = useState<string>('');
  const [tarifs, setTarifs] = useState<GarageTarifIndicatif[]>([]);
  const [prestation, setPrestation] = useState('');
  const [prix, setPrix] = useState('');
  const [description, setDescription] = useState('');
  const [currencyUnit, setCurrencyUnit] = useState<'$' | 'FC'>('$');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initialize selected garage
  useEffect(() => {
    if (selectedGarageId && garages.some(g => g.id === selectedGarageId)) {
      setActiveGarageId(selectedGarageId);
    } else if (garages.length > 0 && !activeGarageId) {
      setActiveGarageId(garages[0].id);
    }
  }, [selectedGarageId, garages, isOpen]);

  // Load tariffs when active garage changes
  useEffect(() => {
    const found = garages.find(g => g.id === activeGarageId);
    if (found) {
      setTarifs(found.tarifsIndicatifs || []);
      setSavedSuccess(false);
    }
  }, [activeGarageId, garages]);

  if (!isOpen) return null;

  const currentGarage = garages.find(g => g.id === activeGarageId);

  const handleAddTarif = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prestation.trim()) {
      alert("Veuillez saisir le nom de la prestation.");
      return;
    }
    if (!prix.trim()) {
      alert("Veuillez indiquer le prix (ex: 30 $ ou 80.000 FC).");
      return;
    }

    let formattedPrix = prix.trim();
    if (!formattedPrix.includes('$') && !formattedPrix.toLowerCase().includes('fc')) {
      formattedPrix = `${formattedPrix} ${currencyUnit}`;
    }

    const newTarif: GarageTarifIndicatif = {
      prestation: prestation.trim(),
      prixEstime: formattedPrix,
      description: description.trim() || undefined
    };

    setTarifs(prev => [...prev, newTarif]);
    setPrestation('');
    setPrix('');
    setDescription('');
  };

  const handleApplyPreset = (preset: { prestation: string; prixEstime: string; description: string }) => {
    const exists = tarifs.some(t => t.prestation.toLowerCase() === preset.prestation.toLowerCase());
    if (exists) {
      setPrestation(preset.prestation);
      setPrix(preset.prixEstime);
      setDescription(preset.description);
    } else {
      setTarifs(prev => [...prev, preset]);
    }
  };

  const handleRemoveTarif = (index: number) => {
    setTarifs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!activeGarageId) return;
    onSaveTarifs(activeGarageId, tarifs);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full text-slate-900 shadow-2xl overflow-hidden my-4 sm:my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 p-5 sm:p-6 border-b border-slate-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-full transition cursor-pointer shadow-xs"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shadow-xs shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Espace Garagiste & Mécanicien
                </span>
                <span className="text-[11px] text-emerald-800 font-bold hidden sm:inline">
                  Affichage en Dollars ($) ou Francs Congolais (FC)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                Donner & Gérer les Prix de mes Services
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Success Alert */}
          {savedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 font-bold text-xs flex items-center gap-3 shadow-xs animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-black text-sm">Tarifs enregistrés avec succès !</p>
                <p className="text-[11px] text-emerald-700 font-normal">Vos prix sont maintenant immédiatement visibles pour tous les automobilistes consultant votre fiche d'atelier.</p>
              </div>
            </div>
          )}

          {/* Garage Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Sélectionnez votre Atelier / Garage :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <select
                value={activeGarageId}
                onChange={(e) => setActiveGarageId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                {garages.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nom} ({g.commune}) - {g.responsable}
                  </option>
                ))}
              </select>

              {currentGarage && (
                <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-900">{currentGarage.nom}</span>
                    <span className="text-slate-500 block text-[11px] truncate">
                      {currentGarage.commune} • {currentGarage.repere}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Tarifs Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" /> Vos Prestations Actuelles ({tarifs.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Visible sur votre fiche d'atelier
              </span>
            </div>

            {tarifs.length === 0 ? (
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 text-center space-y-2">
                <Info className="w-6 h-6 text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900">
                  Aucun tarif n'est actuellement renseigné pour cet atelier.
                </p>
                <p className="text-[11px] text-amber-700">
                  Cliquez ci-dessous sur une prestation courante pour ajouter vos prix en 1 clic !
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {tarifs.map((t, idx) => (
                  <div 
                    key={idx}
                    className="bg-white border border-slate-200 hover:border-emerald-300 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition"
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-900">{t.prestation}</span>
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-slate-500">{t.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-300">
                        {t.prixEstime}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTarif(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition cursor-pointer"
                        title="Supprimer cette prestation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to Add New Custom Service */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" /> Ajouter une nouvelle prestation & son prix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Prestation / Service <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Remplacement Courroie de Distribution"
                  value={prestation}
                  onChange={(e) => setPrestation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Prix Proposé <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Ex: 40 $ ou 100.000 FC"
                    value={prix}
                    onChange={(e) => setPrix(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrencyUnit(currencyUnit === '$' ? 'FC' : '$')}
                    className="bg-white border border-slate-200 px-2.5 rounded-xl text-xs font-black text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    title="Basculer Devise"
                  >
                    {currencyUnit}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={() => handleAddTarif()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>

              <div className="sm:col-span-12 space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">
                  Précision / Détail inclus (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Main d'œuvre incluse, pièces neuves avec garantie 3 mois..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* 1-Click Popular Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Modèles rapides de prestations courantes à Kinshasa (Cliquer pour ajouter) :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {KINSHASA_SERVICE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="bg-white hover:bg-emerald-50/50 hover:border-emerald-300 border border-slate-200 p-2.5 rounded-xl text-left transition cursor-pointer flex items-center justify-between gap-2 shadow-xs group"
                >
                  <div className="truncate">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-800 block truncate">
                      + {preset.prestation}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {preset.description}
                    </span>
                  </div>
                  <span className="bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 font-mono text-[10px] font-bold px-2 py-1 rounded-md shrink-0 border border-slate-200 group-hover:border-emerald-200">
                    {preset.prixEstime}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
          >
            Fermer sans enregistrer
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer et Publier mes Tarifs</span>
          </button>
        </div>

      </div>
    </div>
  );
};
