import { useEffect, useState } from "react";
import { IdCard, Mail, Briefcase, Upload, Trash2, FileText, X } from "lucide-react";
import { api, apiUpload } from "../../../lib/api";

interface Instruktur {
  user_id: number;
  email: string;
  nama_lengkap: string | null;
  posisi: string;
  lamaran_id: number;
}

interface Dokumen {
  id: number;
  jenis_dokumen: "npwp" | "bpjs" | "kontrak";
  nama_file: string;
  file_url: string;
  ukuran_file: number | null;
  status_verifikasi: string;
  created_at: string;
}

const JENIS_LABEL: Record<string, string> = { npwp: "NPWP", bpjs: "BPJS", kontrak: "Kontrak" };

export function AdminPengajarPage() {
  const [list, setList] = useState<Instruktur[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Instruktur | null>(null);
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [jenisUpload, setJenisUpload] = useState<"npwp" | "bpjs" | "kontrak">("npwp");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get<Instruktur[]>("/kepegawaian/instruktur")
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openDetail(i: Instruktur) {
    setTarget(i);
    setError("");
    loadDokumen(i.user_id);
  }

  function loadDokumen(userId: number) {
    setDocLoading(true);
    api.get<Dokumen[]>(`/kepegawaian/${userId}`)
      .then(setDokumen)
      .catch(() => {})
      .finally(() => setDocLoading(false));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!target || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jenisDokumen", jenisUpload);
      await apiUpload(`/kepegawaian/${target.user_id}`, formData);
      loadDokumen(target.user_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(d: Dokumen) {
    if (!target) return;
    if (!confirm(`Hapus dokumen ${JENIS_LABEL[d.jenis_dokumen]}?`)) return;
    try {
      await api.delete(`/kepegawaian/${target.user_id}/${d.id}`);
      loadDokumen(target.user_id);
    } catch {
      alert("Gagal menghapus dokumen");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Data Pengajar</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dokumen kepegawaian pengajar yang telah diterima</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <IdCard size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-slate-800">{list.length}</span>
          <span className="text-xs text-slate-400">pengajar</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <IdCard size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada pengajar yang diterima</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Pengajar</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Posisi</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((i) => (
                  <tr key={i.user_id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-700">{i.nama_lengkap || i.email}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10} /> {i.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Briefcase size={12} className="text-slate-400" />
                        <span className="text-xs">{i.posisi}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openDetail(i)}
                        className="px-3 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Dokumen Kepegawaian
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Dokumen Kepegawaian</h2>
              <button onClick={() => setTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="p-4 rounded-2xl space-y-1" style={{ background: "#F8FAFC" }}>
              <p className="font-semibold text-slate-800">{target.nama_lengkap || target.email}</p>
              <p className="text-xs text-slate-500">{target.posisi}</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                value={jenisUpload}
                onChange={(e) => setJenisUpload(e.target.value as "npwp" | "bpjs" | "kontrak")}
              >
                <option value="npwp">NPWP</option>
                <option value="bpjs">BPJS</option>
                <option value="kontrak">Kontrak</option>
              </select>
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white cursor-pointer"
                style={{ background: uploading ? "#93C5FD" : "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                <Upload size={14} />
                {uploading ? "Mengunggah..." : "Unggah PDF (maks. 10MB)"}
                <input type="file" accept="application/pdf" className="hidden" disabled={uploading} onChange={handleUpload} />
              </label>
            </div>
            {error && (
              <div className="p-3 rounded-xl text-center" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden border border-slate-100">
              {docLoading ? (
                <div className="p-6 text-center text-slate-400 text-sm">Memuat...</div>
              ) : dokumen.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">Belum ada dokumen</div>
              ) : (
                dokumen.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                    <FileText size={16} className="text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{JENIS_LABEL[d.jenis_dokumen]}</p>
                      <p className="text-xs text-slate-400 truncate">{d.nama_file}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: "#ECFDF5", color: "#065F46" }}>
                      Aktif
                    </span>
                    <a href={`http://localhost:3001${d.file_url}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Lihat</a>
                    <button onClick={() => handleDelete(d)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
