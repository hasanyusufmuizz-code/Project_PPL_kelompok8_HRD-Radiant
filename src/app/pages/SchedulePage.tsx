import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Bell,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  CalendarX,
} from "lucide-react";
import { useNavigate } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { toast } from "sonner";

const schedules = [
  {
    id: 1,
    type: "Micro Teaching",
    tag: "Praktek",
    tagColor: "#7C3AED",
    tagBg: "#F5F3FF",
    date: "Kamis, 10 April 2026",
    dateShort: "10 Apr",
    day: "KAM",
    time: "09.00 – 11.00 WIB",
    location: "Ruang A-201, Gedung Utama",
    mode: "Luring",
    modeIcon: MapPin,
    urgent: true,
    daysLeft: 9,
    notes: "Hadir 15 menit sebelumnya. Bawa RPP dan perangkat ajar.",
    color: "#7C3AED",
    bg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
    isNew: true,
  },
  {
    id: 2,
    type: "Wawancara HR",
    tag: "Interview",
    tagColor: "#2563EB",
    tagBg: "#EFF6FF",
    date: "Senin, 21 April 2026",
    dateShort: "21 Apr",
    day: "SEN",
    time: "13.00 – 14.00 WIB",
    location: "Via Zoom Meeting",
    mode: "Daring",
    modeIcon: Video,
    urgent: false,
    daysLeft: 20,
    notes: "Link meeting akan dikirim melalui email 1 hari sebelumnya.",
    color: "#2563EB",
    bg: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
    isNew: false,
  },
];

const pastSchedules = [
  {
    id: 3,
    type: "Tes Tulis CBT",
    date: "22 Maret 2026",
    time: "08.00 – 10.00 WIB",
    status: "Selesai",
    result: "Lulus",
  },
  {
    id: 4,
    type: "Registrasi Online",
    date: "15 Maret 2026",
    time: "– (Deadline)",
    status: "Selesai",
    result: "Diterima",
  },
];

