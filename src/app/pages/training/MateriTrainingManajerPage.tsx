import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, FileText, X } from "lucide-react";
import { api, apiUpload } from "../../../lib/api";

interface Materi {
  id: number;
  judul: string;
  deskripsi: string | null;
  nama_file: string;
  file_url: string;
  pemateri_nama: string;
  created_at: string;
}

export function MateriTrainingManajerPage() {
  const [list, setList] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Materi | null>(null);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [pemateriNama, setPemateriNama] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    api.get<Materi[]>("/materi-training")
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function openAdd() {
    setEditTarget(null);
    setJudul("");
    setDeskripsi("");
    setPemateriNama("");
    setFile(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(m: Materi) {
    setEditTarget(m);
    setJudul(m.judul);
    setDeskripsi(m.deskripsi || "");
    setPemateriNama(m.pemateri_nama);
    setFile(null);
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!judul.trim() || !pemateriNama.trim()) {
      setError("Judul dan pemateri wajib diisi");
      return;
    }
    if (!editTarget && !file) {
      setError("File materi wajib diunggah");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("judul", judul.trim());
      formData.append("deskripsi", deskripsi.trim());
      formData.append("pemateriNama", pemateriNama.trim());
      if (file) formData.append("file", file);

      if (editTarget) {
        await apiUpload(`/materi-training/admin/${editTarget.id}`, formData, "PUT");
        showToast("Materi berhasil diperbarui");
      } else {
        await apiUpload("/materi-training/admin", formData);
        showToast("Materi berhasil ditambahkan");
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan materi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(m: Materi) {
    if (!confirm(`Hapus materi "${m.judul}"?`)) return;
    try {
      await api.delete(`/materi-training/admin/${m.id}`);
      showToast("Materi berhasil dihapus");
      load();
    } catch {
      alert("Gagal menghapus materi");
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-sm text-white shadow-xl" style={{ background: "#10B981" }}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Kelola Materi Training</h1>
          <p className="text-sm text-slate-500 mt-1">Materi pelatihan dan data pemateri untuk pengajar baru</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
        >
          <Plus size={15} /> Tambah Materi
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada materi training</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Materi</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Pemateri</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">File</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-700">{m.judul}</p>
                      {m.deskripsi && <p className="text-xs text-slate-400 mt-0.5">{m.deskripsi}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{m.pemateri_nama}</td>
                    <td className="px-5 py-3.5">
                      <a href={`http://localhost:3001${m.file_url}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <FileText size={12} /> {m.nama_file}
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                          <Pencil size={14} className="text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(m)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editTarget ? "Edit Materi" : "Tambah Materi"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Judul</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Deskripsi</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Pemateri</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                value={pemateriNama}
                onChange={(e) => setPemateriNama(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                File Materi {editTarget && <span className="text-slate-400 font-normal">(kosongkan jika tidak ingin diubah)</span>}
              </label>
              <input
                type="file"
                className="w-full text-sm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-center" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
