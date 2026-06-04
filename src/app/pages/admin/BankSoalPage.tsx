import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";
import { api } from "../../../lib/api";

interface Soal {
  id: number;
  tipe: "pilihan_ganda" | "esai";
  pertanyaan: string;
  opsi_a: string | null;
  opsi_b: string | null;
  opsi_c: string | null;
  opsi_d: string | null;
  kunci_jawaban: "A" | "B" | "C" | "D" | null;
  bobot: number;
  lowongan_id: number | null;
  dibuat_oleh_nama: string | null;
  created_at: string;
}

interface Lowongan { id: number; posisi: string; }

const EMPTY_FORM = {
  tipe: "pilihan_ganda" as "pilihan_ganda" | "esai",
  pertanyaan: "",
  opsiA: "", opsiB: "", opsiC: "", opsiD: "",
  kunciJawaban: "A" as "A" | "B" | "C" | "D",
  bobot: 1,
  lowonganId: "",
};

export function BankSoalPage() {
  const [soalList, setSoalList]     = useState<Soal[]>([]);
  const [lowongans, setLowongans]   = useState<Lowongan[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterLowongan, setFilter] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState<Soal | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterLowongan) params.set("lowonganId", filterLowongan);
    if (filterTipe) params.set("tipe", filterTipe);
    api.get<Soal[]>(`/admin/bank-soal?${params}`)
      .then(setSoalList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get<Lowongan[]>("/lowongan/admin/semua").then(setLowongans).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [filterLowongan, filterTipe]);

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function openEdit(s: Soal) {
    setEditTarget(s);
    setForm({
      tipe: s.tipe,
      pertanyaan: s.pertanyaan,
      opsiA: s.opsi_a || "",
      opsiB: s.opsi_b || "",
      opsiC: s.opsi_c || "",
      opsiD: s.opsi_d || "",
      kunciJawaban: s.kunci_jawaban || "A",
      bobot: s.bobot,
      lowonganId: s.lowongan_id ? String(s.lowongan_id) : "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        tipe: form.tipe,
        pertanyaan: form.pertanyaan,
        opsiA: form.opsiA, opsiB: form.opsiB, opsiC: form.opsiC, opsiD: form.opsiD,
        kunciJawaban: form.tipe === "pilihan_ganda" ? form.kunciJawaban : undefined,
        bobot: Number(form.bobot),
        lowonganId: form.lowonganId ? Number(form.lowonganId) : undefined,
      };
      if (editTarget) {
        await api.put(`/admin/bank-soal/${editTarget.id}`, body);
        showToast("Soal berhasil diperbarui");
      } else {
        await api.post<{ message: string }>("/admin/bank-soal", body);
        showToast("Soal berhasil ditambahkan");
      }
      setShowForm(false);
      load();
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal menyimpan soal", false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/admin/bank-soal/${id}`);
      setDeleteConfirm(null);
      showToast("Soal dihapus");
      load();
    } catch {
      showToast("Gagal menghapus soal", false);
    }
  }

  const pgCount   = soalList.filter(s => s.tipe === "pilihan_ganda").length;
  const esaiCount = soalList.filter(s => s.tipe === "esai").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 px-5 py-3 rounded-2xl text-sm text-white shadow-xl"
          style={{ background: toast.ok ? "#10B981" : "#EF4444" }}>
          {toast.ok ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Bank Soal</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola soal pilihan ganda dan esai untuk tes tertulis</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
        >
          <Plus size={16} /> Tambah Soal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Soal", count: soalList.length, bg: "#EFF6FF", text: "#2563EB" },
          { label: "Pilihan Ganda", count: pgCount, bg: "#F5F3FF", text: "#7C3AED" },
          { label: "Esai", count: esaiCount, bg: "#ECFDF5", text: "#065F46" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg, border: `1px solid ${s.text}20` }}>
            <p className="text-2xl font-bold" style={{ color: s.text }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: s.text }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
          value={filterLowongan}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">Semua Lowongan</option>
          <option value="umum">Umum (lintas lowongan)</option>
          {lowongans.map(l => <option key={l.id} value={l.id}>{l.posisi}</option>)}
        </select>
        <select
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
          value={filterTipe}
          onChange={e => setFilterTipe(e.target.value)}
        >
          <option value="">Semua Tipe</option>
          <option value="pilihan_ganda">Pilihan Ganda</option>
          <option value="esai">Esai</option>
        </select>
      </div>

      {/* Soal list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : soalList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada soal. Klik "Tambah Soal" untuk mulai.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {soalList.map((s, idx) => (
              <div key={s.id} className="p-4 hover:bg-blue-50/20 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-slate-400 mt-0.5 w-6 flex-shrink-0">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={s.tipe === "pilihan_ganda"
                          ? { background: "#F5F3FF", color: "#7C3AED" }
                          : { background: "#ECFDF5", color: "#065F46" }}>
                        {s.tipe === "pilihan_ganda" ? "Pilihan Ganda" : "Esai"}
                      </span>
                      <span className="text-xs text-slate-400">Bobot: {s.bobot}</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{s.pertanyaan}</p>
                    {s.tipe === "pilihan_ganda" && (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {(["A", "B", "C", "D"] as const).map(opt => {
                          const val = s[`opsi_${opt.toLowerCase()}` as "opsi_a" | "opsi_b" | "opsi_c" | "opsi_d"];
                          const isKunci = s.kunci_jawaban === opt;
                          return (
                            <div key={opt} className="flex items-center gap-1.5 text-xs"
                              style={{ color: isKunci ? "#059669" : "#64748B" }}>
                              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isKunci ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{opt}</span>
                              <span className="truncate">{val || "-"}</span>
                              {isKunci && <Check size={10} className="text-green-600 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(s)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteConfirm(s.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h2 className="font-semibold text-slate-800">Hapus Soal?</h2>
            <p className="text-sm text-slate-500">Soal ini akan dihapus permanen dan tidak bisa dipulihkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: "#EF4444" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-xl rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editTarget ? "Edit Soal" : "Tambah Soal Baru"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} className="text-slate-400" /></button>
            </div>

            {/* Tipe */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tipe Soal</label>
              <div className="flex gap-3">
                {(["pilihan_ganda", "esai"] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, tipe: t }))}
                    className="flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all"
                    style={{
                      borderColor: form.tipe === t ? "#2563EB" : "#E2E8F0",
                      background: form.tipe === t ? "#EFF6FF" : "white",
                      color: form.tipe === t ? "#2563EB" : "#64748B",
                    }}>
                    {t === "pilihan_ganda" ? "Pilihan Ganda" : "Esai"}
                  </button>
                ))}
              </div>
            </div>

            {/* Pertanyaan */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Pertanyaan *</label>
              <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Tulis pertanyaan di sini..."
                value={form.pertanyaan} onChange={e => setForm(f => ({ ...f, pertanyaan: e.target.value }))} />
            </div>

            {/* Opsi (hanya PG) */}
            {form.tipe === "pilihan_ganda" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 block">Pilihan Jawaban *</label>
                {(["A", "B", "C", "D"] as const).map(opt => {
                  const key = `opsi${opt}` as "opsiA" | "opsiB" | "opsiC" | "opsiD";
                  const isKunci = form.kunciJawaban === opt;
                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <button onClick={() => setForm(f => ({ ...f, kunciJawaban: opt }))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all"
                        style={{
                          borderColor: isKunci ? "#059669" : "#E2E8F0",
                          background: isKunci ? "#D1FAE5" : "white",
                          color: isKunci ? "#059669" : "#94A3B8",
                        }}
                        title={`Set ${opt} sebagai kunci`}
                      >{opt}</button>
                      <input type="text" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                        placeholder={`Opsi ${opt}...`}
                        value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  );
                })}
                <p className="text-xs text-slate-400">Klik huruf opsi untuk menjadikannya kunci jawaban</p>
              </div>
            )}

            {/* Bobot & Lowongan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Bobot</label>
                <input type="number" min={1} max={10} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={form.bobot} onChange={e => setForm(f => ({ ...f, bobot: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Lowongan (opsional)</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={form.lowonganId} onChange={e => setForm(f => ({ ...f, lowonganId: e.target.value }))}>
                  <option value="">Umum</option>
                  {lowongans.map(l => <option key={l.id} value={l.id}>{l.posisi}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.pertanyaan}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                {saving ? "Menyimpan..." : editTarget ? "Simpan" : "Simpan Soal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
