import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Circle,
  AlertCircle,
  FileText,
  Users,
  Monitor,
  MessageSquare,
  Award,
  RefreshCw,
  Search,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { EmptyState } from "../components/EmptyState";

const timeline = [
  {
    id: 1,
    step: "Pendaftaran & Administrasi",
    icon: FileText,
    status: "selesai",
    date: "15 Maret 2026",
    desc: "Berkas lamaran kamu telah diterima dan diverifikasi oleh tim HRD. Semua dokumen lengkap dan memenuhi persyaratan.",
    badge: "Lulus",
    badgeColor: "#065F46",
    badgeBg: "#ECFDF5",
    details: ["CV & Portofolio ✓", "Transkrip Nilai ✓", "Surat Lamaran ✓"],
  },
  {
    id: 2,
    step: "Tes Tulis (CBT)",
    icon: Monitor,
    status: "selesai",
    date: "22 Maret 2026",
    desc: "Tes kemampuan akademik dan pedagogik secara online. Kamu menyelesaikan semua soal dalam waktu yang ditentukan.",
    badge: "Lulus • 8.2",
    badgeColor: "#065F46",
    badgeBg: "#ECFDF5",
    details: ["Waktu: 120 menit", "Soal: 80 pertanyaan", "Nilai: 8.2 / 10"],
  },
  {
    id: 3,
    step: "Micro Teaching",
    icon: Users,
    status: "aktif",
    date: "10 April 2026",
    desc: "Demonstrasi mengajar di depan panel penilai. Persiapkan RPP dan materi yang akan dibawakan sesuai topik yang diberikan.",
    badge: "Akan Datang",
    badgeColor: "#1E40AF",
    badgeBg: "#EFF6FF",
    details: ["Durasi: 30 menit", "Lokasi: Ruang A-201", "Waktu: 09.00 WIB"],
  },
  {
    id: 4,
    step: "Wawancara HR & User",
    icon: MessageSquare,
    status: "menunggu",
    date: "Belum ditentukan",
    desc: "Sesi wawancara langsung dengan tim HR dan calon atasan langsung. Penilaian meliputi kompetensi, motivasi, dan culture fit.",
    badge: "Menunggu",
    badgeColor: "#64748B",
    badgeBg: "#F8FAFC",
    details: ["Format: In-person", "Durasi: ±60 menit"],
  },
  {
    id: 5,
    step: "Keputusan Final",
    icon: Award,
    status: "menunggu",
    date: "Belum ditentukan",
    desc: "Pengumuman hasil seleksi akhir. Kandidat yang lolos akan mendapatkan offering letter dan informasi onboarding.",
    badge: "Menunggu",
    badgeColor: "#64748B",
    badgeBg: "#F8FAFC",
    details: ["Pengumuman via email", "Onboarding 2 minggu setelah keputusan"],
  },
];

// Status color system (standardized)
const statusBadgeConfig: Record<string, { color: string; bg: string }> = {
  Lulus: { color: "#065F46", bg: "#ECFDF5" },
  Gagal: { color: "#991B1B", bg: "#FEF2F2" },
  Menunggu: { color: "#64748B", bg: "#F8FAFC" },
  "Akan Datang": { color: "#1E40AF", bg: "#EFF6FF" },
  Warning: { color: "#92400E", bg: "#FFFBEB" },
};

