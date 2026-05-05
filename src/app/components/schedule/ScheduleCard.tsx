import { Calendar, Clock, Bell, AlertTriangle, ChevronRight } from "lucide-react";
import type { Schedule } from "./scheduleData";

interface ScheduleCardProps {
  schedule: Schedule;
  onAddToCalendar: (type: string) => void;
}

export function ScheduleCard({ schedule: s, onAddToCalendar }: ScheduleCardProps) {
  const shadowColor = s.color === "#7C3AED" ? "124,58,237" : "37,99,235";

  return (
    <div
      className="rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: s.urgent ? "1.5px solid #C4B5FD" : "1px solid rgba(147,197,253,0.28)",
        boxShadow: s.urgent
          ? "0 8px 32px rgba(124,58,237,0.12)"
          : "0 4px 24px rgba(59,130,246,0.08)",
      }}
    >
      {/* Top gradient bar */}
      <div className="h-1.5 w-full" style={{ background: s.bg }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Date badge */}
          <div
            className="rounded-2xl p-3 text-center flex-shrink-0 min-w-[60px] transition-transform duration-300 group-hover:scale-105"
            style={{
              background: s.bg,
              boxShadow: `0 4px 16px rgba(${shadowColor},0.30)`,
            }}
          >
            <p className="text-white/70 font-medium" style={{ fontSize: "0.6rem", letterSpacing: "0.06em" }}>
              {s.day}
            </p>
            <p className="text-white font-bold" style={{ fontSize: "1.35rem", lineHeight: "1.2" }}>
              {s.dateShort.split(" ")[0]}
            </p>
            <p className="text-white/70" style={{ fontSize: "0.65rem" }}>
              {s.dateShort.split(" ")[1]}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-slate-800 font-semibold text-[0.9375rem]">{s.type}</h3>

                {/* Tag badge */}
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
                  style={{
                    background: s.tagBg,
                    color: s.tagColor,
                    borderColor: s.tagColor + "33",
                  }}
                >
                  {s.tag}
                </span>

                {/* BARU badge */}
                {s.isNew && (
                  <span
                    className="text-white px-1.5 py-0.5 rounded-md font-bold animate-pulse"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                      fontSize: "0.52rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    BARU
                  </span>
                )}
              </div>

              {/* Days left pill */}
              {s.urgent && (
                <span
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "#FEF9C3", color: "#92400E", border: "1px solid #FDE68A" }}
                >
                  <Bell size={10} />
                  {s.daysLeft} hari lagi
                </span>
              )}
            </div>

            {/* Info rows */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar size={12} color="#94A3B8" className="flex-shrink-0" />
                <span>{s.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={12} color="#94A3B8" className="flex-shrink-0" />
                <span>{s.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <s.modeIcon size={12} color="#94A3B8" className="flex-shrink-0" />
                <span>{s.location}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{ background: "#F1F5F9", color: "#64748B" }}
                >
                  {s.mode}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div
              className="mt-3 p-2.5 rounded-xl flex items-start gap-2"
              style={{ background: "#FFFBEB", border: "1px solid #FDE68A40" }}
            >
              <AlertTriangle size={12} color="#F59E0B" className="mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">{s.notes}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #F1F5F9" }}>
          <button
            onClick={() => onAddToCalendar(s.type)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
            style={{ background: s.bg, color: "white" }}
          >
            Tambah ke Kalender
          </button>
          <button
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-200 flex items-center gap-1"
            style={{ background: "#F1F5F9", color: "#64748B" }}
          >
            Detail <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
