import { useState } from "react";
import { CheckCircle, XCircle, Star, TrendingUp, Award, Info, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const results = [
  {
    id: 1,
    stage: "Tes Tulis CBT",
    date: "22 Maret 2026",
    score: 8.2,
    maxScore: 10,
    passingScore: 7.5,
    status: "lulus",
    breakdown: [
      { label: "Kompetensi Pedagogik", score: 8.5, max: 10 },
      { label: "Kompetensi Profesional", score: 8.0, max: 10 },
      { label: "Wawasan Umum", score: 8.1, max: 10 },
    ],
    feedback: "Nilai kamu berada di atas rata-rata peserta. Pertahankan dan tingkatkan kemampuanmu di tahap berikutnya.",
  },
  {
    id: 2,
    stage: "Seleksi Administrasi",
    date: "15 Maret 2026",
    score: null,
    maxScore: null,
    passingScore: null,
    status: "lulus",
    breakdown: [],
    feedback: "Semua dokumen administrasi telah memenuhi persyaratan yang ditetapkan.",
  },
];

const upcomingResults = [
  { id: 3, stage: "Micro Teaching", date: "10 April 2026", status: "pending" },
  { id: 4, stage: "Wawancara HR", date: "21 April 2026", status: "pending" },
  { id: 5, stage: "Keputusan Final", date: "TBA", status: "pending" },
];

// Standardized status color system
const statusColors = {
  lulus: { bg: "#ECFDF5", color: "#065F46", label: "LULUS" },
  gagal: { bg: "#FEF2F2", color: "#991B1B", label: "TIDAK LULUS" },
  menunggu: { bg: "#F8FAFC", color: "#64748B", label: "Menunggu" },
  "akan-datang": { bg: "#EFF6FF", color: "#1E40AF", label: "Akan Datang" },
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-semibold" style={{ color, fontSize: "1.5rem", lineHeight: "1.2" }}>
          {score}
        </div>
        <div className="text-slate-400" style={{ fontSize: "0.65rem" }}>
          / {max}
        </div>
      </div>
    </div>
  );
}

