import React, { useState, useEffect } from 'react';
import { 
  Tag, PlusCircle, Search, Edit3, Trash2, CheckCircle, 
  RefreshCw, Globe, Layers, AlertCircle, X, Star
} from 'lucide-react';

interface BrandItem {
  id: number;
  nom: string;
  slug?: string;
  pays?: string;
  logo_url?: string;
  is_popular?: number;
  is_active?: number;
}

interface ModelItem {
  id: number;
  marque_id: number;
  marque_nom?: string;
  nom: string;
  slug?: string;
  categorie: string;
  annee_debut?: number;
  annee_fin?: number;
  is_popular?: number;
}

export const AdminBrandsModelsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'marques' | 'modeles'>('marques');
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Brand Modal
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [brandNom, setBrandNom] = useState('');
  const [brandPays, setBrandPays] = useState('Japon');
  const [brandLogo, setBrandLogo] = useState('');
  const [brandPopular, setBrandPopular] = useState(true);

  // Model Modal
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);
  const [modelMarqueId, setModelMarqueId] = useState<number>(1);
  const [modelNom, setModelNom] = useState('');
  const [modelCategorie, setModelCategorie] = useState('SUV');
  const [modelAnneeDebut, setModelAnneeDebut] = useState<number>(2020);
  const [modelPopular, setModelPopular] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandsRes, modelsRes] = await Promise.all([
        fetch('/api/admin/marques', { headers: getHeaders() }),
        fetch('/api/admin/modeles', { headers: getHeaders() })
      ]);
      const brandsData = await brandsRes.json();
      const modelsData = await modelsRes.json();

      if (brandsData.marques) setBrands(brandsData.marques);
      if (modelsData.modeles) setModels(modelsData.modeles);
    } catch (err: any) {
      console.error('Erreur chargement marques/modèles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // BRAND HANDLERS
  const handleOpenBrandModal = (b?: BrandItem) => {
    if (b) {
      setEditingBrand(b);
      setBrandNom(b.nom);
      setBrandPays(b.pays || 'International');
      setBrandLogo(b.logo_url || '');
      setBrandPopular(b.is_popular === 1);
    } else {
      setEditingBrand(null);
      setBrandNom('');
      setBrandPays('Japon');
      setBrandLogo('');
      setBrandPopular(false);
    }
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandNom.trim()) return;

    try {
      const payload = {
        nom: brandNom.trim(),
        pays: brandPays.trim(),
        logo_url: brandLogo.trim() || undefined,
        is_popular: brandPopular ? 1 : 0
      };

      if (editingBrand) {
        const res = await fetch(`/api/admin/marques/${editingBrand.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setBrands(brands.map(b => b.id === editingBrand.id ? { ...b, ...payload } : b));
        }
      } else {
        const res = await fetch('/api/admin/marques', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.marque) {
          setBrands([...brands, data.marque]);
        }
      }
      setIsBrandModalOpen(false);
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!window.confirm('Supprimer cette marque automobile ?')) return;
    try {
      const res = await fetch(`/api/admin/marques/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setBrands(brands.filter(b => b.id !== id));
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  // MODEL HANDLERS
  const handleOpenModelModal = (m?: ModelItem) => {
    if (m) {
      setEditingModel(m);
      setModelMarqueId(m.marque_id);
      setModelNom(m.nom);
      setModelCategorie(m.categorie);
      setModelAnneeDebut(m.annee_debut || 2020);
      setModelPopular(m.is_popular === 1);
    } else {
      setEditingModel(null);
      setModelMarqueId(brands[0]?.id || 1);
      setModelNom('');
      setModelCategorie('SUV');
      setModelAnneeDebut(2022);
      setModelPopular(false);
    }
    setIsModelModalOpen(true);
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelNom.trim()) return;

    try {
      const payload = {
        marque_id: Number(modelMarqueId),
        nom: modelNom.trim(),
        categorie: modelCategorie,
        annee_debut: Number(modelAnneeDebut),
        is_popular: modelPopular ? 1 : 0
      };

      if (editingModel) {
        const res = await fetch(`/api/admin/modeles/${editingModel.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          const brand = brands.find(b => b.id === Number(modelMarqueId));
          setModels(models.map(m => m.id === editingModel.id ? { ...m, ...payload, marque_nom: brand?.nom } : m));
        }
      } else {
        const res = await fetch('/api/admin/modeles', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.modele) {
          setModels([...models, data.modele]);
        }
      }
      setIsModelModalOpen(false);
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm('Supprimer ce modèle ?')) return;
    try {
      const res = await fetch(`/api/admin/modeles/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setModels(models.filter(m => m.id !== id));
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const filteredBrands = brands.filter(b => b.nom.toLowerCase().includes(search.toLowerCase()));
  const filteredModels = models.filter(m => 
    m.nom.toLowerCase().includes(search.toLowerCase()) || 
    (m.marque_nom && m.marque_nom.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub tabs: Marques vs Modèles */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('marques')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'marques'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Catalogue Marques ({brands.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('modeles')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'modeles'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Catalogue Modèles ({models.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeSubTab === 'marques' ? "Rechercher marque..." : "Rechercher modèle ou marque..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {activeSubTab === 'marques' ? (
            <button
              onClick={() => handleOpenBrandModal()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajouter une Marque</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenModelModal()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajouter un Modèle</span>
            </button>
          )}
        </div>
      </div>

      {/* MARQUES LIST VIEW */}
      {activeSubTab === 'marques' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-slate-700 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-amber-500 text-sm overflow-hidden">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.nom} className="w-full h-full object-cover" />
                  ) : (
                    brand.nom.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                    {brand.nom}
                    {brand.is_popular === 1 && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded font-bold">Populaire</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400">{brand.pays || 'International'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenBrandModal(brand)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Modifier"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODÈLES LIST VIEW */}
      {activeSubTab === 'modeles' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                  <th className="p-4">Modèle Automobile</th>
                  <th className="p-4">Marque Associée</th>
                  <th className="p-4">Catégorie / Segment</th>
                  <th className="p-4">Année de Sortie</th>
                  <th className="p-4">Attributs</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
                {filteredModels.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-black text-white text-sm">
                      {m.nom}
                    </td>
                    <td className="p-4 text-amber-400 font-bold">
                      {m.marque_nom || 'Marque'}
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 font-medium">
                        {m.categorie}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-medium">
                      Depuis {m.annee_debut || 2020}
                    </td>
                    <td className="p-4">
                      {m.is_popular === 1 ? (
                        <span className="text-[10px] text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
                          <Star className="w-3 h-3 fill-amber-400" /> Best-seller RDC
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModelModal(m)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModel(m.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setIsBrandModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              {editingBrand ? 'Modifier la Marque' : 'Ajouter une Marque'}
            </h3>

            <form onSubmit={handleSaveBrand} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom de la marque *</label>
                <input
                  type="text"
                  required
                  value={brandNom}
                  onChange={(e) => setBrandNom(e.target.value)}
                  placeholder="Ex : Toyota, Nissan, Hyundai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Pays d'origine</label>
                <input
                  type="text"
                  value={brandPays}
                  onChange={(e) => setBrandPays(e.target.value)}
                  placeholder="Ex : Japon, Allemagne, Corée du Sud"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">URL Logo (optionnel)</label>
                <input
                  type="url"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="brandPopularCheck"
                  checked={brandPopular}
                  onChange={(e) => setBrandPopular(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="brandPopularCheck" className="text-slate-300 font-medium cursor-pointer">
                  Marque populaire en vedette (mise en avant sur l'accueil)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Model Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setIsModelModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              {editingModel ? 'Modifier le Modèle' : 'Ajouter un Modèle'}
            </h3>

            <form onSubmit={handleSaveModel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Marque Automobile *</label>
                <select
                  value={modelMarqueId}
                  onChange={(e) => setModelMarqueId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom du modèle *</label>
                <input
                  type="text"
                  required
                  value={modelNom}
                  onChange={(e) => setModelNom(e.target.value)}
                  placeholder="Ex : Land Cruiser, Hilux, RAV4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Catégorie</label>
                  <select
                    value={modelCategorie}
                    onChange={(e) => setModelCategorie(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="SUV">SUV / 4x4</option>
                    <option value="Berline">Berline</option>
                    <option value="Pick-up">Pick-up</option>
                    <option value="Coupé">Coupé / Sport</option>
                    <option value="Minivan">Minivan</option>
                    <option value="Camion">Utilitaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Année début</label>
                  <input
                    type="number"
                    value={modelAnneeDebut}
                    onChange={(e) => setModelAnneeDebut(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modelPopularCheck"
                  checked={modelPopular}
                  onChange={(e) => setModelPopular(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="modelPopularCheck" className="text-slate-300 font-medium cursor-pointer">
                  Modèle très recherché (Best-seller)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModelModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
