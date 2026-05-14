import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Star, TrendingUp, Award, Info, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../../lib/api";

interface HasilItem {
  id: number;
  nilai: number | null;
  status: "lulus" | "tidak_lulus";
  catatan: string | null;
  dinilai_pada: string | null;
  nama_tahap: string;
  urutan: number;
  nilai_kompetensi: number | null;
  nilai_komunikasi: number | null;
  nilai_kepribadian: number | null;
  nilai_motivasi: number | null;
}

interface MenungguItem {
  id: number;
  nama_tahap: string;
  urutan: number;
  status: string;
  tanggal: string | null;
}

interface HasilData {
  selesai: HasilItem[];
  menunggu: MenungguItem[];
}

const statusColors = {
  lulus: { bg: "#ECFDF5", color: "#065F46", label: "LULUS" },
  tidak_lulus: { bg: "#FEF2F2", color: "#991B1B", label: "TIDAK LULUS" },
  menunggu: { bg: "#F8FAFC", color: "#64748B", label: "Menunggu" },
  proses: { bg: "#EFF6FF", color: "#1E40AF", label: "Diproses" },
};

function ScoreRing({ score, max, size = 120 }: { score: number; max: number; size?: number }) {
  const percentage = (score / max) * 100;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = score >= 7.5 ? "#10B981" : "#EF4444";
  const trackColor = score >= 7.5 ? "#D1FAE5" : "#FEE2E2";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={trackColor} strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </svg>
      <div className="absolute text-center">
        <p className="font-bold" style={{ fontSize: size * 0.2, color }}>{score}</p>
        <p className="text-slate-400" style={{ fontSize: size * 0.1 }}>/ {max}</p>
      </div>
    </div>
  );
}