export function ResultPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(results[0]);

  const handleDownloadReport = () => {
    toast.success("Laporan nilai sedang diunduh...");
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="mb-6">
        <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>
          Hasil Tes
        </h1>
        <p className="text-sm text-slate-500">Rekap nilai dan penilaian setiap tahap seleksi</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Result List */}
        <div className="space-y-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide px-1">Hasil Tersedia</p>
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="w-full text-left p-4 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                background: selected.id === r.id ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
                border:
                  selected.id === r.id ? "1.5px solid #BFDBFE" : "1px solid rgba(147,197,253,0.2)",
                boxShadow:
                  selected.id === r.id
                    ? "0 8px 24px rgba(59,130,246,0.12)"
                    : "0 2px 8px rgba(59,130,246,0.04)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{r.stage}</span>
                {/* Standardized status badge */}
                <span
                  className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full"
                  style={{
                    background: r.status === "lulus" ? statusColors.lulus.bg : statusColors.gagal.bg,
                    color: r.status === "lulus" ? statusColors.lulus.color : statusColors.gagal.color,
                  }}
                >
                  {r.status === "lulus" ? (
                    <CheckCircle size={10} />
                  ) : (
                    <XCircle size={10} />
                  )}
                  {r.status === "lulus" ? "Lulus" : "Tidak Lulus"}
                </span>
              </div>
              <p className="text-xs text-slate-400">{r.date}</p>
              {r.score !== null && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Star size={11} fill="#FBBF24" color="#FBBF24" />
                  <span className="text-xs font-medium text-slate-600">
                    Nilai: {r.score} / {r.maxScore}
                  </span>
                </div>
              )}
            </button>
          ))}

          <p className="text-xs text-slate-400 uppercase tracking-wide px-1 mt-4">Menunggu</p>
          {upcomingResults.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.4)",
                border: "1px dashed rgba(147,197,253,0.3)",
                opacity: 0.7,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">{r.stage}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {r.date}
                  </p>
                </div>
                {/* Standardized Menunggu badge */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0"
                  style={{ background: statusColors.menunggu.bg, color: statusColors.menunggu.color }}
                >
                  Menunggu
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="col-span-2 space-y-4">
          {/* Main Score Card */}
          <div
            className="rounded-3xl p-6 transition-all hover:shadow-lg"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
              boxShadow: "0 8px 32px rgba(59,130,246,0.08)",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-slate-800">{selected.stage}</h2>
                <p className="text-sm text-slate-400 mt-0.5">{selected.date}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Standardized status badge */}
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
                  style={{
                    background: selected.status === "lulus" ? statusColors.lulus.bg : statusColors.gagal.bg,
                    color: selected.status === "lulus" ? statusColors.lulus.color : statusColors.gagal.color,
                  }}
                >
                  {selected.status === "lulus" ? (
                    <CheckCircle size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {selected.status === "lulus" ? "LULUS" : "TIDAK LULUS"}
                </span>
              </div>
            </div>

            {selected.score !== null ? (
              <div className="flex items-center gap-8">
                {/* Score Ring */}
                <ScoreRing score={selected.score} max={selected.maxScore!} size={140} />

                {/* Score Details */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div
                      className="p-3 rounded-2xl"
                      style={{ background: "#F8FAFC" }}
                    >
                      <p className="text-xs text-slate-400 mb-1">Nilai Kamu</p>
                      <p className="font-semibold text-green-600" style={{ fontSize: "1.25rem" }}>
                        {selected.score}
                      </p>
                    </div>
                    <div
                      className="p-3 rounded-2xl"
                      style={{ background: "#F8FAFC" }}
                    >
                      <p className="text-xs text-slate-400 mb-1">Nilai Lulus Min.</p>
                      <p className="font-semibold text-slate-600" style={{ fontSize: "1.25rem" }}>
                        {selected.passingScore}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span>Pencapaian</span>
                      <span className="text-green-600">{Math.round((selected.score / selected.maxScore!) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(selected.score / selected.maxScore!) * 100}%`,
                          background:
                            selected.score >= selected.passingScore!
                              ? "linear-gradient(90deg, #059669, #34D399)"
                              : "linear-gradient(90deg, #EF4444, #FCA5A5)",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="mt-3 p-3 rounded-xl flex items-start gap-2"
                    style={{ background: "#EFF6FF" }}
                  >
                    <Info size={13} color="#3B82F6" className="mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">{selected.feedback}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleDownloadReport}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90 hover:shadow-md"
                      style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
                    >
                      Lihat Detail Nilai
                      <ArrowRight size={11} />
                    </button>
                    <button
                      onClick={() => navigate("/status")}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs transition-all hover:bg-slate-100"
                      style={{ background: "#F1F5F9", color: "#64748B" }}
                    >
                      Lihat Tahapan Seleksi
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "#ECFDF5" }}
                >
                  <CheckCircle size={24} color="#10B981" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Lulus Tanpa Skor Numerik</p>
                  <p className="text-sm text-slate-500 mt-0.5">{selected.feedback}</p>
                </div>
              </div>
            )}
          </div>

          {/* Score Breakdown */}
          {selected.breakdown.length > 0 && (
            <div
              className="rounded-3xl p-6 transition-all hover:shadow-lg"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(147,197,253,0.25)",
                boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={16} color="#3B82F6" />
                <h3 className="text-slate-700">Rincian Nilai per Bidang</h3>
              </div>

              <div className="space-y-4">
                {selected.breakdown.map((item, i) => {
                  const pct = (item.score / item.max) * 100;
                  const isGood = item.score >= 7.5;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-600">{item.label}</span>
                        <div className="flex items-center gap-2">
                          {/* Standardized status badge for breakdown */}
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: isGood ? statusColors.lulus.bg : statusColors.gagal.bg,
                              color: isGood ? statusColors.lulus.color : statusColors.gagal.color,
                            }}
                          >
                            {isGood ? "Baik" : "Perlu Ditingkatkan"}
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            {item.score} / {item.max}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: isGood
                              ? "linear-gradient(90deg, #059669, #34D399)"
                              : "linear-gradient(90deg, #F97316, #FDBA74)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Achievement */}
          <div
            className="rounded-3xl p-5 transition-all hover:shadow-md"
            style={{
              background: "linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 100%)",
              border: "1px solid #FDE68A",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Award size={20} color="#D97706" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Kamu di Top 30% Peserta!</p>
                  <p className="text-xs text-amber-600">Nilai rata-rata peserta Tes Tulis: 7.1 • Nilaimu 8.2</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/jadwal")}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition-colors"
              >
                Cek Jadwal Lengkap <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
