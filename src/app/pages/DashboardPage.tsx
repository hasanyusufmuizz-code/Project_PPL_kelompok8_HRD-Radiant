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

const steps = [
  { id: 1, label: "Daftar", sublabel: "Administrasi", done: true, active: false },
  { id: 2, label: "Tes Tulis", sublabel: "CBT Online", done: true, active: false },
  { id: 3, label: "Micro Teaching", sublabel: "Praktek", done: false, active: true },
  { id: 4, label: "Interview", sublabel: "HR & User", done: false, active: false },
  { id: 5, label: "Final", sublabel: "Keputusan", done: false, active: false },
];

const notifications = [
  {
    id: 1,
    icon: Calendar,
    color: "#3B82F6",
    bg: "#EFF6FF",
    title: "Jadwal Micro Teaching",
    desc: "Kamis, 10 April 2026 • 09.00 WIB • Ruang A-201",
    time: "2 jam lalu",
    urgent: true,
    isNew: true,
  },
  {
    id: 2,
    icon: CheckCircle,
    color: "#10B981",
    bg: "#ECFDF5",
    title: "Tes Tulis Selesai",
    desc: "Kamu berhasil menyelesaikan tes tulis dengan nilai 8.2",
    time: "2 hari lalu",
    urgent: false,
    isNew: false,
  },
  {
    id: 3,
    icon: FileText,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    title: "Dokumen Diverifikasi",
    desc: "CV dan transkrip nilai kamu telah diverifikasi oleh tim HRD",
    time: "4 hari lalu",
    urgent: false,
    isNew: false,
  },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1440px] mx-auto px-6 space-y-6">
      {/* Header Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>
            Halo, Daffa 👋
          </h1>
          <p className="text-sm text-slate-500">
            Rabu, 1 April 2026 • Pantau progress lamaran kamu di sini
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ background: "#FEF9C3", border: "1px solid #FDE047", color: "#92400E" }}
        >
          <Star size={14} fill="#FBBF24" color="#FBBF24" />
          <span>Tahap Aktif: Micro Teaching</span>
        </div>
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
            <div className="flex items-center gap-1.5 mt-0.5">
              <RefreshCw size={10} className="text-slate-400" />
              <span className="text-slate-400" style={{ fontSize: "0.7rem" }}>
                Diperbarui 5 menit lalu
              </span>
            </div>
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: "#EFF6FF", color: "#2563EB" }}
          >
            Tahap 3 dari 5
          </span>
        </div>

        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div
            className="absolute top-5 left-0 right-0 h-0.5 z-0"
            style={{ background: "#E2E8F0" }}
          />
          {/* Progress line */}
          <div
            className="absolute top-5 left-0 h-0.5 z-0"
            style={{
              background: "linear-gradient(90deg, #2563EB, #3B82F6)",
              width: "40%",
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: step.done
                    ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                    : step.active
                    ? "white"
                    : "#F1F5F9",
                  border: step.active ? "2px solid #3B82F6" : "none",
                  boxShadow: step.active
                    ? "0 0 0 5px rgba(59,130,246,0.15), 0 4px 12px rgba(37,99,235,0.25)"
                    : step.done
                    ? "0 4px 12px rgba(37,99,235,0.28)"
                    : "none",
                }}
              >
                {step.done ? (
                  <CheckCircle size={18} color="white" />
                ) : step.active ? (
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                ) : (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "#CBD5E1" }}
                  />
                )}
              </div>
              <div className="text-center">
                <p
                  className="text-xs font-medium"
                  style={{ color: step.done || step.active ? "#1E40AF" : "#94A3B8" }}
                >
                  {step.label}
                </p>
                <p className="text-xs" style={{ color: "#94A3B8", fontSize: "0.65rem" }}>
                  {step.sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
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
              <span
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                Aktif
              </span>
            </div>
            <p className="text-blue-100 text-xs mb-1">Status Saat Ini</p>
            <h3 className="text-white text-base">Micro Teaching</h3>
            <p className="text-blue-200 text-xs mt-1">Persiapkan materi terbaik kamu</p>
            <button
              onClick={() => navigate("/status")}
              className="mt-4 flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors group"
            >
              Lihat Tahapan Seleksi{" "}
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
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#EFF6FF" }}
            >
              <Calendar size={17} color="#3B82F6" />
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: "#FEF9C3", color: "#92400E" }}
            >
              Besok
            </span>
          </div>
          <p className="text-slate-400 text-xs mb-1">Jadwal Berikutnya</p>
          <h3 className="text-slate-700">Micro Teaching</h3>
          <p className="text-slate-500 text-xs mt-1">Kamis, 10 April 2026</p>
          <div
            className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg w-fit"
            style={{ background: "#F0FDF4" }}
          >
            <Clock size={11} color="#10B981" />
            <span className="text-xs text-green-600">09.00 – 11.00 WIB</span>
          </div>
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
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#ECFDF5" }}
            >
              <Award size={17} color="#10B981" />
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
              style={{ background: "#ECFDF5", color: "#065F46" }}
            >
              <CheckCircle size={10} />
              Lulus
            </span>
          </div>
          <p className="text-slate-400 text-xs mb-1">Hasil Terakhir</p>
          <h3 className="text-slate-700">Tes Tulis</h3>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-green-600 font-semibold" style={{ fontSize: "1.5rem" }}>8.2</span>
            <span className="text-slate-400 text-xs">/ 10.0</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "82%",
                background: "linear-gradient(90deg, #10B981, #34D399)",
                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
          <button
            onClick={() => navigate("/hasil")}
            className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors group"
          >
            Lihat Detail Nilai{" "}
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Notifications + Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {/* Notifications Panel */}
        <div
          className="col-span-2 rounded-3xl p-6 transition-all duration-200 hover:shadow-lg"
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
              <span
                className="w-5 h-5 rounded-full text-white flex items-center justify-center"
                style={{ background: "#EF4444", fontSize: "0.625rem" }}
              >
                2
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <RefreshCw size={10} className="text-slate-400" />
                <span className="text-slate-400" style={{ fontSize: "0.68rem" }}>
                  Baru saja
                </span>
              </div>
              <button className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
                Lihat semua
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl transition-all hover:scale-[1.005] hover:shadow-sm cursor-pointer"
                style={{
                  background: notif.urgent ? "#EFF6FF" : "#F8FAFC",
                  border: notif.urgent ? "1px solid #BFDBFE" : "1px solid transparent",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: notif.bg }}
                >
                  <notif.icon size={16} color={notif.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{notif.title}</p>
                      {notif.isNew && (
                        <span
                          className="flex-shrink-0 text-white px-1.5 py-0.5 rounded-md"
                          style={{ background: "#3B82F6", fontSize: "0.55rem", letterSpacing: "0.04em" }}
                        >
                          BARU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.desc}</p>
                </div>
                {notif.urgent && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1 animate-pulse" />
                )}
              </div>
            ))}
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
              { icon: FileText, label: "Status Lamaran", sub: "Cek tahapan seleksi", path: "/status", color: "#3B82F6", bg: "#EFF6FF" },
              { icon: BarChart2, label: "Hasil Tes", sub: "Lihat skor & nilai", path: "/hasil", color: "#10B981", bg: "#ECFDF5" },
              { icon: Bell, label: "Jadwal Saya", sub: "Cek jadwal tes", path: "/jadwal", color: "#8B5CF6", bg: "#F5F3FF" },
              { icon: BookOpen, label: "Onboarding", sub: "Materi & dokumen", path: "/onboarding", color: "#F59E0B", bg: "#FFFBEB" },
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
