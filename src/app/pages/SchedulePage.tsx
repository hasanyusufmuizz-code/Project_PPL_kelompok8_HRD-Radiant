import { useState, useEffect } from "react";
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
import { api } from "../../lib/api";

interface JadwalItem {
  id: number;
  jenis: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string | null;
  mode: string | null;
  catatan_peserta: string | null;
  nama_tahap: string;
  status_hadir: string;
}

interface JadwalData {
  upcoming: JadwalItem[];
  past: JadwalItem[];
}

const JENIS_COLORS: Record<string, { color: string; bg: string; tag: string }> = {
  tes_tertulis:   { color: "#2563EB", bg: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", tag: "Tes Tulis" },
  micro_teaching: { color: "#7C3AED", bg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)", tag: "Praktek" },
  wawancara:      { color: "#0891B2", bg: "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)", tag: "Interview" },
  tes_praktik:    { color: "#D97706", bg: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)", tag: "Praktik" },
};

function formatTanggal(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatTime(t: string) {
  return t ? t.slice(0, 5).replace(":", ".") : "";
}
function getDaysLeft(tanggal: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(tanggal); target.setHours(0,0,0,0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function SchedulePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [jadwalData, setJadwalData] = useState<JadwalData>({ upcoming: [], past: [] });

  useEffect(() => {
    api.get<JadwalData>("/jadwal")
      .then((d) => setJadwalData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCalendar = (type: string) => {
    toast.success(`"${type}" berhasil ditambahkan ke kalender!`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const upcoming = jadwalData.upcoming;
  const past = jadwalData.past;
  const nextJadwal = upcoming[0] ?? null;

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>Jadwal & Notifikasi</h1>
          <p className="text-sm text-slate-500">Kelola jadwal tes dan wawancara kamu</p>
        </div>
        {nextJadwal && getDaysLeft(nextJadwal.tanggal) <= 7 && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl" style={{ background: "#FEF9C3", border: "1px solid #FDE047" }}>
            <AlertTriangle size={15} color="#D97706" />
            <div>
              <p className="text-xs font-medium text-amber-700">Jadwal Mendekati!</p>
              <p className="text-xs text-amber-600">{nextJadwal.nama_tahap} dalam {getDaysLeft(nextJadwal.tanggal)} hari</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit mb-6" style={{ background: "#F1F5F9" }}>
        {(["upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab === "upcoming" ? "Akan Datang" : "Riwayat"}
          </button>
        ))}
      </div>

      {activeTab === "upcoming" ? (
        upcoming.length === 0 ? (
          <div className="rounded-3xl" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
            <EmptyState
              icon={<CalendarX size={36} />}
              title="Tidak Ada Jadwal Mendatang"
              description="Belum ada jadwal tes atau wawancara yang dijadwalkan. Pantau terus statusmu agar tidak melewatkan undangan."
              actionLabel="Lihat Status Lamaran"
              onAction={() => navigate("/status")}
            />
          </div>
        ) : (
          <div className="col-span-2 space-y-4">
            {upcoming.map((sched) => {
              const c = JENIS_COLORS[sched.jenis] ?? JENIS_COLORS.tes_tertulis;
              const daysLeft = getDaysLeft(sched.tanggal);
              const tgl = new Date(sched.tanggal);
              const dayNames = ["MIN","SEN","SEL","RAB","KAM","JUM","SAB"];
              return (
                <div
                  key={sched.id}
                  className="rounded-3xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}
                >
                  <div className="h-1.5 w-full" style={{ background: c.bg }} />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl p-3 text-center flex-shrink-0 min-w-[60px]" style={{ background: c.bg, boxShadow: `0 4px 16px rgba(0,0,0,0.15)` }}>
                        <p className="text-white/70" style={{ fontSize: "0.6rem" }}>{dayNames[tgl.getDay()]}</p>
                        <p className="text-white font-semibold" style={{ fontSize: "1.25rem", lineHeight: "1.2" }}>{tgl.getDate()}</p>
                        <p className="text-white/70" style={{ fontSize: "0.65rem" }}>{tgl.toLocaleDateString("id-ID",{month:"short"})}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-slate-700">{sched.nama_tahap}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: c.color }}>{c.tag}</span>
                          </div>
                          {daysLeft <= 7 && daysLeft >= 0 && (
                            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "#FEF9C3", color: "#92400E" }}>
                              <Bell size={10} />
                              {daysLeft === 0 ? "Hari ini!" : `${daysLeft} hari lagi`}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500"><Calendar size={12} color="#94A3B8" /><span>{formatTanggal(sched.tanggal)}</span></div>
                          <div className="flex items-center gap-2 text-xs text-slate-500"><Clock size={12} color="#94A3B8" /><span>{formatTime(sched.waktu_mulai)} – {formatTime(sched.waktu_selesai)} WIB</span></div>
                          {sched.lokasi && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {sched.mode === "daring" ? <Video size={12} color="#94A3B8" /> : <MapPin size={12} color="#94A3B8" />}
                              <span>{sched.lokasi}</span>
                              {sched.mode && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "#F1F5F9", color: "#64748B" }}>{sched.mode}</span>}
                            </div>
                          )}
                        </div>
                        {sched.catatan_peserta && (
                          <div className="mt-3 p-2.5 rounded-xl flex items-start gap-2" style={{ background: "#F8FAFC" }}>
                            <AlertTriangle size={12} color="#F59E0B" className="mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-500">{sched.catatan_peserta}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #F1F5F9" }}>
                      <button onClick={() => handleAddToCalendar(sched.nama_tahap)} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 hover:shadow-md" style={{ background: c.bg, color: "white" }}>
                        Tambah ke Kalender
                      </button>
                      <button className="px-4 py-2 rounded-xl text-sm transition-all hover:bg-slate-100 flex items-center gap-1" style={{ background: "#F1F5F9", color: "#64748B" }}>
                        Detail <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="max-w-2xl">
          {past.length === 0 ? (
            <div className="rounded-3xl" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)" }}>
              <EmptyState icon={<CalendarX size={32} />} title="Belum Ada Riwayat" description="Riwayat jadwal tes dan wawancara yang sudah selesai akan tampil di sini." />
            </div>
          ) : (
            <div className="space-y-3">
              {past.map((sched) => (
                <div key={sched.id} className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:shadow-sm" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(147,197,253,0.2)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#ECFDF5" }}>
                    <CheckCircle size={17} color="#10B981" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{sched.nama_tahap}</p>
                    <p className="text-xs text-slate-400">{formatTanggal(sched.tanggal)} • {formatTime(sched.waktu_mulai)} – {formatTime(sched.waktu_selesai)} WIB</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#ECFDF5", color: "#065F46" }}>
                    {sched.status_hadir === "hadir" ? "Hadir" : sched.status_hadir}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
