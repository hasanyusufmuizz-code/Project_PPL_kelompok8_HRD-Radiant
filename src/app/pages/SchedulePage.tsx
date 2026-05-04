import { CheckCircle, CalendarX } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ScheduleCard } from "../components/schedule/ScheduleCard";
import { CalendarWidget } from "../components/schedule/CalendarWidget";
import { ActiveReminders } from "../components/schedule/ActiveReminders";
import { UpcomingAlert } from "../components/schedule/UpcomingAlert";
import { EmptyState } from "../components/EmptyState";
import { upcomingSchedules, pastSchedules } from "../components/schedule/scheduleData";
import { useState } from "react";

type TabType = "upcoming" | "past";

export function SchedulePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  const handleAddToCalendar = (type: string) => {
    toast.success(`"${type}" berhasil ditambahkan ke kalender!`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1
            className="text-slate-800 font-bold mb-1"
            style={{ fontSize: "1.5rem" }}
          >
            Jadwal &amp; Notifikasi
          </h1>
          <p className="text-sm text-slate-500">Kelola jadwal tes dan wawancara kamu</p>
        </div>

        <UpcomingAlert
          title="Jadwal Mendekati!"
          message="Micro Teaching dalam 9 hari"
        />
      </div>

      {/* ── Tab Switcher ── */}
      <div
        className="flex gap-1 p-1 rounded-2xl w-fit mb-6"
        style={{ background: "#F1F5F9" }}
      >
        {(["upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            style={
              activeTab === tab
                ? { boxShadow: "0 1px 6px rgba(59,130,246,0.12)" }
                : {}
            }
          >
            {tab === "upcoming" ? "Akan Datang" : "Riwayat"}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "upcoming" ? (
        upcomingSchedules.length === 0 ? (
          /* Empty state */
          <div
            className="rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
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
        ) : (
          /* Upcoming: cards + sidebar */
          <div className="grid grid-cols-3 gap-6">
            {/* ── Schedule Cards Column ── */}
            <div className="col-span-2 space-y-4">
              {upcomingSchedules.map((sched) => (
                <ScheduleCard
                  key={sched.id}
                  schedule={sched}
                  onAddToCalendar={handleAddToCalendar}
                />
              ))}
            </div>

            {/* ── Sidebar: Calendar + Reminders ── */}
            <div className="space-y-4">
              <CalendarWidget />
              <ActiveReminders />
            </div>
          </div>
        )
      ) : (
        /* ── Past Schedules Tab ── */
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
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.82)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(147,197,253,0.22)",
                    boxShadow: "0 2px 12px rgba(59,130,246,0.06)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#ECFDF5" }}
                  >
                    <CheckCircle size={17} color="#10B981" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{sched.type}</p>
                    <p className="text-xs text-slate-400">
                      {sched.date} &bull; {sched.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
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
