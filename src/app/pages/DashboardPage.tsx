import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  BarChart2,
  BookOpen,
  ArrowRight,
  Bell,
  Star,
  TrendingUp,
  Award,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

interface DashboardStep {
  label: string;
  status: string;
  nilai: number | null;
}
interface DashboardNotif {
  id: number;
  judul: string;
  pesan: string;
  tipe: string;
  isRead: boolean;
  createdAt: string;
}
interface DashboardData {
  user: { namaLengkap: string; avatarUrl: string | null; posisi: string };
  lamaran: { id: number; status: string; tanggalDaftar: string; posisi: string } | null;
  steps: DashboardStep[];
  notifikasi: DashboardNotif[];
  jadwalBerikutnya: {
    namaTahap: string;
    tanggal: string;
    waktuMulai: string;
    waktuSelesai: string;
    lokasi: string | null;
    linkOnline: string | null;
  } | null;
  hasilTerakhir: {
    namaTahap: string;
    nilai: number;
    status: string;
  } | null;
}

const TAHAP_LABELS = [
  "Pendaftaran & Administrasi",
  "Tes Tulis (CBT)",
  "Micro Teaching",
  "Wawancara HR & User",
  "Keputusan Final",
];

// Fallback steps jika pelamar belum ada lamaran
const defaultSteps = TAHAP_LABELS.map((label) => ({
  label,
  status: "menunggu",
  nilai: null,
}));