function formatTanggal(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function ResultPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasilData, setHasilData] = useState<HasilData>({ selesai: [], menunggu: [] });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    api.get<HasilData>("/hasil")
      .then((d) => {
        setHasilData(d);
        if (d.selesai.length > 0) setSelectedId(d.selesai[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { selesai, menunggu } = hasilData;
  const selected = selesai.find((h) => h.id === selectedId) ?? selesai[0] ?? null;

  if (selesai.length === 0 && menunggu.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>Hasil Tes</h1>
          <p className="text-sm text-slate-500">Rekap nilai dan penilaian setiap tahap seleksi</p>
        </div>
        <div className="rounded-3xl p-16 text-center" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
          <Award size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-slate-600 mb-2">Belum Ada Hasil</h3>
          <p className="text-sm text-slate-400 mb-6">Nilai dan hasil penilaian akan muncul setelah setiap tahap seleksi selesai dinilai oleh tim HRD.</p>
          <button onClick={() => navigate("/status")} className="px-6 py-2.5 rounded-xl text-sm text-white font-medium" style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" }}>
            Lihat Status Lamaran
          </button>
        </div>
      </div>
    );
  }

  // Build breakdowns from selected
  const breakdowns: { label: string; score: number; max: number }[] = [];
  if (selected) {
    if (selected.nilai_kompetensi != null) breakdowns.push({ label: "Kompetensi Pedagogik", score: selected.nilai_kompetensi, max: 10 });
    if (selected.nilai_komunikasi != null) breakdowns.push({ label: "Komunikasi", score: selected.nilai_komunikasi, max: 10 });
    if (selected.nilai_kepribadian != null) breakdowns.push({ label: "Kepribadian", score: selected.nilai_kepribadian, max: 10 });
    if (selected.nilai_motivasi != null) breakdowns.push({ label: "Motivasi", score: selected.nilai_motivasi, max: 10 });
  }

  const avgNilai = selesai.filter((h) => h.nilai != null).reduce((acc, h) => acc + (h.nilai ?? 0), 0) / (selesai.filter((h) => h.nilai != null).length || 1);

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="mb-6">
        <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>Hasil Tes</h1>
        <p className="text-sm text-slate-500">Rekap nilai dan penilaian setiap tahap seleksi</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: list */}
        <div className="space-y-2">
          {selesai.length > 0 && (
            <>
              <p className="text-xs font-medium text-slate-400 px-1 mb-2">HASIL TERSEDIA</p>
              {selesai.map((h) => {
                const sc = statusColors[h.status] ?? statusColors.menunggu;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedId(h.id)}
                    className="w-full text-left p-4 rounded-2xl transition-all hover:shadow-md"
                    style={{
                      background: selectedId === h.id ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                      border: selectedId === h.id ? "1.5px solid #BFDBFE" : "1px solid rgba(147,197,253,0.2)",
                      boxShadow: selectedId === h.id ? "0 4px 24px rgba(59,130,246,0.1)" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-700">{h.nama_tahap}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    <p className="text-xs text-slate-400">{formatTanggal(h.dinilai_pada)}</p>
                    {h.nilai != null && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={11} fill="#FBBF24" color="#FBBF24" />
                        <span className="text-xs font-medium text-slate-600">Nilai: {h.nilai} / 10</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {menunggu.length > 0 && (
            <>
              <p className="text-xs font-medium text-slate-400 px-1 mt-4 mb-2">MENUNGGU</p>
              {menunggu.map((m) => {
                const sc = statusColors[m.status as keyof typeof statusColors] ?? statusColors.menunggu;
                return (
                  <div key={m.id} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(147,197,253,0.15)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-slate-400">{m.nama_tahap}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    {m.tanggal && (
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <Clock size={10} />{formatTanggal(m.tanggal)}
                      </p>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Right: detail */}
        <div className="col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-slate-700 mb-1">{selected.nama_tahap}</h2>
                    <p className="text-sm text-slate-400">{formatTanggal(selected.dinilai_pada)}</p>
                  </div>
                  <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ background: statusColors[selected.status].bg, color: statusColors[selected.status].color }}>
                    {statusColors[selected.status].label}
                  </span>
                </div>

                {selected.nilai != null ? (
                  <div className="flex items-center gap-8">
                    <ScoreRing score={selected.nilai} max={10} size={120} />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl p-3" style={{ background: "#F8FAFC" }}>
                          <p className="text-xs text-slate-400 mb-0.5">Nilai Kamu</p>
                          <p className="text-lg font-semibold text-green-600">{selected.nilai}</p>
                        </div>
                        <div className="rounded-2xl p-3" style={{ background: "#F8FAFC" }}>
                          <p className="text-xs text-slate-400 mb-0.5">Nilai Lulus Min.</p>
                          <p className="text-lg font-semibold text-slate-600">7.5</p>
                        </div>
                      </div>
                      <div className="rounded-2xl p-3" style={{ background: "#F8FAFC" }}>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Pencapaian</span>
                          <span className="font-medium">{Math.round((selected.nilai / 10) * 100)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(selected.nilai / 10) * 100}%`, background: selected.nilai >= 7.5 ? "linear-gradient(90deg, #10B981, #34D399)" : "linear-gradient(90deg, #EF4444, #F87171)" }} />
                        </div>
                      </div>
                      {selected.catatan && (
                        <div className="flex items-start gap-2 p-3 rounded-2xl" style={{ background: "#EFF6FF" }}>
                          <Info size={13} color="#3B82F6" className="mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-700">{selected.catatan}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#ECFDF5" }}>
                    <CheckCircle size={20} color="#10B981" />
                    <div>
                      <p className="text-sm font-medium text-green-700">Tahap berhasil diselesaikan</p>
                      <p className="text-xs text-green-600">Tidak ada nilai numerik untuk tahap ini</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button onClick={() => navigate("/status")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" }}>
                    Lihat Tahapan Seleksi <ArrowRight size={13} />
                  </button>
                  {menunggu.length > 0 && (
                    <button onClick={() => navigate("/jadwal")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#F1F5F9", color: "#475569" }}>
                      Cek Jadwal Berikutnya <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {breakdowns.length > 0 && (
                <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
                  <div className="flex items-center gap-2 mb-5">
                    <TrendingUp size={16} color="#3B82F6" />
                    <h3 className="text-slate-700">Rincian Nilai per Bidang</h3>
                  </div>
                  <div className="space-y-3">
                    {breakdowns.map((b) => {
                      const pct = (b.score / b.max) * 100;
                      const grade = b.score >= 8.5 ? "Sangat Baik" : b.score >= 7.5 ? "Baik" : "Perlu Ditingkatkan";
                      const gColor = b.score >= 7.5 ? "#10B981" : "#EF4444";
                      return (
                        <div key={b.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-slate-600">{b.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs" style={{ color: gColor }}>{grade}</span>
                              <span className="text-sm font-medium text-slate-700">{b.score} / {b.max}</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: b.score >= 7.5 ? "linear-gradient(90deg, #10B981, #34D399)" : "linear-gradient(90deg, #EF4444, #F87171)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selesai.filter((h) => h.nilai != null).length > 1 && (
                <div className="rounded-3xl p-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 100%)", border: "1px solid #FDE047" }}>
                  <Award size={28} color="#D97706" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Rata-rata Nilai Kamu: {avgNilai.toFixed(1)}</p>
                    <p className="text-xs text-amber-600">Berdasarkan {selesai.filter((h) => h.nilai != null).length} tahap yang sudah dinilai</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl p-16 text-center" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)" }}>
              <Clock size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400 text-sm">Pilih tahap dari daftar untuk melihat detail nilai</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
