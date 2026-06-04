import { useEffect, useState } from "react";
import { ClipboardList, Plus, ChevronDown, X, Check, AlertCircle, Clock, Users, Pencil } from "lucide-react";
import { api } from "../../../lib/api";

interface TesItem {
  id: number;
  judul: string;
  durasi_menit: number;
  jumlah_soal: number;
  jumlah_soal_aktual: number;
  kkm: number;
  status: string;
  posisi_lowongan: string | null;
  lowongan_id: number | null;
  jadwal_id: number | null;
  jadwal_tanggal: string | null;
  waktu_mulai: string | null;
  jumlah_peserta: number;
  peserta_selesai: number;
  peserta_koreksi: number;
}

interface PengerjaanItem {
  pengerjaan_id: number;
  lamaran_id: number;
  nama_lengkap: string | null;
  email: string;
  status: string;
  skor: number | null;
  jumlah_benar: number | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
}

interface EsaiJawaban {
  id: number;
  soal_id: number;
  pertanyaan: string;
  bobot: number;
  jawaban_text: string | null;
  nilai_esai: number | null;
  is_dinilai: number;
}

interface Soal { id: number; tipe: string; pertanyaan: string; }
interface Lowongan { id: number; posisi: string; }
interface Jadwal { id: number; jenis: string; tanggal: string; waktu_mulai: string; posisi_lowongan: string; }

const STATUS_PENG: Record<string, { label: string; bg: string; text: string }> = {
  belum_mulai:      { label: "Belum Mulai",       bg: "#F1F5F9", text: "#64748B" },
  berlangsung:      { label: "Berlangsung",        bg: "#EFF6FF", text: "#2563EB" },
  selesai:          { label: "Selesai",            bg: "#ECFDF5", text: "#065F46" },
  menunggu_koreksi: { label: "Menunggu Koreksi",   bg: "#FFFBEB", text: "#B45309" },
};

function fmtTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminTesPage() {
  const [tesList, setTesList]     = useState<TesItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedTes, setSelected]= useState<TesItem | null>(null);
  const [pengerjaan, setPengerjaan] = useState<PengerjaanItem[]>([]);
  const [loadingPeng, setLoadingPeng] = useState(false);

  // Form buat tes
  const [showForm, setShowForm] = useState(false);
  const [soalBank, setSoalBank]   = useState<Soal[]>([]);
  const [lowongans, setLowongans] = useState<Lowongan[]>([]);
  const [jadwals, setJadwals]     = useState<Jadwal[]>([]);
  const [selectedSoal, setSelectedSoal] = useState<number[]>([]);
  const [form, setForm] = useState({ judul: "", lowonganId: "", jadwalId: "", durasiMenit: 60, kkm: 60 });
  const [saving, setSaving] = useState(false);

  // Koreksi esai
  const [koreksiTarget, setKoreksiTarget] = useState<{ pengerjaanId: number; nama: string } | null>(null);
  const [esaiList, setEsaiList]   = useState<EsaiJawaban[]>([]);
  const [nilaiEsai, setNilaiEsai] = useState<Record<number, number>>({});
  const [savingKoreksi, setSavingKoreksi] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const loadTes = () => {
    setLoading(true);
    api.get<TesItem[]>("/tes/admin").then(setTesList).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadTes(); }, []);

  function openDetail(tes: TesItem) {
    setSelected(tes);
    setLoadingPeng(true);
    api.get<PengerjaanItem[]>(`/tes/admin/${tes.id}/pengerjaan`)
      .then(setPengerjaan).catch(() => {}).finally(() => setLoadingPeng(false));
  }

  async function openCreateForm() {
    const [soal, lows, jds] = await Promise.all([
      api.get<Soal[]>("/admin/bank-soal").catch(() => [] as Soal[]),
      api.get<Lowongan[]>("/lowongan/admin/semua").catch(() => [] as Lowongan[]),
      api.get<Jadwal[]>("/admin/jadwal").catch(() => [] as Jadwal[]),
    ]);
    setSoalBank(soal);
    setLowongans(lows);
    setJadwals(jds.filter(j => j.jenis === "tes_tertulis"));
    setSelectedSoal([]);
    setForm({ judul: "", lowonganId: "", jadwalId: "", durasiMenit: 60, kkm: 60 });
    setShowForm(true);
  }

  function toggleSoal(id: number) {
    setSelectedSoal(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  async function handleCreateTes() {
    if (!form.judul || selectedSoal.length === 0) {
      showToast("Bank soal belum tersedia, tambah soal terlebih dahulu", false);
      return;
    }
    setSaving(true);
    try {
      await api.post("/tes/admin", {
        judul: form.judul,
        lowonganId: form.lowonganId ? Number(form.lowonganId) : undefined,
        jadwalId: form.jadwalId ? Number(form.jadwalId) : undefined,
        durasiMenit: Number(form.durasiMenit),
        kkm: Number(form.kkm),
        soalIds: selectedSoal,
      });
      showToast("Paket tes berhasil dibuat dan peserta telah dinotifikasi");
      setShowForm(false);
      loadTes();
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal membuat tes", false);
    } finally {
      setSaving(false);
    }
  }

  async function openKoreksi(peng: PengerjaanItem) {
    setKoreksiTarget({ pengerjaanId: peng.pengerjaan_id, nama: peng.nama_lengkap || peng.email });
    try {
      const data = await api.get<{ soalEsai: EsaiJawaban[] }>(`/tes/admin/koreksi/${peng.pengerjaan_id}`);
      setEsaiList(data.soalEsai);
      const init: Record<number, number> = {};
      data.soalEsai.forEach(s => { if (s.nilai_esai != null) init[s.soal_id] = s.nilai_esai; });
      setNilaiEsai(init);
    } catch {
      showToast("Gagal memuat jawaban esai", false);
    }
  }

  async function handleSubmitKoreksi() {
    if (!koreksiTarget) return;
    setSavingKoreksi(true);
    try {
      await api.post(`/tes/admin/koreksi/${koreksiTarget.pengerjaanId}`, { nilaiEsai });
      showToast("Koreksi berhasil disimpan");
      setKoreksiTarget(null);
      if (selectedTes) openDetail(selectedTes);
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal menyimpan koreksi", false);
    } finally {
      setSavingKoreksi(false);
    }
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
          <h1 className="text-2xl font-semibold text-slate-800">Tes Online</h1>
          <p className="text-sm text-slate-500 mt-1">Jadwalkan dan kelola paket tes tertulis online</p>
        </div>
        <button onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
          <Plus size={16} /> Buat Paket Tes
        </button>
      </div>

      {/* List paket tes */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : tesList.length === 0 ? (
          <div className="py-20 text-center rounded-3xl"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,197,253,0.2)" }}>
            <ClipboardList size={48} className="mx-auto mb-4 opacity-25 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-700">Belum Ada Paket Tes</h2>
            <p className="text-sm text-slate-500 mt-1">Buat bank soal terlebih dahulu, lalu klik "Buat Paket Tes".</p>
          </div>
        ) : tesList.map(tes => (
          <div key={tes.id} className="rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}
            onClick={() => openDetail(tes)}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-semibold text-slate-800">{tes.judul}</h3>
                {tes.posisi_lowongan && <p className="text-xs text-slate-500 mt-0.5">{tes.posisi_lowongan}</p>}
                {tes.jadwal_tanggal && (
                  <p className="text-xs text-blue-500 mt-0.5">{fmtTgl(tes.jadwal_tanggal)} {tes.waktu_mulai?.slice(0, 5)} WIB</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock size={12} /> {tes.durasi_menit} menit</span>
                <span className="flex items-center gap-1"><ClipboardList size={12} /> {tes.jumlah_soal_aktual} soal</span>
                <span className="flex items-center gap-1"><Users size={12} /> {tes.jumlah_peserta} peserta</span>
                {tes.peserta_koreksi > 0 && (
                  <span className="px-2 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#B45309" }}>
                    {tes.peserta_koreksi} perlu koreksi
                  </span>
                )}
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail & pengerjaan modal */}
      {selectedTes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{selectedTes.judul}</h2>
                <p className="text-xs text-slate-500">KKM: {selectedTes.kkm} | Durasi: {selectedTes.durasi_menit} menit</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} className="text-slate-400" /></button>
            </div>

            {loadingPeng ? (
              <div className="p-8 text-center text-slate-400">Memuat data peserta...</div>
            ) : pengerjaan.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Belum ada peserta terdaftar</p>
            ) : (
              <div className="space-y-2">
                {pengerjaan.map(p => {
                  const st = STATUS_PENG[p.status] || STATUS_PENG.belum_mulai;
                  return (
                    <div key={p.pengerjaan_id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{p.nama_lengkap || p.email}</p>
                        {p.skor != null && <p className="text-xs text-slate-500 mt-0.5">Skor: {Number(p.skor).toFixed(1)}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.text }}>{st.label}</span>
                        {p.status === "menunggu_koreksi" && (
                          <button onClick={() => openKoreksi(p)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-amber-700 hover:bg-amber-50 transition-colors border border-amber-200">
                            <Pencil size={11} /> Koreksi Esai
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Koreksi esai modal */}
      {koreksiTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-xl rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Koreksi Esai</h2>
                <p className="text-xs text-slate-500">{koreksiTarget.nama}</p>
              </div>
              <button onClick={() => setKoreksiTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} className="text-slate-400" /></button>
            </div>

            {esaiList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Tidak ada soal esai</p>
            ) : esaiList.map((s, idx) => (
              <div key={s.id} className="space-y-2 p-4 rounded-2xl" style={{ background: "#F8FAFC" }}>
                <p className="text-xs text-slate-500 font-medium">Soal {idx + 1} (Bobot: {s.bobot})</p>
                <p className="text-sm text-slate-700 font-medium">{s.pertanyaan}</p>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 min-h-[60px]">
                  {s.jawaban_text || <span className="text-slate-300 italic">Tidak dijawab</span>}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-600 font-medium">Nilai (0–{s.bobot}):</label>
                  <input type="number" min={0} max={s.bobot} step={0.5}
                    className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                    value={nilaiEsai[s.soal_id] ?? ""}
                    onChange={e => setNilaiEsai(prev => ({ ...prev, [s.soal_id]: Number(e.target.value) }))} />
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setKoreksiTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleSubmitKoreksi} disabled={savingKoreksi}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                {savingKoreksi ? "Menyimpan..." : "Simpan Koreksi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buat Tes Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Buat Paket Tes Baru</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} className="text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Judul Tes *</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Contoh: Tes Tertulis Guru Matematika Batch 1"
                  value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Lowongan</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={form.lowonganId} onChange={e => setForm(f => ({ ...f, lowonganId: e.target.value }))}>
                  <option value="">Pilih lowongan...</option>
                  {lowongans.map(l => <option key={l.id} value={l.id}>{l.posisi}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jadwal Tes Tertulis</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={form.jadwalId} onChange={e => setForm(f => ({ ...f, jadwalId: e.target.value }))}>
                  <option value="">Tanpa jadwal</option>
                  {jadwals.map(j => (
                    <option key={j.id} value={j.id}>{fmtTgl(j.tanggal)} {j.waktu_mulai?.slice(0, 5)} — {j.posisi_lowongan}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Durasi (menit)</label>
                <input type="number" min={10} max={300}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={form.durasiMenit} onChange={e => setForm(f => ({ ...f, durasiMenit: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">KKM (0–100)</label>
                <input type="number" min={0} max={100}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={form.kkm} onChange={e => setForm(f => ({ ...f, kkm: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Pilih soal */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Pilih Soal ({selectedSoal.length} dipilih)
              </label>
              {soalBank.length === 0 ? (
                <div className="p-4 rounded-xl text-sm text-amber-700" style={{ background: "#FFFBEB" }}>
                  Bank soal belum tersedia, tambah soal terlebih dahulu
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {soalBank.map(s => {
                    const checked = selectedSoal.includes(s.id);
                    return (
                      <div key={s.id} className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-blue-50/30 transition-colors ${checked ? "bg-blue-50" : ""}`}
                        onClick={() => toggleSoal(s.id)}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${checked ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                          {checked && <Check size={10} color="white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs px-1.5 py-0.5 rounded mr-2"
                            style={s.tipe === "pilihan_ganda" ? { background: "#F5F3FF", color: "#7C3AED" } : { background: "#ECFDF5", color: "#065F46" }}>
                            {s.tipe === "pilihan_ganda" ? "PG" : "Esai"}
                          </span>
                          <span className="text-sm text-slate-700">{s.pertanyaan}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleCreateTes} disabled={saving || !form.judul || selectedSoal.length === 0}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                {saving ? "Menyimpan..." : "Jadwalkan Tes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
