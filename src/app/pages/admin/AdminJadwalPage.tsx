import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Calendar, MapPin, Link2, Users, UserPlus, XCircle } from "lucide-react";
import { api } from "../../../lib/api";

interface Jadwal {
  id: number;
  jenis: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string | null;
  link_online: string | null;
  keterangan: string | null;
  tahap_id: number;
  nama_tahap: string;
  posisi_lowongan: string;
  lowongan_id: number;
  jumlah_peserta: number;
}

interface Lowongan { id: number; posisi: string; }
interface TahapSeleksi { id: number; nama: string; }
interface Peserta { id: number; lamaran_id: number; nama_lengkap: string | null; email: string; status_hadir: string; }
interface PelamarOption { id: number; nama_lengkap: string | null; email: string; }

const JENIS_OPTS = [
  { value: "tes_tertulis",    label: "Tes Tertulis" },
  { value: "micro_teaching",  label: "Micro Teaching" },
  { value: "wawancara",       label: "Wawancara" },
  { value: "tes_praktik",     label: "Tes Praktik" },
];

const emptyForm = {
  tahapId: "", lowonganId: "", jenis: "wawancara", tanggal: "",
  waktuMulai: "", waktuSelesai: "", lokasi: "", linkOnline: "", keterangan: "",
};

function fmtTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(t: string) { return t ? t.slice(0, 5) : ""; }

