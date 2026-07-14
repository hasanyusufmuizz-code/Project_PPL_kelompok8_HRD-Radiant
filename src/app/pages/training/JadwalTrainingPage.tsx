import { useEffect, useState } from "react";
import { CalendarClock, Plus, Pencil, MapPin, Users, X } from "lucide-react";
import { api } from "../../../lib/api";

interface Jadwal {
  id: number;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string | null;
  lokasi: string | null;
  pemateri_nama: string;
  materi_id: number | null;
  materi_judul: string | null;
  jumlah_peserta: number;
}

interface Materi { id: number; judul: string; }
interface Instruktur { user_id: number; email: string; nama_lengkap: string | null; }

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function JadwalTrainingPage() {
  const [list, setList] = useState<Jadwal[]>([]);
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [instrukturList, setInstrukturList] = useState<Instruktur[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Jadwal | null>(null);

  const [tanggal, setTanggal] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [pemateriNama, setPemateriNama] = useState("");
  const [materiId, setMateriId] = useState("");
  const [pesertaIds, setPesertaIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    api.get<Jadwal[]>("/jadwal-training")
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get<Materi[]>("/materi-training").then(setMateriList).catch(() => {});
    api.get<Instruktur[]>("/kepegawaian/instruktur").then(setInstrukturList).catch(() => {});
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function openAdd() {
    setEditTarget(null);
    setTanggal("");
    setWaktuMulai("");
    setWaktuSelesai("");
    setLokasi("");
    setPemateriNama("");
    setMateriId("");
    setPesertaIds([]);
    setError("");
    setModalOpen(true);
  }

  function openEdit(j: Jadwal) {
    setEditTarget(j);
    setTanggal(new Date(j.tanggal).toISOString().slice(0, 10));
    setWaktuMulai(j.waktu_mulai.slice(0, 5));
    setWaktuSelesai(j.waktu_selesai ? j.waktu_selesai.slice(0, 5) : "");
    setLokasi(j.lokasi || "");
    setPemateriNama(j.pemateri_nama);
    setMateriId(j.materi_id ? String(j.materi_id) : "");
    setPesertaIds([]);
    setError("");
    setModalOpen(true);
  }

  function togglePeserta(id: number) {
    setPesertaIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!tanggal || !waktuMulai || !pemateriNama.trim()) {
      setError("Tanggal, waktu, dan pemateri wajib diisi");
      return;
    }
    if (tanggal < todayStr()) {
      setError("Tanggal tidak boleh di masa lalu");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = {
        tanggal,
        waktuMulai,
        waktuSelesai: waktuSelesai || null,
        lokasi: lokasi || null,
        pemateriNama: pemateriNama.trim(),
        materiId: materiId || null,
        pesertaUserIds: pesertaIds,
      };
      if (editTarget) {
        await api.put(`/jadwal-training/${editTarget.id}`, body);
        showToast("Jadwal training berhasil diperbarui");
      } else {
        await api.post("/jadwal-training", body);
        showToast("Jadwal training berhasil dibuat");
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan jadwal");
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-semibold text-slate-800">Jadwal Training</h1>
          <p className="text-sm text-slate-500 mt-1">Atur jadwal dan lokasi sesi training pengajar baru</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
        >
          <Plus size={15} /> Buat Jadwal
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CalendarClock size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada jadwal training</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Tanggal & Waktu</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Lokasi</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Pemateri</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Peserta</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((j) => (
                  <tr key={j.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-700">{formatTgl(j.tanggal)}</p>
                      <p className="text-xs text-slate-400">{j.waktu_mulai.slice(0, 5)}{j.waktu_selesai ? ` - ${j.waktu_selesai.slice(0, 5)}` : ""} WIB</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-slate-600 text-xs">
                        <MapPin size={12} className="text-slate-400" /> {j.lokasi || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{j.pemateri_nama}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users size={12} className="text-slate-400" /> {j.jumlah_peserta}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openEdit(j)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <Pencil size={14} className="text-blue-500" />
                      </button>
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
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editTarget ? "Edit Jadwal Training" : "Buat Jadwal Training"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal</label>
                <input
                  type="date"
                  min={todayStr()}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
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
                <label className="text-xs font-medium text-slate-600 mb-1 block">Waktu Mulai</label>
                <input
                  type="time"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={waktuMulai}
                  onChange={(e) => setWaktuMulai(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Waktu Selesai</label>
                <input
                  type="time"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                  value={waktuSelesai}
                  onChange={(e) => setWaktuSelesai(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Lokasi</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Ruang training / link online"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Materi (opsional)</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                value={materiId}
                onChange={(e) => setMateriId(e.target.value)}
              >
                <option value="">— Tanpa materi —</option>
                {materiList.map((m) => <option key={m.id} value={m.id}>{m.judul}</option>)}
              </select>
            </div>

            {!editTarget && (
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">Peserta</label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-50">
                  {instrukturList.length === 0 ? (
                    <p className="p-3 text-xs text-slate-400">Belum ada pengajar yang diterima</p>
                  ) : (
                    instrukturList.map((i) => (
                      <label key={i.user_id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-blue-50/50">
                        <input
                          type="checkbox"
                          checked={pesertaIds.includes(i.user_id)}
                          onChange={() => togglePeserta(i.user_id)}
                        />
                        {i.nama_lengkap || i.email}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

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
                {saving ? "Menyimpan..." : "Simpan Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
