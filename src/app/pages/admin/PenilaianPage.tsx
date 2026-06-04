import { useEffect, useState } from "react";
import { Star, X, Check, AlertCircle, ChevronDown, Mail } from "lucide-react";
import { api } from "../../../lib/api";

interface PenilaianItem {
  id: number;
  lamaran_id: number;
  nama_lengkap: string | null;
  email: string;
  posisi: string;
  nilai_kompetensi: number;
  nilai_komunikasi: number;
  nilai_kepribadian: number;
  nilai_motivasi: number;
  nilai_total: number;
  rekomendasi: string;
  catatan: string | null;
  penilai_nama: string | null;
  created_at: string;
}

interface Pelamar {
  id: number;
  nama_lengkap: string | null;
  email: string;
  posisi: string;
  status: string;
  lowongan_id: number;
}

interface JadwalItem { id: number; jenis: string; tanggal: string; waktu_mulai: string; posisi_lowongan: string; }

const KRITERIA = [
  { key: "kompetensi",  label: "Kompetensi / Pengetahuan",   desc: "Pemahaman materi dan kemampuan teknis" },
  { key: "komunikasi",  label: "Komunikasi",                  desc: "Kemampuan menyampaikan ide secara jelas" },
  { key: "kepribadian", label: "Kepribadian / Attitude",      desc: "Sikap, sopan santun, dan profesionalisme" },
  { key: "motivasi",    label: "Motivasi & Komitmen",         desc: "Antusiasme dan keseriusan melamar" },
] as const;

const REKOM_UI: Record<string, { label: string; bg: string; text: string }> = {
  sangat_direkomendasikan: { label: "Sangat Direkomendasikan", bg: "#ECFDF5", text: "#065F46" },
  direkomendasikan:         { label: "Direkomendasikan",        bg: "#EFF6FF", text: "#2563EB" },
  tidak_direkomendasikan:   { label: "Tidak Direkomendasikan",  bg: "#FEF2F2", text: "#991B1B" },
};

function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[20, 40, 60, 80, 100].map(v => (
        <button key={v} onClick={() => onChange(v)}
          className="w-10 h-8 rounded-lg text-xs font-medium transition-all border"
          style={{
            borderColor: value >= v ? "#2563EB" : "#E2E8F0",
            background: value >= v ? "#2563EB" : "white",
            color: value >= v ? "white" : "#94A3B8",
          }}>
          {v}
        </button>
      ))}
      <input type="number" min={0} max={100} className="w-16 ml-1 px-2 py-1.5 rounded-xl border border-slate-200 text-sm text-center focus:outline-none focus:border-blue-400"
        value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

function fmtTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function PenilaianPage() {
  const [riwayat, setRiwayat]   = useState<PenilaianItem[]>([]);
  const [pelamars, setPelamars] = useState<Pelamar[]>([]);
  const [jadwals, setJadwals]   = useState<JadwalItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const [formLamaranId, setFormLamaranId] = useState("");
  const [formJadwalId, setFormJadwalId]   = useState("");
  const [formCatatan, setFormCatatan]     = useState("");
  const [formNilai, setFormNilai] = useState({ kompetensi: 60, komunikasi: 60, kepribadian: 60, motivasi: 60 });

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const loadRiwayat = () => {
    setLoading(true);
    api.get<PenilaianItem[]>("/penilaian").then(setRiwayat).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRiwayat();
    api.get<Pelamar[]>("/pelamar/admin?status=wawancara").then(setPelamars).catch(() => {});
    api.get<JadwalItem[]>("/admin/jadwal").then(d => setJadwals(d.filter(j => j.jenis === "wawancara"))).catch(() => {});
  }, []);

  const nilaiTotal = (Object.values(formNilai).reduce((a, b) => a + b, 0) / 4);

  async function handleSubmit() {
    if (!formLamaranId) { showToast("Pilih pelamar terlebih dahulu", false); return; }
    setSaving(true);
    try {
      await api.post("/penilaian", {
        lamaranId: Number(formLamaranId),
        jadwalId: formJadwalId ? Number(formJadwalId) : undefined,
        nilaiKompetensi: formNilai.kompetensi,
        nilaiKomunikasi: formNilai.komunikasi,
        nilaiKepribadian: formNilai.kepribadian,
        nilaiMotivasi: formNilai.motivasi,
        catatan: formCatatan,
      });
      showToast("Penilaian berhasil disimpan");
      setShowForm(false);
      loadRiwayat();
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal menyimpan penilaian", false);
    } finally {
      setSaving(false);
    }
  }

  function openForm() {
    setFormLamaranId(""); setFormJadwalId(""); setFormCatatan("");
    setFormNilai({ kompetensi: 60, komunikasi: 60, kepribadian: 60, motivasi: 60 });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 px-5 py-3 rounded-2xl text-sm text-white shadow-xl"
          style={{ background: toast.ok ? "#10B981" : "#EF4444" }}>
          {toast.ok ? <Check size={14} /> : <AlertCircle size={14} />} {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Penilaian Wawancara</h1>
          <p className="text-sm text-slate-500 mt-1">Input rubrik penilaian kandidat pascawawancara</p>
        </div>
        <button onClick={openForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
          <Star size={16} /> Input Penilaian
        </button>
      </div>

      {/* Riwayat penilaian */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : riwayat.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada penilaian wawancara.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Kandidat</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Posisi</th>
                  <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Nilai Total</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Rekomendasi</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Penilai</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map(p => {
                  const rk = REKOM_UI[p.rekomendasi] || REKOM_UI.tidak_direkomendasikan;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-700">{p.nama_lengkap || p.email}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10} /> {p.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{p.posisi}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-lg font-bold" style={{ color: p.nilai_total >= 60 ? "#059669" : "#DC2626" }}>
                          {Number(p.nilai_total).toFixed(1)}
                        </span>
                        <div className="text-xs text-slate-400 mt-0.5">
                          K:{p.nilai_kompetensi} M:{p.nilai_komunikasi} P:{p.nilai_kepribadian} Mo:{p.nilai_motivasi}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: rk.bg, color: rk.text }}>{rk.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{p.penilai_nama || "-"}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{fmtTgl(p.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form penilaian modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-xl rounded-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Form Penilaian Wawancara</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} className="text-slate-400" /></button>
            </div>

            {/* Pilih kandidat */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Kandidat (status Wawancara) *</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                value={formLamaranId} onChange={e => setFormLamaranId(e.target.value)}>
                <option value="">Pilih kandidat...</option>
                {pelamars.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_lengkap || p.email} — {p.posisi}</option>
                ))}
              </select>
            </div>

            {/* Pilih jadwal */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Sesi Wawancara (opsional)</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                value={formJadwalId} onChange={e => setFormJadwalId(e.target.value)}>
                <option value="">Tanpa jadwal spesifik</option>
                {jadwals.map(j => (
                  <option key={j.id} value={j.id}>{fmtTgl(j.tanggal)} {j.waktu_mulai?.slice(0, 5)} — {j.posisi_lowongan}</option>
                ))}
              </select>
            </div>

            {/* Rubrik */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-slate-600">Rubrik Penilaian (0–100 per kriteria) *</p>
              {KRITERIA.map(k => (
                <div key={k.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{k.label}</p>
                      <p className="text-xs text-slate-400">{k.desc}</p>
                    </div>
                    <span className="text-lg font-bold" style={{ color: formNilai[k.key] >= 60 ? "#059669" : "#DC2626" }}>
                      {formNilai[k.key]}
                    </span>
                  </div>
                  <ScoreInput value={formNilai[k.key]} onChange={v => setFormNilai(f => ({ ...f, [k.key]: v }))} />
                </div>
              ))}
            </div>

            {/* Rata-rata */}
            <div className="p-4 rounded-2xl text-center" style={{ background: nilaiTotal >= 60 ? "#ECFDF5" : "#FEF2F2" }}>
              <p className="text-xs" style={{ color: nilaiTotal >= 60 ? "#065F46" : "#991B1B" }}>Nilai Total (Rata-rata)</p>
              <p className="text-3xl font-bold mt-1" style={{ color: nilaiTotal >= 60 ? "#059669" : "#DC2626" }}>
                {nilaiTotal.toFixed(1)}
              </p>
              <p className="text-xs mt-1" style={{ color: nilaiTotal >= 60 ? "#065F46" : "#991B1B" }}>
                {nilaiTotal >= 60 ? "Memenuhi standar kelulusan (KKM: 60)" : "Tidak memenuhi standar kelulusan (KKM: 60)"}
              </p>
            </div>

            {/* Catatan */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Tambahan</label>
              <textarea rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Catatan evaluasi wawancara (opsional)..."
                value={formCatatan} onChange={e => setFormCatatan(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleSubmit} disabled={saving || !formLamaranId}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                {saving ? "Menyimpan..." : "Submit Penilaian"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
