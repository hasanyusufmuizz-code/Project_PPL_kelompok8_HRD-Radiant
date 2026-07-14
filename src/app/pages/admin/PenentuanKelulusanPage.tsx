import { useEffect, useState } from "react";
import { GraduationCap, Mail, Briefcase, CheckCircle, XCircle, X } from "lucide-react";
import { api } from "../../../lib/api";

interface Kelulusan {
  lamaran_id: number;
  status: string;
  catatan_hrd: string | null;
  user_id: number;
  email: string;
  nama_lengkap: string | null;
  lowongan_id: number;
  posisi: string;
  nilai_tes: number | null;
  nilai_wawancara: number | null;
  nilai_gabungan: number | null;
  rekomendasi: "Lulus" | "Tidak Lulus" | null;
}

export function PenentuanKelulusanPage() {
  const [list, setList] = useState<Kelulusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Kelulusan | null>(null);
  const [decision, setDecision] = useState<"diterima" | "ditolak">("diterima");
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get<Kelulusan[]>("/kelulusan")
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openDetail(k: Kelulusan) {
    setTarget(k);
    setDecision(k.rekomendasi === "Tidak Lulus" ? "ditolak" : "diterima");
    setCatatan(k.catatan_hrd || "");
  }

  async function handleSave() {
    if (!target) return;
    setSaving(true);
    try {
      await api.patch(`/pelamar/admin/${target.lamaran_id}/status`, { status: decision, catatan_hrd: catatan });
      setTarget(null);
      load();
    } catch {
      alert("Gagal menyimpan status kelulusan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Penentuan Kelulusan</h1>
          <p className="text-sm text-slate-500 mt-1">Rekomendasi kelulusan berdasarkan gabungan nilai tes dan wawancara</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <GraduationCap size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-slate-800">{list.length}</span>
          <span className="text-xs text-slate-400">menunggu keputusan</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
            <p>Tidak ada pelamar yang menunggu keputusan kelulusan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Pelamar</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Posisi</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Nilai Tes</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Nilai Wawancara</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Nilai Gabungan</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Rekomendasi</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((k) => (
                  <tr key={k.lamaran_id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-700">{k.nama_lengkap || k.email}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10} /> {k.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Briefcase size={12} className="text-slate-400" />
                        <span className="text-xs">{k.posisi}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{k.nilai_tes ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-600">{k.nilai_wawancara ?? "—"}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{k.nilai_gabungan ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      {k.rekomendasi ? (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={
                            k.rekomendasi === "Lulus"
                              ? { background: "#ECFDF5", color: "#065F46" }
                              : { background: "#FEF2F2", color: "#991B1B" }
                          }
                        >
                          {k.rekomendasi}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Nilai belum lengkap</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openDetail(k)}
                        className="px-3 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Tetapkan Status
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
          <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Tetapkan Status Kelulusan</h2>
              <button onClick={() => setTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="p-4 rounded-2xl space-y-1" style={{ background: "#F8FAFC" }}>
              <p className="font-semibold text-slate-800">{target.nama_lengkap || target.email}</p>
              <p className="text-xs text-slate-500">{target.posisi}</p>
              <p className="text-xs text-slate-500">Nilai gabungan: <strong>{target.nilai_gabungan ?? "—"}</strong> · Rekomendasi sistem: <strong>{target.rekomendasi ?? "—"}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDecision("diterima")}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                style={{
                  borderColor: decision === "diterima" ? "#065F46" : "#E2E8F0",
                  background: decision === "diterima" ? "#ECFDF5" : "white",
                  color: decision === "diterima" ? "#065F46" : "#64748B",
                }}
              >
                <CheckCircle size={14} /> Lulus
              </button>
              <button
                onClick={() => setDecision("ditolak")}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                style={{
                  borderColor: decision === "ditolak" ? "#991B1B" : "#E2E8F0",
                  background: decision === "ditolak" ? "#FEF2F2" : "white",
                  color: decision === "ditolak" ? "#991B1B" : "#64748B",
                }}
              >
                <XCircle size={14} /> Tidak Lulus
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan HRD (opsional)</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
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
