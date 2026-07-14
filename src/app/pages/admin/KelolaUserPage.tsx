import { useEffect, useState } from "react";
import {
  Users, Search, Filter, Mail, Phone, Shield, UserCog,
  X, Trash2, Lock, ToggleLeft, ToggleRight, ChevronDown,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface UserItem {
  id: number;
  email: string;
  role: "pelamar" | "hrd" | "admin" | "manajer_training" | "pimpinan";
  is_active: number;
  created_at: string;
  nama_lengkap: string | null;
  no_hp: string | null;
  avatar_url: string | null;
  jumlah_lamaran: number;
}

const ROLE_META = {
  admin:            { label: "Admin",            bg: "#F5F3FF", text: "#7C3AED" },
  hrd:              { label: "HRD",              bg: "#EFF6FF", text: "#2563EB" },
  pelamar:          { label: "Pelamar",          bg: "#ECFDF5", text: "#065F46" },
  manajer_training: { label: "Manajer Training", bg: "#FFF7ED", text: "#C2410C" },
  pimpinan:         { label: "Pimpinan",         bg: "#FFFBEB", text: "#B45309" },
};

function formatTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function KelolaUserPage() {
  const { user: me } = useAuth();
  const [list, setList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState<UserItem["role"]>("pelamar");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterRole) params.set("role", filterRole);
    if (search) params.set("search", search);
    api.get<UserItem[]>(`/admin/users?${params}`)
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterRole]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  function openEdit(u: UserItem) {
    setEditTarget(u);
    setNewRole(u.role);
    setNewPassword("");
  }

  async function handleSave() {
    if (!editTarget) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { role: newRole };
      if (newPassword) body.password = newPassword;
      await api.patch(`/admin/users/${editTarget.id}`, body);
      setEditTarget(null);
      load();
      showToast("User berhasil diperbarui.");
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal memperbarui.", false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(u: UserItem) {
    try {
      await api.patch(`/admin/users/${u.id}`, { is_active: u.is_active ? 0 : 1 });
      load();
      showToast(u.is_active ? `Akun ${u.email} dinonaktifkan.` : `Akun ${u.email} diaktifkan.`);
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal.", false);
    }
  }

  async function handleDelete(u: UserItem) {
    if (!confirm(`Hapus permanen akun ${u.email}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      load();
      showToast(`Akun ${u.email} dihapus.`);
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal menghapus.", false);
    }
  }

  const stats = [
    { label: "Total",   count: list.length,                                    bg: "#EFF6FF", text: "#2563EB" },
    { label: "Admin",   count: list.filter(u => u.role === "admin").length,    bg: "#F5F3FF", text: "#7C3AED" },
    { label: "HRD",     count: list.filter(u => u.role === "hrd").length,      bg: "#EFF6FF", text: "#1D4ED8" },
    { label: "Pelamar", count: list.filter(u => u.role === "pelamar").length,  bg: "#ECFDF5", text: "#065F46" },
    { label: "Nonaktif",count: list.filter(u => !u.is_active).length,          bg: "#FEF2F2", text: "#991B1B" },
  ];

  const isAdmin = me?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-sm text-white shadow-xl"
          style={{ background: toast.ok ? "#10B981" : "#EF4444" }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Kelola User</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola akun admin, HRD, dan pelamar</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <Users size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-slate-800">{list.length}</span>
          <span className="text-xs text-slate-400">user</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-3"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 8px rgba(59,130,246,0.05)" }}>
            <p className="text-xl font-semibold" style={{ color: s.text }}>{s.count}</p>
            <p className="text-xs mt-0.5 text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl text-white text-sm"
            style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>Cari</button>
        </form>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="hrd">HRD</option>
            <option value="pelamar">Pelamar</option>
            <option value="manajer_training">Manajer Training</option>
            <option value="pimpinan">Pimpinan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>Tidak ada user ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[780px]">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">User</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Role</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Status</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Lamaran</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Bergabung</th>
                  {isAdmin && <th className="px-5 py-3.5"></th>}
                </tr>
              </thead>
              <tbody>
                {list.map(u => {
                  const roleMeta = ROLE_META[u.role];
                  const isSelf = u.id === me?.id;
                  return (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors"
                      style={{ opacity: u.is_active ? 1 : 0.55 }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#3B82F6,#6366F1)" }}>
                            {(u.nama_lengkap || u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">
                              {u.nama_lengkap || "—"}
                              {isSelf && <span className="ml-2 text-xs text-blue-400">(kamu)</span>}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail size={10} /> {u.email}
                            </p>
                            {u.no_hp && (
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Phone size={10} /> {u.no_hp}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: roleMeta.bg, color: roleMeta.text }}>
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: u.is_active ? "#ECFDF5" : "#F1F5F9",
                            color: u.is_active ? "#065F46" : "#64748B",
                          }}>
                          {u.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{u.jumlah_lamaran} lamaran</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{formatTgl(u.created_at)}</td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          {!isSelf && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEdit(u)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors">
                                <ChevronDown size={12} /> Edit
                              </button>
                              <button onClick={() => handleToggleActive(u)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                title={u.is_active ? "Nonaktifkan" : "Aktifkan"}>
                                {u.is_active
                                  ? <ToggleRight size={16} className="text-green-500" />
                                  : <ToggleLeft size={16} className="text-slate-400" />}
                              </button>
                              <button onClick={() => handleDelete(u)}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Hapus">
                                <Trash2 size={14} className="text-red-400" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 space-y-5"
            style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Edit User</h2>
              <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Info */}
            <div className="p-4 rounded-2xl space-y-1" style={{ background: "#F8FAFC" }}>
              <p className="font-semibold text-slate-800">{editTarget.nama_lengkap || editTarget.email}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={11} /> {editTarget.email}</p>
              <p className="text-xs text-slate-400">{editTarget.jumlah_lamaran} lamaran terdaftar</p>
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block flex items-center gap-1.5">
                <Shield size={12} /> Ubah Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["pelamar", "hrd", "admin", "manajer_training", "pimpinan"] as const).map(r => {
                  const meta = ROLE_META[r];
                  return (
                    <button key={r} onClick={() => setNewRole(r)}
                      className="px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all"
                      style={{
                        borderColor: newRole === r ? meta.text : "#E2E8F0",
                        background: newRole === r ? meta.bg : "white",
                        color: newRole === r ? meta.text : "#64748B",
                      }}>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset Password */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block flex items-center gap-1.5">
                <Lock size={12} /> Reset Password <span className="text-slate-400 font-normal">(kosongkan jika tidak ingin diubah)</span>
              </label>
              <input
                type="password"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                placeholder="Password baru (min. 6 karakter)..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setEditTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>

            {/* Danger zone */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><UserCog size={11} /> Tindakan Berbahaya</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { handleToggleActive(editTarget); setEditTarget(null); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
                  {editTarget.is_active
                    ? <><ToggleLeft size={13} /> Nonaktifkan</>
                    : <><ToggleRight size={13} /> Aktifkan</>}
                </button>
                <button
                  onClick={() => { setEditTarget(null); handleDelete(editTarget); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={13} /> Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
