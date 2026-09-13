import React, { useState, useEffect } from 'react';
import { 
  Users, Search, PlusCircle, Shield, Trash2, Edit, CheckCircle, 
  XCircle, Lock, RefreshCw, AlertCircle, Phone, Mail, MapPin, X
} from 'lucide-react';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  is_active: number;
  created_at: string;
}

export const AdminUsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('Kinshasa');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('autoconcession_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/admin/users', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (roleFilter !== 'all') url.searchParams.set('role', roleFilter);
      url.searchParams.set('limit', '100');

      const res = await fetch(url.toString(), { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.is_active === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ is_active: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleChangeRole = async (user: UserItem, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Confirmez-vous la suppression irréversible de cet utilisateur ?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          phone: newPhone,
          city: newCity
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewPhone('');
        fetchUsers();
      } else {
        setCreateError(data.message || 'Impossible de créer le compte.');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Erreur réseau');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filters and Search */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher utilisateur (nom, email, téléphone)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Rôle :</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white font-medium rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="dealer">Concessionnaires</option>
              <option value="garage">Garages partenaires</option>
              <option value="seller">Vendeurs / Commerciaux</option>
              <option value="user">Utilisateurs particuliers</option>
            </select>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Créer un Utilisateur</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-800">
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Contact & Ville</th>
                <th className="p-4">Rôle Système</th>
                <th className="p-4">Statut Compte</th>
                <th className="p-4">Date d'inscription</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                    Chargement des comptes utilisateurs...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActive = u.is_active === 1;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="font-extrabold text-white text-sm">{u.name}</div>
                        <div className="text-slate-400 text-[11px]">{u.email}</div>
                      </td>
                      <td className="p-4 text-slate-300 space-y-0.5">
                        {u.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {u.phone}</div>}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="w-3 h-3 text-slate-500" /> {u.city || 'Kinshasa'}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          className={`font-bold text-[11px] px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            u.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                            u.role === 'dealer' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            u.role === 'garage' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="user">Utilisateur (user)</option>
                          <option value="dealer">Concessionnaire (dealer)</option>
                          <option value="garage">Garage (garage)</option>
                          <option value="seller">Vendeur (seller)</option>
                          <option value="admin">Administrateur (admin)</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
                          }`}
                          title={isActive ? 'Cliquer pour suspendre le compte' : 'Cliquer pour réactiver'}
                        >
                          {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{isActive ? 'Actif' : 'Suspendu'}</span>
                        </button>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(u.created_at || Date.now()).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                          title="Supprimer définitivement l'utilisateur"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Créer Utilisateur */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Nouveau Compte Utilisateur
            </h3>

            {createError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Christian Maloba"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Adresse Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ex: c.maloba@entreprise.cd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Mot de passe provisoire *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Rôle assigné</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="user">Utilisateur standard</option>
                    <option value="dealer">Concessionnaire</option>
                    <option value="garage">Garage Partenaire</option>
                    <option value="seller">Vendeur / Commercial</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ville</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Kinshasa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Numéro de téléphone / WhatsApp</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+243 81 000 0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {createLoading ? 'Création en cours...' : 'Créer le Compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