export function AdminJadwalPage() {
  const [list, setList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [lowonganList, setLowonganList] = useState<Lowongan[]>([]);
  const [tahapList, setTahapList] = useState<TahapSeleksi[]>([]);

  // state peserta modal
  const [pesertaJadwal, setPesertaJadwal] = useState<Jadwal | null>(null);
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [pelamarOptions, setPelamarOptions] = useState<PelamarOption[]>([]);
  const [selectedLamaranId, setSelectedLamaranId] = useState("");
  const [addingPeserta, setAddingPeserta] = useState(false);

  const load = () => {
    setLoading(true);
    api.get<Jadwal[]>("/admin/jadwal")
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get<Lowongan[]>("/lowongan/admin/semua").then(setLowonganList).catch(() => {});
    api.get<TahapSeleksi[]>("/tahap").then(setTahapList).catch(() => {});
  }, []);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(j: Jadwal) {
    setForm({
      tahapId: String(j.tahap_id),
      lowonganId: String(j.lowongan_id),
      jenis: j.jenis,
      tanggal: j.tanggal.slice(0, 10),
      waktuMulai: fmtTime(j.waktu_mulai),
      waktuSelesai: fmtTime(j.waktu_selesai),
      lokasi: j.lokasi || "",
      linkOnline: j.link_online || "",
      keterangan: j.keterangan || "",
    });
    setEditId(j.id);
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.lowonganId || !form.jenis || !form.tanggal || !form.waktuMulai || !form.waktuSelesai) {
      setError("Lowongan, jenis, tanggal, dan waktu wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      tahapId: form.tahapId || 1,
      lowonganId: Number(form.lowonganId),
      jenis: form.jenis,
      tanggal: form.tanggal,
      waktuMulai: form.waktuMulai,
      waktuSelesai: form.waktuSelesai,
      lokasi: form.lokasi || null,
      linkOnline: form.linkOnline || null,
      keterangan: form.keterangan || null,
    };
    try {
      if (editId) {
        await api.put(`/admin/jadwal/${editId}`, payload);
      } else {
        await api.post("/admin/jadwal", payload);
      }
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  function openPeserta(j: Jadwal) {
    setPesertaJadwal(j);
    setSelectedLamaranId("");
    // Load peserta yang sudah terdaftar
    api.get<Peserta[]>(`/admin/jadwal/${j.id}/peserta`).then(setPesertaList).catch(() => {});
    // Load pelamar dari lowongan terkait sebagai pilihan
    api.get<PelamarOption[]>(`/pelamar/admin?lowonganId=${j.lowongan_id}`)
      .then(setPelamarOptions).catch(() => {});
  }

  async function handleTambahPeserta() {
    if (!pesertaJadwal || !selectedLamaranId) return;
    setAddingPeserta(true);
    try {
      await api.post(`/admin/jadwal/${pesertaJadwal.id}/tambah-peserta`, { lamaranId: Number(selectedLamaranId) });
      setSelectedLamaranId("");
      api.get<Peserta[]>(`/admin/jadwal/${pesertaJadwal.id}/peserta`).then(setPesertaList).catch(() => {});
      load();
    } catch { alert("Gagal menambah peserta"); }
    finally { setAddingPeserta(false); }
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/admin/jadwal/${id}`);
      setDeleteId(null);
      load();
    } catch { alert("Gagal menghapus jadwal"); }
  }

  const JENIS_LABEL: Record<string, string> = Object.fromEntries(JENIS_OPTS.map(o => [o.value, o.label]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Jadwal Interview</h1>
          <p className="text-sm text-slate-500 mt-1">Atur jadwal tes dan wawancara seleksi</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
        >
          <Plus size={16} /> Buat Jadwal
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Memuat...</div>
      ) : list.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada jadwal. Buat jadwal pertama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((j) => (
            <div key={j.id} className="rounded-2xl p-5 flex items-start gap-4"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 8px rgba(59,130,246,0.06)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
                <Calendar size={20} color="#3B82F6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800">{JENIS_LABEL[j.jenis] || j.jenis}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                    {j.nama_tahap}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{j.posisi_lowongan}</p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={11} /> {fmtTgl(j.tanggal)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {fmtTime(j.waktu_mulai)} – {fmtTime(j.waktu_selesai)} WIB
                  </span>
                  {j.lokasi && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={11} /> {j.lokasi}
                    </span>
                  )}
                  {j.link_online && (
                    <a href={j.link_online} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                      <Link2 size={11} /> Link Online
                    </a>
                  )}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users size={11} /> {j.jumlah_peserta} peserta
                  </span>
                </div>
                {j.keterangan && <p className="text-xs text-slate-400 mt-1">{j.keterangan}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openPeserta(j)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors border border-slate-200"
                >
                  <Users size={13} /> Peserta ({j.jumlah_peserta})
                </button>
                <button onClick={() => openEdit(j)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteId(j.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editId ? "Edit Jadwal" : "Buat Jadwal Baru"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Lowongan *</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  value={form.lowonganId} onChange={(e) => setForm({ ...form, lowonganId: e.target.value })}>
                  <option value="">Pilih lowongan...</option>
                  {lowonganList.map((l) => <option key={l.id} value={l.id}>{l.posisi}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis *</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                    value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
                    {JENIS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Tahap</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                    value={form.tahapId} onChange={(e) => setForm({ ...form, tahapId: e.target.value })}>
                    <option value="">Pilih tahap...</option>
                    {tahapList.map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal *</label>
                <input type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Waktu Mulai *</label>
                  <input type="time" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                    value={form.waktuMulai} onChange={(e) => setForm({ ...form, waktuMulai: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Waktu Selesai *</label>
                  <input type="time" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                    value={form.waktuSelesai} onChange={(e) => setForm({ ...form, waktuSelesai: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Lokasi</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="e.g. Ruang Meeting Lt.2" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Link Online (Google Meet/Zoom)</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="https://meet.google.com/..." value={form.linkOnline} onChange={(e) => setForm({ ...form, linkOnline: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Keterangan</label>
                <textarea rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  placeholder="Informasi tambahan..." value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                {saving ? "Menyimpan..." : editId ? "Simpan" : "Buat Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Peserta */}
      {pesertaJadwal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[85vh] flex flex-col" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Peserta Jadwal</h2>
                <p className="text-xs text-slate-500 mt-0.5">{JENIS_LABEL[pesertaJadwal.jenis]} — {pesertaJadwal.posisi_lowongan}</p>
              </div>
              <button onClick={() => setPesertaJadwal(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Tambah peserta */}
            <div className="flex gap-2 flex-shrink-0">
              <select
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                value={selectedLamaranId}
                onChange={(e) => setSelectedLamaranId(e.target.value)}
              >
                <option value="">Pilih pelamar untuk ditambahkan...</option>
                {pelamarOptions
                  .filter(p => !pesertaList.some(ps => ps.lamaran_id === p.id))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap || p.email}
                    </option>
                  ))
                }
              </select>
              <button
                onClick={handleTambahPeserta}
                disabled={!selectedLamaranId || addingPeserta}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
              >
                <UserPlus size={14} /> {addingPeserta ? "..." : "Tambah"}
              </button>
            </div>

            {/* Daftar peserta */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {pesertaList.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Belum ada peserta terdaftar</p>
                  <p className="text-xs mt-1">Tambahkan pelamar dari dropdown di atas</p>
                </div>
              ) : (
                pesertaList.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F8FAFC" }}>
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold flex-shrink-0">
                      {(p.nama_lengkap || p.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{p.nama_lengkap || p.email}</p>
                      <p className="text-xs text-slate-400 truncate">{p.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "#EFF6FF", color: "#2563EB" }}>
                      {p.status_hadir === "terdaftar" ? "Terdaftar" : p.status_hadir}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex-shrink-0 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">{pesertaList.length} peserta terdaftar</p>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4 text-center" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <Trash2 size={22} color="#EF4444" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Hapus Jadwal?</h3>
              <p className="text-sm text-slate-500 mt-1">Data peserta yang terdaftar di jadwal ini juga akan terhapus.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
