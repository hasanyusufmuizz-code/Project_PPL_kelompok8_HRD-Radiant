import { useState, useEffect } from "react";
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
import { api } from "../../lib/api";

interface TahapItem {
  id: number;
  nama: string;
  urutan: number;
  deskripsi: string | null;
  status: "menunggu" | "lulus" | "tidak_lulus" | "proses";
  nilai: number | null;
  catatan: string | null;
  dinilai_pada: string | null;
  tanggal: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  lokasi: string | null;
  mode: string | null;
}

interface StatusData {
  lamaran: { id: number; status: string; tanggal_daftar: string; posisi: string } | null;
  tahapan: TahapItem[];
}

const TAHAP_ICONS = [FileText, Monitor, Users, MessageSquare, Award];

const TAHAP_DEFAULT_DESC: Record<string, string> = {
  "Pendaftaran & Administrasi": "Verifikasi kelengkapan berkas lamaran oleh tim HRD.",
  "Tes Tulis (CBT)": "Tes kemampuan akademik dan pedagogik secara online.",
  "Micro Teaching": "Demonstrasi mengajar di depan panel penilai.",
  "Wawancara HR & User": "Sesi wawancara dengan tim HR dan calon atasan.",
  "Keputusan Final": "Pengumuman hasil seleksi akhir.",
};

function getBadge(status: string, nilai: number | null) {
  if (status === "lulus") return nilai ? `Lulus • ${nilai}` : "Lulus";
  if (status === "tidak_lulus") return "Tidak Lulus";
  if (status === "proses") return "Sedang Dinilai";
  return "Menunggu";
}

function getBadgeStyle(status: string) {
  if (status === "lulus") return { color: "#065F46", bg: "#ECFDF5" };
  if (status === "tidak_lulus") return { color: "#991B1B", bg: "#FEF2F2" };
  if (status === "proses") return { color: "#1E40AF", bg: "#EFF6FF" };
  return { color: "#64748B", bg: "#F8FAFC" };
}

