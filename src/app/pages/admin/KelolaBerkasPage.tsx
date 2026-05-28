import { useEffect, useState } from "react";
import { FileStack, CheckCircle, XCircle, Clock, Search, Eye, Filter } from "lucide-react";
import { api } from "../../../lib/api";

interface Berkas {
  id: number;
  jenis_dokumen: string;
  nama_file: string;
  file_url: string;
  ukuran_file: number;
  status_verifikasi: "belum_diproses" | "terverifikasi" | "ditolak";
  catatan_verifikasi: string | null;
  created_at: string;
  nama_lengkap: string;
  email: string;
  posisi_lowongan: string;
  lamaran_id: number;
}

const JENIS_LABEL: Record<string, string> = {
  cv: "Curriculum Vitae",
  transkrip_nilai: "Transkrip Nilai",
  surat_lamaran: "Surat Lamaran",
  ijazah: "Ijazah / SKL",
  foto: "Foto Formal",
  ktp: "KTP",
  sertifikat: "Sertifikat",
  lainnya: "Lainnya",
};

const STATUS_UI = {
  belum_diproses: { label: "Belum Diproses", bg: "#FFF7ED", text: "#92400E", icon: Clock },
  terverifikasi:  { label: "Terverifikasi",   bg: "#ECFDF5", text: "#065F46", icon: CheckCircle },
  ditolak:        { label: "Ditolak",          bg: "#FEF2F2", text: "#991B1B", icon: XCircle },
};

function fmtSize(bytes: number) {
  if (!bytes) return "-";
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function KelolaBerkasPage() {
  const [list, setList] = useState<Berkas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [verifyTarget, setVerifyTarget] = useState<Berkas | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"terverifikasi" | "ditolak">("terverifikasi");
  const [verifyNote, setVerifyNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterJenis) params.set("jenis", filterJenis);
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);
    api.get<Berkas[]>(`/berkas/admin?${params.toString()}`)
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterJenis, filterStatus]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  async function doVerify() {
    if (!verifyTarget) return;
    setSaving(true);
    try {
      await api.patch(`/berkas/admin/${verifyTarget.id}/verifikasi`, { status: verifyStatus, catatan: verifyNote });
      setVerifyTarget(null);
      setVerifyNote("");
      load();
    } catch {
      alert("Gagal memverifikasi");
    } finally {
      setSaving(false);
    }
  }

  const grouped = list.reduce((acc, b) => {
    const k = b.jenis_dokumen;
    if (!acc[k]) acc[k] = [];
    acc[k].push(b);
    return acc;
  }, {} as Record<string, Berkas[]>);

  const jenisList = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Kelola Berkas Pelamar</h1>
        <p className="text-sm text-slate-500 mt-1">Verifikasi dokumen yang diunggah pelamar</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Cari nama/email pelamar..."
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
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            {Object.entries(JENIS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="belum_diproses">Belum Diproses</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        {Object.values(STATUS_UI).map(({ label, bg, text }) => {
          const count = list.filter((b) => b.status_verifikasi === Object.keys(STATUS_UI).find((k) => STATUS_UI[k as keyof typeof STATUS_UI].label === label)).length;
          return (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: bg, color: text }}>
              {label}: {count}
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Memuat...</div>
      ) : list.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <FileStack size={40} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada berkas yang diunggah</p>
        </div>
      ) : (
        /* Grouped by jenis dokumen */
        jenisList.map((jenis) => (
          <div key={jenis} className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
            <div className="px-5 py-3.5 flex items-center gap-2" style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(147,197,253,0.15)" }}>
              <FileStack size={15} className="text-blue-500" />
              <h3 className="font-semibold text-slate-700 text-sm">{JENIS_LABEL[jenis] || jenis}</h3>
              <span className="ml-auto text-xs text-slate-400">{grouped[jenis].length} berkas</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(147,197,253,0.12)" }}>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Pelamar</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Posisi</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">File</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Ukuran</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {grouped[jenis].map((b) => {
                  const st = STATUS_UI[b.status_verifikasi];
                  const StIcon = st.icon;
                  return (
                    <tr key={b.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-700">{b.nama_lengkap || b.email}</p>
                        <p className="text-xs text-slate-400">{b.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{b.posisi_lowongan}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs max-w-[150px] truncate">{b.nama_file}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{fmtSize(b.ukuran_file)}</td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit" style={{ background: st.bg, color: st.text }}>
                          <StIcon size={11} /> {st.label}
                        </span>
                        {b.catatan_verifikasi && (
                          <p className="text-xs text-slate-400 mt-1 max-w-[150px] truncate">{b.catatan_verifikasi}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <a
                            href={`http://localhost:3001${b.file_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            onClick={() => { setVerifyTarget(b); setVerifyStatus("terverifikasi"); setVerifyNote(""); }}
                            className="p-2 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => { setVerifyTarget(b); setVerifyStatus("ditolak"); setVerifyNote(""); }}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* Verify Modal */}
      {verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
            <h2 className="text-lg font-semibold text-slate-800">Verifikasi Berkas</h2>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-sm font-medium text-slate-700">{verifyTarget.nama_lengkap}</p>
              <p className="text-xs text-slate-500 mt-0.5">{JENIS_LABEL[verifyTarget.jenis_dokumen]} — {verifyTarget.nama_file}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Status Verifikasi</label>
              <div className="flex gap-3">
                {(["terverifikasi", "ditolak"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setVerifyStatus(s)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                    style={{
                      borderColor: verifyStatus === s ? (s === "terverifikasi" ? "#10B981" : "#EF4444") : "#E2E8F0",
                      background: verifyStatus === s ? (s === "terverifikasi" ? "#ECFDF5" : "#FEF2F2") : "white",
                      color: verifyStatus === s ? (s === "terverifikasi" ? "#065F46" : "#991B1B") : "#64748B",
                    }}
                  >
                    {s === "terverifikasi" ? "Terima" : "Tolak"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan (opsional)</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                placeholder="Tambahkan catatan..."
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setVerifyTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
              <button
                onClick={doVerify}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60"
                style={{ background: verifyStatus === "terverifikasi" ? "linear-gradient(135deg,#10B981,#34D399)" : "linear-gradient(135deg,#EF4444,#F87171)" }}
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