export function StatusPage() {
  const navigate = useNavigate();
  const [showEmpty] = useState(false); // Toggle to `true` to preview empty state

  if (showEmpty) {
    return (
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>
            Status Lamaran
          </h1>
          <p className="text-sm text-slate-500">Riwayat dan perkembangan tahapan seleksimu</p>
        </div>
        <div
          className="rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(147,197,253,0.25)",
            boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
          }}
        >
          <EmptyState
            icon={<Search size={36} />}
            title="Belum Ada Lamaran"
            description="Kamu belum memiliki lamaran aktif. Mulai lamar posisi yang sesuai dengan keahlianmu dan pantau perkembangannya di sini."
            actionLabel="Lihat Lowongan"
            onAction={() => navigate("/dashboard")}
            secondaryActionLabel="Lengkapi Profil"
            onSecondaryAction={() => navigate("/dokumen")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="mb-6">
        <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>
          Status Lamaran
        </h1>
        <p className="text-sm text-slate-500">Riwayat dan perkembangan tahapan seleksimu</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="col-span-2 space-y-0">
          {timeline.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              {/* Left side - connector */}
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all"
                  style={{
                    background:
                      item.status === "selesai"
                        ? "linear-gradient(135deg, #059669, #10B981)"
                        : item.status === "aktif"
                        ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                        : "#F1F5F9",
                    border: item.status === "menunggu" ? "2px solid #E2E8F0" : "none",
                    boxShadow:
                      item.status === "aktif"
                        ? "0 0 0 5px rgba(59,130,246,0.15), 0 4px 12px rgba(37,99,235,0.3)"
                        : item.status === "selesai"
                        ? "0 4px 12px rgba(16,185,129,0.25)"
                        : "none",
                  }}
                >
                  {item.status === "selesai" ? (
                    <CheckCircle size={18} color="white" />
                  ) : item.status === "aktif" ? (
                    <item.icon size={17} color="white" />
                  ) : (
                    <Circle size={17} color="#CBD5E1" />
                  )}
                </div>
                {index < timeline.length - 1 && (
                  <div
                    className="w-0.5 flex-1 mt-2 mb-2"
                    style={{
                      background:
                        item.status === "selesai"
                          ? "linear-gradient(180deg, #10B981, #D1FAE5)"
                          : item.status === "aktif"
                          ? "linear-gradient(180deg, #3B82F6, #E2E8F0)"
                          : "#E2E8F0",
                      minHeight: "40px",
                    }}
                  />
                )}
              </div>

              {/* Right side - content */}
              <div className={`flex-1 pb-6 ${index === timeline.length - 1 ? "pb-0" : ""}`}>
                <div
                  className="rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  style={{
                    background: item.status === "aktif" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px)",
                    border:
                      item.status === "aktif"
                        ? "1.5px solid #BFDBFE"
                        : "1px solid rgba(147,197,253,0.2)",
                    boxShadow:
                      item.status === "aktif"
                        ? "0 8px 32px rgba(59,130,246,0.12)"
                        : "0 2px 12px rgba(59,130,246,0.05)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {item.status === "aktif" && (
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: "#3B82F6" }}
                          />
                        )}
                        <h3
                          className="text-slate-700"
                          style={{
                            color: item.status === "menunggu" ? "#94A3B8" : undefined,
                          }}
                        >
                          {item.step}
                        </h3>
                      </div>
                      <p
                        className="text-xs flex items-center gap-1"
                        style={{ color: item.status === "menunggu" ? "#CBD5E1" : "#64748B" }}
                      >
                        <Clock size={11} />
                        {item.date}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                      style={{
                        background:
                          item.badge === "Lulus" || item.badge.startsWith("Lulus")
                            ? statusBadgeConfig["Lulus"].bg
                            : item.badge === "Akan Datang"
                            ? statusBadgeConfig["Akan Datang"].bg
                            : statusBadgeConfig["Menunggu"].bg,
                        color:
                          item.badge === "Lulus" || item.badge.startsWith("Lulus")
                            ? statusBadgeConfig["Lulus"].color
                            : item.badge === "Akan Datang"
                            ? statusBadgeConfig["Akan Datang"].color
                            : statusBadgeConfig["Menunggu"].color,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <p
                    className="text-xs leading-relaxed mb-3"
                    style={{ color: item.status === "menunggu" ? "#94A3B8" : "#64748B" }}
                  >
                    {item.desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {item.details.map((detail, di) => (
                      <span
                        key={di}
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{
                          background: item.status === "menunggu" ? "#F8FAFC" : "#F1F5F9",
                          color: item.status === "menunggu" ? "#CBD5E1" : "#475569",
                        }}
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          {/* Overall Progress */}
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
              boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-700">Ringkasan Seleksi</h3>
              <div className="flex items-center gap-1">
                <RefreshCw size={10} className="text-slate-400" />
                <span style={{ color: "#94A3B8", fontSize: "0.68rem" }}>3 mnt lalu</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress Keseluruhan</span>
                  <span className="text-blue-600 font-medium">40%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: "40%",
                      background: "linear-gradient(90deg, #2563EB, #60A5FA)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                { label: "Tahap Selesai", value: "2", color: "#10B981", status: "Lulus" },
                { label: "Tahap Aktif", value: "1", color: "#3B82F6", status: "Aktif" },
                { label: "Tahap Menunggu", value: "2", color: "#94A3B8", status: "Menunggu" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs text-slate-500">{item.label}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Color Legend */}
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
              boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
            }}
          >
            <h3 className="text-slate-700 mb-3">Keterangan Status</h3>
            <div className="space-y-2">
              {[
                { label: "Lulus", ...statusBadgeConfig["Lulus"] },
                { label: "Akan Datang", ...statusBadgeConfig["Akan Datang"] },
                { label: "Menunggu", ...statusBadgeConfig["Menunggu"] },
                { label: "Gagal", ...statusBadgeConfig["Gagal"] },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div
            className="rounded-3xl p-5"
            style={{
              background: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)",
              border: "1px solid #BFDBFE",
            }}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} color="#3B82F6" className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Persiapkan Micro Teaching</p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Siapkan RPP untuk topik yang diberikan. Pastikan kamu hadir 15 menit sebelum waktu yang ditentukan.
                </p>
                <button
                  onClick={() => navigate("/jadwal")}
                  className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors group"
                >
                  Cek Jadwal Lengkap
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
              boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
            }}
          >
            <h3 className="text-slate-700 mb-3">Butuh Bantuan?</h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Hubungi tim HRD kami jika ada pertanyaan mengenai proses seleksi.
            </p>
            <a
              href="mailto:hr@talentpath.id"
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              hr@talentpath.id →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