export function SchedulePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showEmpty] = useState(false); // Set to `true` to preview empty state

  const handleAddToCalendar = (type: string) => {
    toast.success(`"${type}" berhasil ditambahkan ke kalender!`);
  };

  const renderUpcoming = () => {
    if (showEmpty || schedules.length === 0) {
      return (
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
            icon={<CalendarX size={36} />}
            title="Tidak Ada Jadwal Mendatang"
            description="Belum ada jadwal tes atau wawancara yang dijadwalkan. Pantau terus statusmu agar tidak melewatkan undangan."
            actionLabel="Lihat Status Lamaran"
            onAction={() => navigate("/status")}
            secondaryActionLabel="Kembali ke Dashboard"
            onSecondaryAction={() => navigate("/dashboard")}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-6">
        {/* Schedule Cards */}
        <div className="col-span-2 space-y-4">
          {schedules.map((sched) => (
            <div
              key={sched.id}
              className="rounded-3xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                border: sched.urgent ? "1.5px solid #C4B5FD" : "1px solid rgba(147,197,253,0.25)",
                boxShadow: sched.urgent
                  ? "0 8px 32px rgba(124,58,237,0.12)"
                  : "0 4px 24px rgba(59,130,246,0.07)",
              }}
            >
              {/* Top color bar */}
              <div className="h-1.5 w-full" style={{ background: sched.bg }} />

              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div
                    className="rounded-2xl p-3 text-center flex-shrink-0 min-w-[60px]"
                    style={{
                      background: sched.bg,
                      boxShadow: `0 4px 16px rgba(${sched.color === "#7C3AED" ? "124,58,237" : "37,99,235"},0.25)`,
                    }}
                  >
                    <p className="text-white/70" style={{ fontSize: "0.6rem" }}>
                      {sched.day}
                    </p>
                    <p className="text-white font-semibold" style={{ fontSize: "1.25rem", lineHeight: "1.2" }}>
                      {sched.dateShort.split(" ")[0]}
                    </p>
                    <p className="text-white/70" style={{ fontSize: "0.65rem" }}>
                      {sched.dateShort.split(" ")[1]}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-slate-700">{sched.type}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: sched.tagBg, color: sched.tagColor }}
                        >
                          {sched.tag}
                        </span>
                        {sched.isNew && (
                          <span
                            className="text-white px-1.5 py-0.5 rounded-md"
                            style={{ background: "#3B82F6", fontSize: "0.55rem", letterSpacing: "0.04em" }}
                          >
                            BARU
                          </span>
                        )}
                      </div>
                      {sched.urgent && (
                        <span
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{ background: "#FEF9C3", color: "#92400E" }}
                        >
                          <Bell size={10} />
                          {sched.daysLeft} hari lagi
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} color="#94A3B8" />
                        <span>{sched.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={12} color="#94A3B8" />
                        <span>{sched.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <sched.modeIcon size={12} color="#94A3B8" />
                        <span>{sched.location}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background: "#F1F5F9", color: "#64748B" }}
                        >
                          {sched.mode}
                        </span>
                      </div>
                    </div>

                    <div
                      className="mt-3 p-2.5 rounded-xl flex items-start gap-2"
                      style={{ background: "#F8FAFC" }}
                    >
                      <AlertTriangle size={12} color="#F59E0B" className="mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-500">{sched.notes}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #F1F5F9" }}>
                  <button
                    onClick={() => handleAddToCalendar(sched.type)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 hover:shadow-md"
                    style={{ background: sched.bg, color: "white" }}
                  >
                    Tambah ke Kalender
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl text-sm transition-all hover:bg-slate-100 flex items-center gap-1"
                    style={{ background: "#F1F5F9", color: "#64748B" }}
                  >
                    Detail <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar mini + reminder */}
        <div className="space-y-4">
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
              boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
            }}
          >
            <h3 className="text-slate-700 mb-4">April 2026</h3>

            {/* Simple calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["M", "S", "R", "K", "J", "S", "M"].map((d, i) => (
                <div key={i} className="text-slate-400" style={{ fontSize: "0.65rem" }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["", "", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(
                (day, i) => (
                  <div
                    key={i}
                    className="aspect-square flex items-center justify-center rounded-lg transition-all"
                    style={{
                      fontSize: "0.7rem",
                      background:
                        day === 10
                          ? "linear-gradient(135deg, #7C3AED, #8B5CF6)"
                          : day === 21
                          ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                          : day === 1
                          ? "#EFF6FF"
                          : "transparent",
                      color:
                        day === 10 || day === 21
                          ? "white"
                          : day === 1
                          ? "#2563EB"
                          : day
                          ? "#64748B"
                          : "transparent",
                      fontWeight: day === 10 || day === 21 || day === 1 ? "600" : "normal",
                    }}
                  >
                    {day || ""}
                  </div>
                )
              )}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span>10 Apr – Micro Teaching</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>21 Apr – Wawancara HR</span>
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
              boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
            }}
          >
            <h3 className="text-slate-700 mb-3">Pengingat Aktif</h3>
            <div className="space-y-2.5">
              {[
                { label: "H-1 sebelum jadwal", active: true },
                { label: "H-3 sebelum jadwal", active: true },
                { label: "Pagi hari jadwal", active: false },
              ].map((reminder) => (
                <div key={reminder.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{reminder.label}</span>
                  <div
                    className="w-8 h-4 rounded-full transition-all cursor-pointer"
                    style={{
                      background: reminder.active
                        ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                        : "#E2E8F0",
                    }}
                  >
                    <div
                      className="w-3 h-3 bg-white rounded-full shadow-sm m-0.5 transition-all"
                      style={{ marginLeft: reminder.active ? "auto" : "2px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>
            Jadwal & Notifikasi
          </h1>
          <p className="text-sm text-slate-500">Kelola jadwal tes dan wawancara kamu</p>
        </div>

        {/* Alert */}
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
          style={{ background: "#FEF9C3", border: "1px solid #FDE047" }}
        >
          <AlertTriangle size={15} color="#D97706" />
          <div>
            <p className="text-xs font-medium text-amber-700">Jadwal Mendekati!</p>
            <p className="text-xs text-amber-600">Micro Teaching dalam 9 hari</p>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div
        className="flex gap-1 p-1 rounded-2xl w-fit mb-6"
        style={{ background: "#F1F5F9" }}
      >
        {(["upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "upcoming" ? "Akan Datang" : "Riwayat"}
          </button>
        ))}
      </div>

      {activeTab === "upcoming" ? (
        renderUpcoming()
      ) : (
        /* Past Schedules */
        <div className="max-w-2xl">
          {pastSchedules.length === 0 ? (
            <div
              className="rounded-3xl"
              style={{
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(147,197,253,0.25)",
              }}
            >
              <EmptyState
                icon={<CalendarX size={32} />}
                title="Belum Ada Riwayat"
                description="Riwayat jadwal tes dan wawancara yang sudah selesai akan tampil di sini."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {pastSchedules.map((sched) => (
                <div
                  key={sched.id}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:shadow-sm"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(147,197,253,0.2)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#ECFDF5" }}
                  >
                    <CheckCircle size={17} color="#10B981" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{sched.type}</p>
                    <p className="text-xs text-slate-400">
                      {sched.date} • {sched.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "#ECFDF5", color: "#065F46" }}
                    >
                      {sched.result}
                    </span>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "#F1F5F9", color: "#64748B" }}
                    >
                      {sched.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
