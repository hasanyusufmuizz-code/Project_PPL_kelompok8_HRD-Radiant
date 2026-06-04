import { useEffect, useState } from "react";
import { Trophy, Check, X, AlertCircle, Mail } from "lucide-react";
import { api } from "../../../lib/api";

interface KelulusanItem {
  lamaran_id: number;
  status: string;
  nama_lengkap: string | null;
  email: string;
  posisi: string;
  lowongan_id: number;
  skor_tes: number | null;
  nilai_wawancara: number | null;
  nilai_gabungan: number;
  rekomendasi: string;
}

const REKOM_UI: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  "Direkomendasikan Lulus":  { bg: "#ECFDF5", text: "#065F46", icon: <Check size={12} /> },
  "Tidak Direkomendasikan":  { bg: "#FEF2F2", text: "#991B1B", icon: <X size={12} /> },
  "Belum Lengkap":           { bg: "#F1F5F9", text: "#64748B", icon: <AlertCircle size={12} /> },
};

const STATUS_UI: Record<string, { label: string; bg: string; text: string }> = {
  wawancara:  { label: "Wawancara",    bg: "#FFFBEB", text: "#B45309" },
  final:      { label: "Final Review", bg: "#ECFEFF", text: "#0E7490" },
  diterima:   { label: "Diterima",     bg: "#ECFDF5", text: "#065F46" },
  ditolak:    { label: "Ditolak",      bg: "#FEF2F2", text: "#991B1B" },
};

export function KelulusanPage() {
  const [data, setData]           = useState<KelulusanItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterPos, setFilterPos] = useState("");
  const [filterRek, setFilterRek] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<{ item: KelulusanItem; keputusan: "lulus" | "tidak_lulus" } | null>(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const load = () => {
    setLoading(true);
    api.get<KelulusanItem[]>("/admin/kelulusan").then(setData).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleKeputusan() {
    if (!confirmTarget) return;
    setSaving(true);
    try {
      await api.post(`/admin/kelulusan/${confirmTarget.item.lamaran_id}`, { keputusan: confirmTarget.keputusan });
      showToast(confirmTarget.keputusan === "lulus" ? "Kandidat dinyatakan Lulus" : "Kandidat dinyatakan Tidak Lulus");
      setConfirmTarget(null);
      load();
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal menyimpan keputusan", false);
    } finally {
      setSaving(false);
    }
  }

  const posisiList = [...new Set(data.map(d => d.posisi))];

  const filtered = data.filter(d => {
    if (filterPos && d.posisi !== filterPos) return false;
    if (filterRek && d.rekomendasi !== filterRek) return false;
    return true;
  });

  const stats = {
    total: data.length,
    direkomendasikan: data.filter(d => d.rekomendasi === "Direkomendasikan Lulus").length,
    tidak: data.filter(d => d.rekomendasi === "Tidak Direkomendasikan").length,
    diterima: data.filter(d => d.status === "diterima").length,
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 px-5 py-3 rounded-2xl text-sm text-white shadow-xl"
          style={{ background: toast.ok ? "#10B981" : "#EF4444" }}>
          {toast.ok ? <Check size={14} /> : <AlertCircle size={14} />} {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Penentuan Kelulusan</h1>
        <p className="text-sm text-slate-500 mt-1">Nilai gabungan tes + wawancara dan penetapan keputusan akhir</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Kandidat", count: stats.total, bg: "#EFF6FF", text: "#2563EB" },
          { label: "Direkomendasikan", count: stats.direkomendasikan, bg: "#ECFDF5", text: "#065F46" },
          { label: "Tidak Direkomendasikan", count: stats.tidak, bg: "#FEF2F2", text: "#991B1B" },
          { label: "Sudah Diterima", count: stats.diterima, bg: "#F0FDF4", text: "#16A34A" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg, border: `1px solid ${s.text}20` }}>
            <p className="text-2xl font-bold" style={{ color: s.text }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: s.text }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
          value={filterPos} onChange={e => setFilterPos(e.target.value)}>
          <option value="">Semua Posisi</option>
          {posisiList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
          value={filterRek} onChange={e => setFilterRek(e.target.value)}>
          <option value="">Semua Rekomendasi</option>
          <option value="Direkomendasikan Lulus">Direkomendasikan Lulus</option>
          <option value="Tidak Direkomendasikan">Tidak Direkomendasikan</option>
          <option value="Belum Lengkap">Belum Lengkap</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Trophy size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada kandidat yang mencapai tahap ini.</p>
            <p className="text-xs mt-2">Kandidat muncul setelah menyelesaikan tes dan wawancara.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Kandidat</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Posisi</th>
                  <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Skor Tes</th>
                  <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Nilai Wawancara</th>
                  <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Nilai Gabungan</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Rekomendasi</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Status</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const rk = REKOM_UI[item.rekomendasi] || REKOM_UI["Belum Lengkap"];
                  const st = STATUS_UI[item.status];
                  const isFinal = item.status === "diterima" || item.status === "ditolak";
                  return (
                    <tr key={item.lamaran_id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-700">{item.nama_lengkap || item.email}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10} />{item.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{item.posisi}</td>
                      <td className="px-5 py-3.5 text-center">
                        {item.skor_tes != null
                          ? <span className="font-semibold" style={{ color: item.skor_tes >= 60 ? "#059669" : "#DC2626" }}>{Number(item.skor_tes).toFixed(1)}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {item.nilai_wawancara != null
                          ? <span className="font-semibold" style={{ color: item.nilai_wawancara >= 60 ? "#059669" : "#DC2626" }}>{Number(item.nilai_wawancara).toFixed(1)}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-lg font-bold" style={{ color: item.nilai_gabungan >= 60 ? "#059669" : "#DC2626" }}>
                          {Number(item.nilai_gabungan).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit" style={{ background: rk.bg, color: rk.text }}>
                          {rk.icon} {item.rekomendasi}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {st && <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.text }}>{st.label}</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {!isFinal && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmTarget({ item, keputusan: "lulus" })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                              style={{ background: "#059669" }}>
                              Lulus
                            </button>
                            <button
                              onClick={() => setConfirmTarget({ item, keputusan: "tidak_lulus" })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                              style={{ background: "#DC2626" }}>
                              Tidak Lulus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Konfirmasi modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 bg-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: confirmTarget.keputusan === "lulus" ? "#ECFDF5" : "#FEF2F2" }}>
                {confirmTarget.keputusan === "lulus"
                  ? <Trophy size={20} color="#059669" />
                  : <X size={20} color="#DC2626" />}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Konfirmasi Keputusan</h2>
                <p className="text-sm text-slate-500">
                  {confirmTarget.keputusan === "lulus" ? "Nyatakan kandidat ini LULUS?" : "Nyatakan kandidat ini TIDAK LULUS?"}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: "#F8FAFC" }}>
              <p className="font-medium text-slate-700 text-sm">{confirmTarget.item.nama_lengkap || confirmTarget.item.email}</p>
              <p className="text-xs text-slate-500 mt-0.5">{confirmTarget.item.posisi} · Nilai gabungan: {Number(confirmTarget.item.nilai_gabungan).toFixed(1)}</p>
            </div>
            <p className="text-xs text-slate-400">Keputusan ini akan memperbarui status lamaran di seluruh modul dan mengirim notifikasi ke kandidat.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleKeputusan} disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ background: confirmTarget.keputusan === "lulus" ? "#059669" : "#DC2626" }}>
                {saving ? "Menyimpan..." : confirmTarget.keputusan === "lulus" ? "Ya, Lulus" : "Ya, Tidak Lulus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
