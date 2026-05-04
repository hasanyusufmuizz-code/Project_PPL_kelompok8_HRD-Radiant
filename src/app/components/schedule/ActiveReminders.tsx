import { useState } from "react";
import { Bell } from "lucide-react";

interface Reminder {
  id: string;
  label: string;
  defaultActive: boolean;
}

const reminderList: Reminder[] = [
  { id: "h1", label: "H-1 sebelum jadwal", defaultActive: true },
  { id: "h3", label: "H-3 sebelum jadwal", defaultActive: true },
  { id: "morning", label: "Pagi hari jadwal", defaultActive: false },
];

export function ActiveReminders() {
  const [reminders, setReminders] = useState<Record<string, boolean>>(
    Object.fromEntries(reminderList.map((r) => [r.id, r.defaultActive]))
  );

  const toggle = (id: string) =>
    setReminders((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(147,197,253,0.25)",
        boxShadow: "0 4px 24px rgba(59,130,246,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
        >
          <Bell size={13} color="white" />
        </div>
        <h3 className="text-slate-700 font-semibold text-sm">Pengingat Aktif</h3>
      </div>

      {/* Reminder rows */}
      <div className="space-y-3">
        {reminderList.map((r) => {
          const isActive = reminders[r.id];
          return (
            <div key={r.id} className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{r.label}</span>

              {/* Toggle switch */}
              <button
                role="switch"
                aria-checked={isActive}
                aria-label={r.label}
                onClick={() => toggle(r.id)}
                className="relative w-9 h-5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                    : "#E2E8F0",
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300"
                  style={{
                    left: isActive ? "calc(100% - 18px)" : "2px",
                    boxShadow: isActive
                      ? "0 2px 6px rgba(37,99,235,0.35)"
                      : "0 1px 4px rgba(0,0,0,0.12)",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
        Pengingat dikirim via notifikasi & email terdaftar.
      </p>
    </div>
  );
}
