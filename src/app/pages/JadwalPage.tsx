import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Link2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";

interface JadwalItem {
  id: number;
  jenis: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string | null;
  link_online: string | null;
  keterangan: string | null;
  nama_tahap: string;
  status_hadir: string;
}

const JENIS_LABEL: Record<string, string> = {
  tes_tertulis:   "Tes Tertulis",
  micro_teaching: "Micro Teaching",
  wawancara:      "Wawancara",
  tes_praktik:    "Tes Praktik",
};

const HADIR_UI = {
  terdaftar:    { label: "Terdaftar",   bg: "#EFF6FF", text: "#1D4ED8" },
  hadir:        { label: "Hadir",       bg: "#ECFDF5", text: "#065F46" },
  tidak_hadir:  { label: "Tidak Hadir", bg: "#FEF2F2", text: "#991B1B" },
  reschedule:   { label: "Reschedule",  bg: "#FFF7ED", text: "#92400E" },
};

function fmtTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(t: string) { return t ? t.slice(0, 5) : ""; }

function JadwalCard({ j }: { j: JadwalItem }) {
  const hadir = HADIR_UI[j.status_hadir as keyof typeof HADIR_UI] ?? HADIR_UI.terdaftar;

  return (
    <div className="rounded-2xl p-5 transition-all hover:shadow-md"
      style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)" }}>
          <Calendar size={20} color="#3B82F6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800">{JENIS_LABEL[j.jenis] || j.jenis}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>
              {j.nama_tahap}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium ml-auto" style={{ background: hadir.bg, color: hadir.text }}>
              {hadir.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            {fmtTgl(j.tanggal)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-600">
            <Clock size={14} className="text-slate-400" />
            {fmtTime(j.waktu_mulai)} – {fmtTime(j.waktu_selesai)} WIB
          </div>

          {j.lokasi && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
              <MapPin size={14} className="text-slate-400" /> {j.lokasi}
            </div>
          )}
          {j.link_online && (
            <div className="flex items-center gap-1.5 mt-1">
              <Link2 size={14} className="text-blue-400" />
              <a href={j.link_online} target="_blank" rel="noreferrer"
                className="text-sm text-blue-500 hover:underline">{j.link_online}</a>
            </div>
          )}
          {j.keterangan && (
            <p className="text-xs text-slate-400 mt-2 p-2.5 rounded-lg bg-slate-50">{j.keterangan}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function JadwalPage() {
  const [upcoming, setUpcoming] = useState<JadwalItem[]>([]);
  const [past, setPast] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ upcoming: JadwalItem[]; past: JadwalItem[] }>("/jadwal")
      .then((d) => { setUpcoming(d.upcoming); setPast(d.past); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const noData = upcoming.length === 0 && past.length === 0;

  return (
    <div className="max-w-[1440px] mx-auto px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Jadwal Interview</h1>
        <p className="text-sm text-slate-500 mt-1">Jadwal tes dan wawancara seleksimu</p>
      </div>

      {noData ? (
        <div className="py-20 text-center rounded-3xl"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <Calendar size={48} className="mx-auto mb-4 opacity-25 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-700">Belum Ada Jadwal</h2>
          <p className="text-sm text-slate-500 mt-1">Jadwal akan muncul setelah admin HRD menetapkannya.</p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-blue-600" style={{ background: "#EFF6FF" }}>
            <AlertCircle size={14} /> Pastikan berkas lamaran sudah lengkap dan terverifikasi
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h2 className="font-semibold text-slate-700">Jadwal Mendatang</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#ECFDF5", color: "#065F46" }}>
                  {upcoming.length}
                </span>
              </div>
              <div className="space-y-3">
                {upcoming.map((j) => <JadwalCard key={j.id} j={j} />)}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <h2 className="font-semibold text-slate-500">Riwayat Jadwal</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#F1F5F9", color: "#64748B" }}>
                  {past.length}
                </span>
              </div>
              <div className="space-y-3 opacity-70">
                {past.map((j) => <JadwalCard key={j.id} j={j} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
