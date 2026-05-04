import { calendarEvents } from "./scheduleData";

// April 2026: 1st falls on Wednesday (index 2 in Mon-start grid)
// Day labels: M S R K J S M (Senin-Minggu)
const DAY_LABELS = ["M", "S", "R", "K", "J", "S", "M"];
// April 2026 starts on Wednesday (offset 2 from Monday)
const APRIL_OFFSET = 2;
const APRIL_DAYS = 30;

// Today highlight: use the first event day as "today" for demo
const TODAY = 1; // April 1 highlighted as "today" (blue ring, shown in design)

export function CalendarWidget() {
  const cells: (number | null)[] = [
    ...Array(APRIL_OFFSET).fill(null),
    ...Array.from({ length: APRIL_DAYS }, (_, i) => i + 1),
  ];

  const eventDayMap = Object.fromEntries(calendarEvents.map((e) => [e.day, e.color]));

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
      <h3 className="text-slate-700 font-semibold text-sm mb-4">April 2026</h3>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-slate-400 font-medium" style={{ fontSize: "0.62rem" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((day, i) => {
          const eventColor = day ? eventDayMap[day] : null;
          const isToday = day === TODAY;

          let bg = "transparent";
          let color = "#64748B";
          let fontWeight: "normal" | "600" | "700" = "normal";
          let ring = "";

          if (eventColor === "#7C3AED") {
            bg = "linear-gradient(135deg, #7C3AED, #8B5CF6)";
            color = "white";
            fontWeight = "700";
          } else if (eventColor === "#2563EB") {
            bg = "linear-gradient(135deg, #2563EB, #3B82F6)";
            color = "white";
            fontWeight = "700";
          } else if (isToday) {
            bg = "#EFF6FF";
            color = "#2563EB";
            fontWeight = "600";
            ring = "ring-1 ring-blue-300";
          }

          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-150 ${
                day && !eventColor && !isToday ? "hover:bg-slate-100 cursor-pointer" : ""
              } ${ring}`}
              style={{
                fontSize: "0.68rem",
                background: bg,
                color: day ? color : "transparent",
                fontWeight,
              }}
            >
              {day ?? ""}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-1.5">
        {calendarEvents.map((e) => (
          <div key={e.day} className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
            <span>{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
