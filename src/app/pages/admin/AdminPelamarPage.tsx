import { useEffect, useState } from "react";
import {
  Users, Search, Filter, ChevronDown, CheckCircle, XCircle, Clock,
  FileText, Phone, Mail, Briefcase, X
} from "lucide-react";
import { api } from "../../../lib/api";

interface Pelamar {
  id: number;
  status: string;
  tanggal_daftar: string;
  catatan_hrd: string | null;
  user_id: number;
  email: string;
  nama_lengkap: string | null;
  no_telepon: string | null;
  lowongan_id: number;
  posisi: string;
  jumlah_berkas_inti: number;
  jumlah_berkas_khusus: number;
}

interface Lowongan { id: number; posisi: string; }

const STATUS_FLOW = [
  { key: "pending",        label: "Pending",         bg: "#F1F5F9", text: "#64748B" },
  { key: "administrasi",   label: "Administrasi",    bg: "#EFF6FF", text: "#2563EB" },
  { key: "tes_tulis",      label: "Tes Tulis",       bg: "#F5F3FF", text: "#7C3AED" },
  { key: "micro_teaching", label: "Micro Teaching",  bg: "#FFF7ED", text: "#C2410C" },
  { key: "wawancara",      label: "Wawancara",       bg: "#FFFBEB", text: "#B45309" },
  { key: "final",          label: "Final Review",    bg: "#ECFEFF", text: "#0E7490" },
  { key: "diterima",       label: "Diterima",        bg: "#ECFDF5", text: "#065F46" },
  { key: "ditolak",        label: "Ditolak",         bg: "#FEF2F2", text: "#991B1B" },
];

const STATUS_MAP = Object.fromEntries(STATUS_FLOW.map(s => [s.key, s]));

function formatTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminPelamarPage() {
  const [list, setList] = useState<Pelamar[]>([]);
  const [lowongans, setLowongans] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLowongan, setFilterLowongan] = useState("");
  const [search, setSearch] = useState("");
  const [detailTarget, setDetailTarget] = useState<Pelamar | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [catatanHrd, setCatatanHrd] = useState("");
  const [saving, setSaving] = useState(false);

  // State untuk penilaian
  const [evalTarget, setEvalTarget] = useState<Pelamar | null>(null);
  const [evalData, setEvalData] = useState({
    nilai_kompetensi: 0,
    nilai_komunikasi: 0,
    nilai_kepribadian: 0,
    nilai_motivasi: 0,
    rekomendasi: "direkomendasikan",
    catatan: "",
  });
  const [evalSaving, setEvalSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterLowongan) params.set("lowonganId", filterLowongan);
    if (search) params.set("search", search);
    api.get<Pelamar[]>(`/pelamar/admin?${params}`)
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get<Lowongan[]>("/lowongan/admin/semua").then(setLowongans).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterStatus, filterLowongan]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  function openDetail(p: Pelamar) {
    setDetailTarget(p);
    setNewStatus(p.status);
    setCatatanHrd(p.catatan_hrd || "");
  }

  async function handleSaveStatus() {
    if (!detailTarget) return;
    setSaving(true);
    try {
      await api.patch(`/pelamar/admin/${detailTarget.id}/status`, { status: newStatus, catatan_hrd: catatanHrd });
      setDetailTarget(null);
      load();
    } catch {
      alert("Gagal mengupdate status");
    } finally {
      setSaving(false);
    }
  }

  async function openEvaluation(p: Pelamar) {
    setEvalTarget(p);
    try {
      const res = await api.get<any>(`/penilaian/${p.id}`);
      if (res) {
        setEvalData({
          nilai_kompetensi: res.nilai_kompetensi || 0,
          nilai_komunikasi: res.nilai_komunikasi || 0,
          nilai_kepribadian: res.nilai_kepribadian || 0,
          nilai_motivasi: res.nilai_motivasi || 0,
          rekomendasi: res.rekomendasi || "direkomendasikan",
          catatan: res.catatan || "",
        });
      } else {
        setEvalData({ nilai_kompetensi: 0, nilai_komunikasi: 0, nilai_kepribadian: 0, nilai_motivasi: 0, rekomendasi: "direkomendasikan", catatan: "" });
      }
    } catch (e) {
      console.error(e);
      setEvalData({ nilai_kompetensi: 0, nilai_komunikasi: 0, nilai_kepribadian: 0, nilai_motivasi: 0, rekomendasi: "direkomendasikan", catatan: "" });
    }
  }

  async function handleSaveEvaluation() {
    if (!evalTarget) return;
    setEvalSaving(true);
    try {
      await api.post(`/penilaian/${evalTarget.id}`, evalData);
      setEvalTarget(null);
      alert("Penilaian berhasil disimpan!");
    } catch (e) {
      alert("Gagal menyimpan penilaian");
    } finally {
      setEvalSaving(false);
    }
  }

  const stats = STATUS_FLOW.slice(0, 6).map(s => ({
    ...s,
    count: list.filter(p => p.status === s.key).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Data Pelamar</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan pantau status seleksi semua pelamar</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <Users size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-slate-800">{list.length}</span>
          <span className="text-xs text-slate-400">pelamar</span>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(filterStatus === s.key ? "" : s.key)}
            className="rounded-2xl p-3 text-left transition-all hover:scale-[1.02]"
            style={{
              background: filterStatus === s.key ? s.bg : "rgba(255,255,255,0.85)",
              border: filterStatus === s.key ? `1.5px solid ${s.text}30` : "1px solid rgba(147,197,253,0.2)",
              boxShadow: "0 2px 8px rgba(59,130,246,0.05)",
            }}
          >
            <p className="text-xl font-semibold" style={{ color: filterStatus === s.key ? s.text : "#1E293B" }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: filterStatus === s.key ? s.text : "#94A3B8" }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl text-white text-sm" style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>Cari</button>
        </form>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            {STATUS_FLOW.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            value={filterLowongan}
            onChange={(e) => setFilterLowongan(e.target.value)}
          >
            <option value="">Semua Posisi</option>
            {lowongans.map(l => <option key={l.id} value={l.id}>{l.posisi}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada pelamar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.2)" }}>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Pelamar</th>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Posisi</th>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Berkas</th>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Tanggal Daftar</th>
                <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Status</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const st = STATUS_MAP[p.status] || STATUS_MAP["pending"];
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-700">{p.nama_lengkap || p.email}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail size={10} /> {p.email}
                      </p>
                      {p.no_telepon && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone size={10} /> {p.no_telepon}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Briefcase size={12} className="text-slate-400" />
                        <span className="text-xs">{p.posisi}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <FileText size={12} className="text-slate-400" />
                        {p.jumlah_berkas_inti + p.jumlah_berkas_khusus} file
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{formatTgl(p.tanggal_daftar)}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.text }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetail(p)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <ChevronDown size={12} /> Detail
                        </button>
                        <button
                          onClick={() => openEvaluation(p)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-green-600 hover:bg-green-50 transition-colors border border-green-200 bg-white"
                        >
                          <CheckCircle size={12} /> Penilai
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Detail / Update Status Modal */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Detail Pelamar</h2>
              <button onClick={() => setDetailTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Info pelamar */}
            <div className="p-4 rounded-2xl space-y-2" style={{ background: "#F8FAFC" }}>
              <p className="font-semibold text-slate-800">{detailTarget.nama_lengkap || detailTarget.email}</p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Mail size={11} /> {detailTarget.email}</span>
                {detailTarget.no_telepon && <span className="flex items-center gap-1"><Phone size={11} /> {detailTarget.no_telepon}</span>}
                <span className="flex items-center gap-1"><Briefcase size={11} /> {detailTarget.posisi}</span>
                <span className="flex items-center gap-1"><FileText size={11} /> {detailTarget.jumlah_berkas_inti + detailTarget.jumlah_berkas_khusus} berkas</span>
              </div>
              <p className="text-xs text-slate-400">Daftar: {formatTgl(detailTarget.tanggal_daftar)}</p>
            </div>

            {/* Update status */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Tahap Seleksi</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_FLOW.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setNewStatus(s.key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all text-left"
                    style={{
                      borderColor: newStatus === s.key ? s.text : "#E2E8F0",
                      background: newStatus === s.key ? s.bg : "white",
                      color: newStatus === s.key ? s.text : "#64748B",
                    }}
                  >
                    {newStatus === s.key
                      ? (s.key === "diterima" ? <CheckCircle size={12} /> : s.key === "ditolak" ? <XCircle size={12} /> : <Clock size={12} />)
                      : <div className="w-3 h-3 rounded-full border-2 border-current flex-shrink-0" />
                    }
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan HRD (opsional)</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Tambahkan catatan untuk pelamar..."
                value={catatanHrd}
                onChange={(e) => setCatatanHrd(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setDetailTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button
                onClick={handleSaveStatus}
                disabled={saving || newStatus === detailTarget.status && catatanHrd === (detailTarget.catatan_hrd || "")}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
              >
                {saving ? "Menyimpan..." : "Simpan Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Penilaian Modal */}
      {evalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Penilaian Kandidat</h2>
              <button onClick={() => setEvalTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="p-4 rounded-2xl space-y-2" style={{ background: "#F8FAFC" }}>
              <p className="font-semibold text-slate-800">{evalTarget.nama_lengkap || evalTarget.email}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Briefcase size={11} /> {evalTarget.posisi}</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Nilai Kompetensi (0-100)</label>
                  <input type="number" min="0" max="100" 
                    value={evalData.nilai_kompetensi}
                    onChange={(e) => setEvalData({...evalData, nilai_kompetensi: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Nilai Komunikasi (0-100)</label>
                  <input type="number" min="0" max="100" 
                    value={evalData.nilai_komunikasi}
                    onChange={(e) => setEvalData({...evalData, nilai_komunikasi: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Nilai Kepribadian (0-100)</label>
                  <input type="number" min="0" max="100" 
                    value={evalData.nilai_kepribadian}
                    onChange={(e) => setEvalData({...evalData, nilai_kepribadian: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Nilai Motivasi (0-100)</label>
                  <input type="number" min="0" max="100" 
                    value={evalData.nilai_motivasi}
                    onChange={(e) => setEvalData({...evalData, nilai_motivasi: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Rekomendasi</label>
                <select 
                  value={evalData.rekomendasi}
                  onChange={(e) => setEvalData({...evalData, rekomendasi: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400">
                  <option value="sangat_direkomendasikan">Sangat Direkomendasikan</option>
                  <option value="direkomendasikan">Direkomendasikan</option>
                  <option value="tidak_direkomendasikan">Tidak Direkomendasikan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan Penilaian</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  placeholder="Tambahkan catatan hasil penilaian..."
                  value={evalData.catatan}
                  onChange={(e) => setEvalData({...evalData, catatan: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEvalTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button
                onClick={handleSaveEvaluation}
                disabled={evalSaving}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#16A34A,#22C55E)" }}
              >
                {evalSaving ? "Menyimpan..." : "Simpan Penilaian"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