function formatTime(t: string) {
  return t ? t.slice(0, 5).replace(":", ".") : "";
}
function formatTanggal(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nama = data?.user.namaLengkap || user?.namaLengkap || "Pengguna";
  const steps = data?.steps.length ? data.steps : defaultSteps;
  const notifikasi = data?.notifikasi ?? [];
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Hitung progress stepper secara dinamis
  const doneCount = steps.filter((s) => s.status === "lulus").length;
  const activeStep = steps.find((s) => s.status === "proses");
  const activeIdx = activeStep ? steps.indexOf(activeStep) : -1;
  const progressPct = steps.length > 1
    ? Math.round((doneCount / (steps.length - 1)) * 100)
    : 0;
  const tahapAktif = activeStep?.label || (doneCount === steps.length ? "Selesai" : null);

  const jadwal = data?.jadwalBerikutnya;
  const hasil = data?.hasilTerakhir;
  const hasLamaran = !!data?.lamaran;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-6">
      {/* Header Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>
            Halo, {nama} 👋
          </h1>
          <p className="text-sm text-slate-500">
            {today} • Pantau progress lamaran kamu di sini
          </p>
        </div>
        {tahapAktif && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ background: "#FEF9C3", border: "1px solid #FDE047", color: "#92400E" }}
          >
            <Star size={14} fill="#FBBF24" color="#FBBF24" />
            <span>Tahap Aktif: {tahapAktif}</span>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      <div
        className="rounded-3xl p-6 transition-all duration-300 hover:shadow-lg"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(147,197,253,0.25)",
          boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-700">Progress Seleksi</h3>
            {!hasLamaran && (
              <p className="text-xs text-slate-400 mt-0.5">Belum ada lamaran aktif</p>
            )}
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: "#EFF6FF", color: "#2563EB" }}
          >
            {hasLamaran ? `Tahap ${doneCount + (activeStep ? 1 : 0)} dari ${steps.length}` : `0 dari ${steps.length}`}
          </span>
        </div>

        {/* Stepper horizontal — tablet & desktop */}
        <div className="hidden sm:flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 z-0" style={{ background: "#E2E8F0" }} />
          {/* Progress line */}
          <div
            className="absolute top-5 left-0 h-0.5 z-0"
            style={{
              background: "linear-gradient(90deg, #2563EB, #3B82F6)",
              width: hasLamaran ? `${progressPct}%` : "0%",
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {steps.map((step, idx) => {
            const done = step.status === "lulus";
            const active = step.status === "proses";
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: done
                      ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                      : active
                      ? "white"
                      : "#F1F5F9",
                    border: active ? "2px solid #3B82F6" : "none",
                    boxShadow: active
                      ? "0 0 0 5px rgba(59,130,246,0.15), 0 4px 12px rgba(37,99,235,0.25)"
                      : done
                      ? "0 4px 12px rgba(37,99,235,0.28)"
                      : "none",
                  }}
                >
                  {done ? (
                    <CheckCircle size={18} color="white" />
                  ) : active ? (
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 rounded-full" style={{ background: "#CBD5E1" }} />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium" style={{ color: done || active ? "#1E40AF" : "#94A3B8" }}>
                    {step.label}
                  </p>
                  {step.nilai && (
                    <p className="text-xs" style={{ color: "#3B82F6", fontSize: "0.65rem" }}>
                      Nilai: {step.nilai}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stepper vertical — mobile */}
        <div className="sm:hidden">
          {steps.map((step, idx) => {
            const done = step.status === "lulus";
            const active = step.status === "proses";
            const isLast = idx === steps.length - 1;
            return (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: done
                        ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                        : active
                        ? "white"
                        : "#F1F5F9",
                      border: active ? "2px solid #3B82F6" : "none",
                      boxShadow: active
                        ? "0 0 0 4px rgba(59,130,246,0.15)"
                        : done
                        ? "0 4px 12px rgba(37,99,235,0.25)"
                        : "none",
                    }}
                  >
                    {done ? (
                      <CheckCircle size={16} color="white" />
                    ) : active ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#CBD5E1" }} />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1"
                      style={{ minHeight: "20px", background: done ? "#3B82F6" : "#E2E8F0" }}
                    />
                  )}
                </div>
                <div className={isLast ? "pt-1.5" : "pt-1.5 pb-3"}>
                  <p className="text-sm font-medium" style={{ color: done || active ? "#1E40AF" : "#64748B" }}>
                    {step.label}
                  </p>
                  {step.nilai && (
                    <p className="text-xs mt-0.5" style={{ color: "#3B82F6" }}>
                      Nilai: {step.nilai}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Status */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
            boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
          }}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-2 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp size={17} color="white" />
              </div>
              {hasLamaran && (
                <span
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  Aktif
                </span>
              )}
            </div>
            <p className="text-blue-100 text-xs mb-1">Status Saat Ini</p>
            <h3 className="text-white text-base">{tahapAktif || (hasLamaran ? "Menunggu" : "Belum Melamar")}</h3>
            <p className="text-blue-200 text-xs mt-1">
              {hasLamaran
                ? tahapAktif
                  ? "Persiapkan materi terbaik kamu"
                  : `${doneCount} tahap selesai`
                : "Daftarkan lamaran kamu"}
            </p>
            <button
              onClick={() => navigate("/lowongan")}
              className="mt-4 flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors group"
            >
              Lihat Lowongan{" "}
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Next Schedule */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(147,197,253,0.25)",
            boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
              <Calendar size={17} color="#3B82F6" />
            </div>
            {jadwal && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#FEF9C3", color: "#92400E" }}>
                Segera
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mb-1">Jadwal Berikutnya</p>
          {jadwal ? (
            <>
              <h3 className="text-slate-700">{jadwal.namaTahap}</h3>
              <p className="text-slate-500 text-xs mt-1">{formatTanggal(jadwal.tanggal)}</p>
              <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg w-fit" style={{ background: "#F0FDF4" }}>
                <Clock size={11} color="#10B981" />
                <span className="text-xs text-green-600">
                  {formatTime(jadwal.waktuMulai)} – {formatTime(jadwal.waktuSelesai)} WIB
                </span>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-slate-400 text-sm">Belum ada jadwal</h3>
              <p className="text-slate-400 text-xs mt-1">Jadwal akan muncul setelah admin menetapkannya</p>
            </>
          )}
          <button
            onClick={() => navigate("/jadwal")}
            className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors group"
          >
            Cek Jadwal Lengkap{" "}
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Last Result */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(147,197,253,0.25)",
            boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
              <Award size={17} color="#10B981" />
            </div>
            {hasil && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                style={{
                  background: hasil.status === "lulus" ? "#ECFDF5" : "#FEF2F2",
                  color: hasil.status === "lulus" ? "#065F46" : "#991B1B",
                }}
              >
                <CheckCircle size={10} />
                {hasil.status === "lulus" ? "Lulus" : "Tidak Lulus"}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mb-1">Hasil Terakhir</p>
          {hasil ? (
            <>
              <h3 className="text-slate-700">{hasil.namaTahap}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-green-600 font-semibold" style={{ fontSize: "1.5rem" }}>{hasil.nilai}</span>
                <span className="text-slate-400 text-xs">/ 10.0</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(hasil.nilai / 10) * 100}%`,
                    background: "linear-gradient(90deg, #10B981, #34D399)",
                    transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-slate-400 text-sm">Belum ada nilai</h3>
              <p className="text-slate-400 text-xs mt-1">Nilai akan muncul setelah tahap selesai dinilai</p>
            </>
          )}
          <button
            onClick={() => navigate("/berkas")}
            className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors group"
          >
            Upload Berkas{" "}
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Notifications + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notifications Panel */}
        <div
          className="lg:col-span-2 rounded-3xl p-6 transition-all duration-200 hover:shadow-lg"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(147,197,253,0.25)",
            boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="text-slate-700">Notifikasi Terbaru</h3>
              {notifikasi.filter((n) => !n.isRead).length > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#EF4444", fontSize: "0.625rem" }}
                >
                  {notifikasi.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <RefreshCw size={10} className="text-slate-400" />
                <span className="text-slate-400" style={{ fontSize: "0.68rem" }}>
                  Baru saja
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {notifikasi.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">Belum ada notifikasi</div>
            ) : (
              notifikasi.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl transition-all hover:scale-[1.005] hover:shadow-sm cursor-pointer"
                  style={{
                    background: notif.tipe === "urgent" ? "#EFF6FF" : "#F8FAFC",
                    border: notif.tipe === "urgent" ? "1px solid #BFDBFE" : "1px solid transparent",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
                    <Bell size={16} color="#3B82F6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{notif.judul}</p>
                        {!notif.isRead && (
                          <span className="flex-shrink-0 text-white px-1.5 py-0.5 rounded-md" style={{ background: "#3B82F6", fontSize: "0.55rem" }}>
                            BARU
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.pesan}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-3xl p-6 transition-all duration-200 hover:shadow-lg"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(147,197,253,0.25)",
            boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
          }}
        >
          <h3 className="text-slate-700 mb-5">Menu Cepat</h3>
          <div className="space-y-2.5">
            {[
              { icon: FileText, label: "Lowongan",      sub: "Lihat & daftar lowongan", path: "/lowongan", color: "#3B82F6", bg: "#EFF6FF" },
              { icon: BarChart2, label: "Upload Berkas", sub: "Upload dokumen lamaran", path: "/berkas",   color: "#10B981", bg: "#ECFDF5" },
              { icon: Bell, label: "Jadwal Saya",        sub: "Cek jadwal interview",   path: "/jadwal",   color: "#8B5CF6", bg: "#F5F3FF" },
              { icon: BookOpen, label: "Profil Saya",    sub: "Edit data profilmu",     path: "/profil",   color: "#F59E0B", bg: "#FFFBEB" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group hover:scale-[1.02] hover:shadow-sm"
                style={{ background: "#F8FAFC" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#F8FAFC")}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: item.bg }}
                >
                  <item.icon size={14} color={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
                <ArrowRight
                  size={13}
                  className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

