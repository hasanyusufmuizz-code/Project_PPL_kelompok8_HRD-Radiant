import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Briefcase, Users, Clock } from "lucide-react";
import { api } from "../../../lib/api";

interface Lowongan {
  id: number;
  posisi: string;
  deskripsi: string | null;
  persyaratan: string | null;
  kuota: number;
  deadline: string;
  status: "aktif" | "ditutup" | "draft";
  jumlah_pelamar: number;
  created_at: string;
}

const emptyForm = { posisi: "", deskripsi: "", persyaratan: "", kuota: 1, deadline: "", status: "aktif" as const };

function formatTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  aktif:   { bg: "#ECFDF5", text: "#065F46", label: "Aktif" },
  ditutup: { bg: "#FEF2F2", text: "#991B1B", label: "Ditutup" },
  draft:   { bg: "#FFF7ED", text: "#92400E", label: "Draft" },
};

export function KelolaLowonganPage() {
  const [list, setList] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.get<Lowongan[]>("/lowongan/admin/semua")
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(l: Lowongan) {
    setForm({
      posisi: l.posisi,
      deskripsi: l.deskripsi || "",
      persyaratan: l.persyaratan || "",
      kuota: l.kuota,
      deadline: l.deadline.slice(0, 10),
      status: l.status,
    });
    setEditId(l.id);
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.posisi.trim() || !form.deadline) {
      setError("Posisi dan deadline wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await api.put(`/lowongan/admin/${editId}`, form);
      } else {
        await api.post("/lowongan/admin", form);
      }
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/lowongan/admin/${id}`);
      setDeleteId(null);
      load();
    } catch {
      alert("Gagal menghapus lowongan");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Kelola Lowongan</h1>
          <p className="text-sm text-slate-500 mt-1">Buat, edit, dan kelola lowongan pengajar</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
        >
          <Plus size={16} /> Buat Lowongan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Lowongan", val: list.length, icon: Briefcase, color: "#3B82F6", bg: "#EFF6FF" },
          { label: "Lowongan Aktif",  val: list.filter(l => l.status === "aktif").length, icon: Clock, color: "#10B981", bg: "#ECFDF5" },
          { label: "Total Pelamar",   val: list.reduce((s, l) => s + (l.jumlah_pelamar || 0), 0), icon: Users, color: "#8B5CF6", bg: "#F5F3FF" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800">{s.val}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada lowongan. Buat lowongan pertama!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Posisi</th>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Deadline</th>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Kuota</th>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Pelamar</th>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Status</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((l) => {
                const sc = STATUS_COLOR[l.status];
                return (
                  <tr key={l.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{l.posisi}</p>
                      {l.deskripsi && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{l.deskripsi}</p>}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatTgl(l.deadline)}</td>
                    <td className="px-5 py-4 text-slate-600">{l.kuota} orang</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Users size={13} /> {l.jumlah_pelamar || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(l)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(l.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4"
            style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editId ? "Edit Lowongan" : "Buat Lowongan Baru"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Posisi *</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Pengajar Matematika SD"
                  value={form.posisi}
                  onChange={(e) => setForm({ ...form, posisi: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Deadline *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Kuota</label>
                  <input
                    type="number" min="1"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    value={form.kuota}
                    onChange={(e) => setForm({ ...form, kuota: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                >
                  <option value="aktif">Aktif</option>
                  <option value="draft">Draft</option>
                  <option value="ditutup">Ditutup</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Deskripsi</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                  placeholder="Deskripsi pekerjaan..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Persyaratan</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                  placeholder="Persyaratan pelamar..."
                  value={form.persyaratan}
                  onChange={(e) => setForm({ ...form, persyaratan: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
              >
                {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Publikasikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4 text-center" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <Trash2 size={22} color="#EF4444" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Hapus Lowongan?</h3>
              <p className="text-sm text-slate-500 mt-1">Data pelamar yang terkait juga akan terhapus.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
