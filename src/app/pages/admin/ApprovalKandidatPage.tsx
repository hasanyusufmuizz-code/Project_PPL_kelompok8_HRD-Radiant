import { useEffect, useState } from "react";
import { BadgeCheck, Search, Users, X, CheckCircle, XCircle, FileText, ChevronDown } from "lucide-react";
import { api } from "../../../lib/api";

interface Kandidat {
  lamaran_id: number;
  status: string;
  tanggal_daftar: string;
  catatan_hrd: string | null;
  user_id: number;
  email: string;
  nama_lengkap: string | null;
  no_hp: string | null;
  pendidikan: string | null;
  instansi: string | null;
  avatar_url: string | null;
  lowongan_id: number;
  posisi: string;
  deadline: string;
  nilai_rata_rata: number | null;
  tahap_lulus: number;
  nilai_wawancara: number | null;
  rekomendasi_wawancara: string | null;
}

interface Stats {
  menungguKeputusan: number;
  diterimabulanIni: number;
  ditolakBulanIni: number;
  totalDiputuskan: number;
}

interface DetailKandidat {
  lamaran: any;
  tahapRiwayat: any[];
  penilaian: any[];
  dokumen: any[];
  keputusan: any | null;
}

export function ApprovalKandidatPage() {
  const [list, setList] = useState<Kandidat[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailModal, setDetailModal] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<DetailKandidat | null>(null);
  const [keputusan, setKeputusan] = useState<"diterima" | "ditolak" | null>(null);
  const [alasan, setAlasan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    Promise.all([
      api.get<Stats>("/approval/stats").catch(() => null),
      api.get<Kandidat[]>(`/approval/kandidat?${params}`).catch(() => []),
    ]).then(([statsRes, kandidatRes]) => {
      if (statsRes) setStats(statsRes);
      setList(kandidatRes as Kandidat[]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const loadDetail = async (id: number) => {
    setDetailModal(id);
    setDetailData(null);
    setKeputusan(null);
    setAlasan("");
    try {
      const res = await api.get<DetailKandidat>(`/approval/kandidat/${id}`);
      setDetailData(res);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat detail kandidat");
      setDetailModal(null);
    }
  };

  const handleSubmit = async () => {
    if (!detailModal || !keputusan) return;
    
    if (keputusan === "ditolak" && !alasan.trim()) {
      alert("Alasan penolakan wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/approval/kandidat/${detailModal}/keputusan`, {
        keputusan,
        alasan
      });
      alert(keputusan === "diterima" ? "Kandidat berhasil DITERIMA!" : "Kandidat telah DITOLAK");
      setDetailModal(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Terjadi kesalahan saat menyimpan keputusan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Approval Kandidat</h1>
        <p className="text-sm text-slate-500 mt-1">Keputusan final untuk kandidat yang telah melewati semua tahap seleksi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Menunggu Keputusan", val: stats?.menungguKeputusan ?? "-", icon: Users, color: "#3B82F6", bg: "#EFF6FF" },
          { label: "Diterima (Bulan Ini)", val: stats?.diterimabulanIni ?? "-", icon: CheckCircle, color: "#10B981", bg: "#ECFDF5" },
          { label: "Ditolak (Bulan Ini)", val: stats?.ditolakBulanIni ?? "-", icon: XCircle, color: "#EF4444", bg: "#FEF2F2" },
          { label: "Total Diputuskan", val: stats?.totalDiputuskan ?? "-", icon: BadgeCheck, color: "#8B5CF6", bg: "#F5F3FF" },
        ].map((c, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md bg-white border border-blue-100/50 shadow-sm">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
              <c.icon size={20} color={c.color} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800">{c.val}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-blue-100/50 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50"
            placeholder="Cari nama, email, atau posisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List Kandidat */}
      <div className="bg-white rounded-2xl border border-blue-100/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Memuat data kandidat...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <BadgeCheck size={48} className="text-slate-300 mb-4" />
            <p className="font-medium">Tidak ada kandidat menunggu approval</p>
            <p className="text-sm text-slate-400">Semua kandidat sudah diputuskan atau belum ada yang mencapai tahap final.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-4 text-slate-500 font-medium">Kandidat</th>
                  <th className="text-left px-5 py-4 text-slate-500 font-medium">Posisi</th>
                  <th className="text-left px-5 py-4 text-slate-500 font-medium">Nilai Wawancara</th>
                  <th className="text-left px-5 py-4 text-slate-500 font-medium">Rekomendasi</th>
                  <th className="text-right px-5 py-4 text-slate-500 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((k) => (
                  <tr key={k.lamaran_id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                          {k.avatar_url ? (
                            <img src={k.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            (k.nama_lengkap || k.email).charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{k.nama_lengkap || "Tanpa Nama"}</p>
                          <p className="text-xs text-slate-500">{k.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">{k.posisi}</p>
                      <p className="text-xs text-slate-400">{k.pendidikan || "-"} • {k.instansi || "-"}</p>
                    </td>
                    <td className="px-5 py-4">
                      {k.nilai_wawancara ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{Number(k.nilai_wawancara).toFixed(1)}</span>
                          <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum dinilai</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {k.rekomendasi_wawancara === 'sangat_direkomendasikan' ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Sangat Direkomendasikan</span>
                      ) : k.rekomendasi_wawancara === 'direkomendasikan' ? (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Direkomendasikan</span>
                      ) : k.rekomendasi_wawancara === 'tidak_direkomendasikan' ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Tidak Direkomendasikan</span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => loadDetail(k.lamaran_id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Review & Putuskan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail & Keputusan */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <BadgeCheck className="text-blue-500" /> Review Final Kandidat
              </h2>
              <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!detailData ? (
                <div className="flex justify-center items-center h-40 text-slate-400">Memuat detail...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Kiri: Info & Riwayat */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Profil Singkat */}
                    <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex-shrink-0 overflow-hidden">
                        {detailData.lamaran?.avatar_url ? (
                          <img src={detailData.lamaran.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-blue-500">
                            {(detailData.lamaran?.nama_lengkap || detailData.lamaran?.email)?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{detailData.lamaran?.nama_lengkap}</h3>
                        <p className="text-slate-500 text-sm">{detailData.lamaran?.email} • {detailData.lamaran?.no_hp}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                            Posisi: {detailData.lamaran?.posisi}
                          </span>
                          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                            Pendidikan: {detailData.lamaran?.pendidikan}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Riwayat Tahap */}
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" /> Riwayat Seleksi
                      </h4>
                      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {detailData.tahapRiwayat.map((t, idx) => (
                          <div key={t.tahap_id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                              {t.status_tahap === 'lulus' ? <CheckCircle size={16} className="text-green-500" /> : <span className="text-xs font-bold">{t.urutan}</span>}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-slate-800 text-sm">{t.nama_tahap}</span>
                                {t.status_tahap === 'lulus' && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Lulus</span>}
                              </div>
                              {t.nilai && <div className="text-xs text-slate-500">Nilai: <span className="font-medium text-slate-700">{t.nilai}</span></div>}
                              {t.catatan && <div className="text-xs text-slate-500 mt-1 italic">"{t.catatan}"</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Kanan: Detail Wawancara & Keputusan */}
                  <div className="space-y-6">
                    {/* Hasil Penilaian Wawancara */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" /> Hasil Wawancara
                      </h4>
                      {detailData.penilaian && detailData.penilaian.length > 0 ? (
                        <div className="space-y-4">
                          {detailData.penilaian.map((p, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                              <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
                                <span className="text-xs font-medium text-slate-500">Penilai: {p.nama_penilai}</span>
                                <span className="text-lg font-bold text-blue-600">{Number(p.nilai_total).toFixed(1)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="text-xs"><span className="text-slate-400">Kompetensi:</span> <span className="font-medium">{p.nilai_kompetensi}</span></div>
                                <div className="text-xs"><span className="text-slate-400">Komunikasi:</span> <span className="font-medium">{p.nilai_komunikasi}</span></div>
                                <div className="text-xs"><span className="text-slate-400">Kepribadian:</span> <span className="font-medium">{p.nilai_kepribadian}</span></div>
                                <div className="text-xs"><span className="text-slate-400">Motivasi:</span> <span className="font-medium">{p.nilai_motivasi}</span></div>
                              </div>
                              <div className="mb-2">
                                {p.rekomendasi === 'sangat_direkomendasikan' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Sangat Direkomendasikan</span>}
                                {p.rekomendasi === 'direkomendasikan' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Direkomendasikan</span>}
                                {p.rekomendasi === 'tidak_direkomendasikan' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Tidak Direkomendasikan</span>}
                              </div>
                              {p.catatan && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">"{p.catatan}"</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-4">Belum ada data penilaian wawancara.</p>
                      )}
                    </div>

                    {/* Form Keputusan */}
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                      <h4 className="font-semibold text-slate-800 mb-4">Buat Keputusan Final</h4>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setKeputusan("diterima")}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                              keputusan === "diterima" 
                                ? "border-green-500 bg-green-50 text-green-700" 
                                : "border-slate-200 bg-white text-slate-500 hover:border-green-200 hover:bg-green-50/50"
                            }`}
                          >
                            <CheckCircle size={24} className="mb-1" />
                            <span className="font-medium text-sm">TERIMA</span>
                          </button>
                          
                          <button
                            onClick={() => setKeputusan("ditolak")}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                              keputusan === "ditolak" 
                                ? "border-red-500 bg-red-50 text-red-700" 
                                : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50/50"
                            }`}
                          >
                            <XCircle size={24} className="mb-1" />
                            <span className="font-medium text-sm">TOLAK</span>
                          </button>
                        </div>

                        {keputusan && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Alasan / Catatan {keputusan === "ditolak" && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 text-sm"
                              rows={3}
                              placeholder={keputusan === "diterima" ? "Opsional: Catatan tambahan untuk pelamar..." : "Wajib diisi: Alasan penolakan..."}
                              value={alasan}
                              onChange={(e) => setAlasan(e.target.value)}
                            ></textarea>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setDetailModal(null)} 
                className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors text-sm"
                disabled={submitting}
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!keputusan || submitting || (keputusan === 'ditolak' && !alasan.trim())}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
              >
                {submitting ? "Memproses..." : "Konfirmasi Keputusan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
