import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Briefcase, Calendar, Users, ArrowRight, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { api } from "../../lib/api";

interface Lowongan {
  id: number;
  posisi: string;
  deskripsi: string | null;
  persyaratan: string | null;
  kuota: number;
  deadline: string;
  status: string;
  dibuat_oleh_nama: string | null;
}

interface LamaranSaya {
  lowongan_id: number;
  status: string;
}

function fmtTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function daysLeft(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function DaftarLowonganPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<Lowongan[]>([]);
  const [lamaranSaya, setLamaranSaya] = useState<LamaranSaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [detail, setDetail] = useState<Lowongan | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Lowongan[]>("/lowongan"),
      api.get<{ lamaran: LamaranSaya[] }>("/berkas").then((d) => d.lamaran ? [{ lowongan_id: (d.lamaran as unknown as { id: number }).id, status: "pending" }] : []).catch(() => []),
    ]).then(([low]) => {
      setList(low);
    }).catch(() => {}).finally(() => setLoading(false));

    // Cek lamaran yang sudah ada via berkas endpoint
    api.get<{ lamaran: { id: number; posisi: string } | null }>("/berkas")
      .then((d) => {
        if (d.lamaran) {
          setLamaranSaya([{ lowongan_id: d.lamaran.id, status: "pending" }]);
        }
      })
      .catch(() => {});
  }, []);

  async function handleDaftar(lowonganId: number) {
    setApplying(lowonganId);
    try {
      await api.post("/lowongan/daftar", { lowonganId });
      setSuccessId(lowonganId);
      setDetail(null);
      setLamaranSaya((prev) => [...prev, { lowongan_id: lowonganId, status: "pending" }]);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Gagal mendaftar");
    } finally {
      setApplying(null);
    }
  }

  const sudahDaftar = (id: number) => lamaranSaya.some((l) => l.lowongan_id === id);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Lowongan Tersedia</h1>
          <p className="text-sm text-slate-500 mt-1">Temukan posisi pengajar yang sesuai dengan keahlianmu</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>
          {list.length} lowongan aktif
        </span>
      </div>

      {list.length === 0 ? (
        <div className="py-20 text-center text-slate-400 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <Briefcase size={48} className="mx-auto mb-4 opacity-25" />
          <p className="text-lg">Belum ada lowongan yang tersedia saat ini</p>
          <p className="text-sm mt-1">Cek kembali beberapa saat lagi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {list.map((l) => {
            const days = daysLeft(l.deadline);
            const isDaftar = sudahDaftar(l.id);
            const isSuccess = successId === l.id;

            return (
              <div
                key={l.id}
                className="rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(20px)",
                  border: isDaftar ? "2px solid rgba(16,185,129,0.4)" : "1px solid rgba(147,197,253,0.25)",
                  boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
                }}
                onClick={() => setDetail(l)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)" }}>
                    <Briefcase size={20} color="#3B82F6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-slate-800">{l.posisi}</h2>
                        {l.deskripsi && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{l.deskripsi}</p>
                        )}
                      </div>
                      {isDaftar ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
                          style={{ background: "#ECFDF5", color: "#065F46" }}>
                          <CheckCircle size={12} /> Sudah Mendaftar
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
                          style={{ background: "#ECFDF5", color: "#065F46" }}>
                          Buka
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar size={14} /> Deadline: {fmtTgl(l.deadline)}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Users size={14} /> Kuota: {l.kuota} orang
                      </span>
                      <span
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: days <= 3 ? "#FEF2F2" : days <= 7 ? "#FFF7ED" : "#EFF6FF",
                          color: days <= 3 ? "#991B1B" : days <= 7 ? "#92400E" : "#1D4ED8",
                        }}
                      >
                        <Clock size={11} />
                        {days <= 0 ? "Sudah ditutup" : `${days} hari lagi`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 flex-shrink-0 mt-1" />
                </div>

                {isSuccess && (
                  <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle size={16} />
                    Berhasil mendaftar! Segera upload berkas lamaran kamu.
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate("/berkas"); }}
                      className="ml-1 underline font-medium"
                    >
                      Upload Sekarang →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-lg rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", maxHeight: "85vh" }}>
            {/* Header */}
            <div className="p-6 pb-4" style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={22} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-white">{detail.posisi}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Deadline: {fmtTgl(detail.deadline)} · Kuota: {detail.kuota}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(85vh - 200px)" }}>
              {detail.deskripsi && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Pekerjaan</h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{detail.deskripsi}</p>
                </div>
              )}
              {detail.persyaratan && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Persyaratan</h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{detail.persyaratan}</p>
                </div>
              )}
              <div className="p-4 rounded-2xl" style={{ background: "#FFF7ED", border: "1px solid rgba(251,191,36,0.3)" }}>
                <p className="text-sm text-amber-700">
                  Dokumen yang perlu disiapkan: CV, Transkrip Nilai, Surat Lamaran, Ijazah/SKL, dan Foto Formal.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setDetail(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              {sudahDaftar(detail.id) ? (
                <button
                  onClick={() => { navigate("/berkas"); setDetail(null); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
                  style={{ background: "linear-gradient(135deg,#10B981,#34D399)" }}
                >
                  Upload Berkas <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => handleDaftar(detail.id)}
                  disabled={applying === detail.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
                >
                  {applying === detail.id ? "Mendaftar..." : "Daftar Sekarang"} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