function formatTanggal(d: string | null) {
  if (!d) return "Belum ditentukan";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
function formatTime(t: string | null) {
  return t ? t.slice(0, 5).replace(":", ".") : "";
}


export function StatusPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<StatusData | null>(null);

  useEffect(() => {
    api.get<StatusData>("/status")
      .then((d) => setStatusData(d))
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

  const lamaran = statusData?.lamaran;
  const tahapan = statusData?.tahapan ?? [];

  if (!lamaran) {
    return (
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>Status Lamaran</h1>
          <p className="text-sm text-slate-500">Riwayat dan perkembangan tahapan seleksimu</p>
        </div>
        <div className="rounded-3xl" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
          <EmptyState
            icon={<Search size={36} />}
            title="Belum Ada Lamaran"
            description="Kamu belum memiliki lamaran aktif. Data status seleksi akan tampil di sini setelah kamu mendaftar."
            actionLabel="Kembali ke Dashboard"
            onAction={() => navigate("/dashboard")}
          />
        </div>
      </div>
    );
  }

  const doneCount = tahapan.filter((t) => t.status === "lulus").length;
  const activeCount = tahapan.filter((t) => t.status === "proses").length;
  const waitCount = tahapan.filter((t) => t.status === "menunggu").length;
  const totalDone = doneCount + activeCount;
  const progressPct = tahapan.length > 0 ? Math.round((doneCount / tahapan.length) * 100) : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="mb-6">
        <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>Status Lamaran</h1>
        <p className="text-sm text-slate-500">Riwayat dan perkembangan tahapan seleksimu</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="col-span-2 space-y-0">
          {tahapan.map((item, index) => {
            const Icon = TAHAP_ICONS[index] ?? FileText;
            const badge = getBadge(item.status, item.nilai);
            const badgeStyle = getBadgeStyle(item.status);
            const isSelesai = item.status === "lulus" || item.status === "tidak_lulus";
            const isAktif = item.status === "proses";
            const isMenunggu = item.status === "menunggu";

            const details: string[] = [];
            if (item.nilai) details.push(`Nilai: ${item.nilai} / 10`);
            if (item.tanggal) details.push(formatTanggal(item.tanggal));
            if (item.waktu_mulai && item.waktu_selesai) details.push(`${formatTime(item.waktu_mulai)} – ${formatTime(item.waktu_selesai)} WIB`);
            if (item.lokasi) details.push(item.lokasi);
            if (item.mode) details.push(item.mode);
            if (details.length === 0) details.push(isMenunggu ? "Belum ditentukan" : "Lihat detail");

            return (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all"
                    style={{
                      background: isSelesai
                        ? item.status === "lulus"
                          ? "linear-gradient(135deg, #059669, #10B981)"
                          : "linear-gradient(135deg, #DC2626, #EF4444)"
                        : isAktif
                        ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                        : "#F1F5F9",
                      border: isMenunggu ? "2px solid #E2E8F0" : "none",
                      boxShadow: isAktif
                        ? "0 0 0 5px rgba(59,130,246,0.15), 0 4px 12px rgba(37,99,235,0.3)"
                        : isSelesai
                        ? "0 4px 12px rgba(16,185,129,0.25)"
                        : "none",
                    }}
                  >
                    {isSelesai ? (
                      item.status === "lulus" ? <CheckCircle size={18} color="white" /> : <AlertCircle size={18} color="white" />
                    ) : isAktif ? (
                      <Icon size={17} color="white" />
                    ) : (
                      <Circle size={17} color="#CBD5E1" />
                    )}
                  </div>
                  {index < tahapan.length - 1 && (
                    <div
                      className="w-0.5 flex-1 mt-2 mb-2"
                      style={{
                        background: isSelesai
                          ? "linear-gradient(180deg, #10B981, #D1FAE5)"
                          : isAktif
                          ? "linear-gradient(180deg, #3B82F6, #E2E8F0)"
                          : "#E2E8F0",
                        minHeight: "40px",
                      }}
                    />
                  )}
                </div>

                <div className={`flex-1 ${index === tahapan.length - 1 ? "" : "pb-6"}`}>
                  <div
                    className="rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    style={{
                      background: isAktif ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(20px)",
                      border: isAktif ? "1.5px solid #BFDBFE" : "1px solid rgba(147,197,253,0.2)",
                      boxShadow: isAktif ? "0 8px 32px rgba(59,130,246,0.12)" : "0 2px 12px rgba(59,130,246,0.05)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {isAktif && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#3B82F6" }} />}
                          <h3 className="text-slate-700" style={{ color: isMenunggu ? "#94A3B8" : undefined }}>{item.nama}</h3>
                        </div>
                        <p className="text-xs flex items-center gap-1" style={{ color: isMenunggu ? "#CBD5E1" : "#64748B" }}>
                          <Clock size={11} />
                          {item.dinilai_pada ? formatTanggal(item.dinilai_pada) : item.tanggal ? formatTanggal(item.tanggal) : "Belum ditentukan"}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                        style={{ background: badgeStyle.bg, color: badgeStyle.color }}
                      >
                        {badge}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed mb-3" style={{ color: isMenunggu ? "#94A3B8" : "#64748B" }}>
                      {item.catatan || item.deskripsi || TAHAP_DEFAULT_DESC[item.nama] || ""}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {details.map((d, di) => (
                        <span key={di} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: isMenunggu ? "#F8FAFC" : "#F1F5F9", color: isMenunggu ? "#CBD5E1" : "#475569" }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-700">Ringkasan Seleksi</h3>
              <div className="flex items-center gap-1">
                <RefreshCw size={10} className="text-slate-400" />
                <span style={{ color: "#94A3B8", fontSize: "0.68rem" }}>Real-time</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Progress Keseluruhan</span>
                <span className="text-blue-600 font-medium">{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #2563EB, #60A5FA)" }} />
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                { label: "Tahap Selesai", value: String(doneCount), color: "#10B981" },
                { label: "Tahap Aktif", value: String(activeCount), color: "#3B82F6" },
                { label: "Tahap Menunggu", value: String(waitCount), color: "#94A3B8" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs text-slate-500">{s.label}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
            <h3 className="text-slate-700 mb-3">Keterangan Status</h3>
            <div className="space-y-2">
              {[
                { label: "Lulus", ...getBadgeStyle("lulus") },
                { label: "Akan Datang", ...getBadgeStyle("proses") },
                { label: "Menunggu", ...getBadgeStyle("menunggu") },
                { label: "Tidak Lulus", ...getBadgeStyle("tidak_lulus") },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(147,197,253,0.25)", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
            <h3 className="text-slate-700 mb-3">Butuh Bantuan?</h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">Hubungi tim HRD kami jika ada pertanyaan mengenai proses seleksi.</p>
            <a href="mailto:hrd@radiant.id" className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1">
              hrd@radiant.id →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
