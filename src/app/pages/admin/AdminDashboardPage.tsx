import { useEffect, useState } from "react";
import { Briefcase, Users, FileStack, Calendar, TrendingUp, Clock } from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface AdminStats {
  totalLowongan: number;
  lowonganAktif: number;
  totalPelamar: number;
  berkasMenunggu: number;
  jadwalHariIni: number;
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ id: number; status: string; jumlah_pelamar: number }[]>("/lowongan/admin/semua").catch(() => []),
      api.get<{ id: number; status_verifikasi: string }[]>("/berkas/admin").catch(() => []),
    ]).then(([lowongan, berkas]) => {
      const arr = lowongan as { id: number; status: string; jumlah_pelamar: number }[];
      const brk = berkas as { id: number; status_verifikasi: string }[];
      setStats({
        totalLowongan: arr.length,
        lowonganAktif: arr.filter((l) => l.status === "aktif").length,
        totalPelamar: arr.reduce((s, l) => s + (l.jumlah_pelamar || 0), 0),
        berkasMenunggu: brk.filter((b) => b.status_verifikasi === "belum_diproses").length,
        jadwalHariIni: 0,
      });
    });
  }, []);

  const cards = [
    { label: "Total Lowongan",    val: stats?.totalLowongan ?? "-",  icon: Briefcase,   color: "#3B82F6", bg: "#EFF6FF" },
    { label: "Lowongan Aktif",    val: stats?.lowonganAktif ?? "-",  icon: TrendingUp,  color: "#10B981", bg: "#ECFDF5" },
    { label: "Total Pelamar",     val: stats?.totalPelamar ?? "-",   icon: Users,       color: "#8B5CF6", bg: "#F5F3FF" },
    { label: "Berkas Diproses",   val: stats?.berkasMenunggu ?? "-", icon: FileStack,   color: "#F59E0B", bg: "#FFFBEB" },
    { label: "Jadwal Hari Ini",   val: stats?.jadwalHariIni ?? "-",  icon: Calendar,    color: "#EF4444", bg: "#FEF2F2" },
    { label: "Tahap Berjalan",    val: "-",                           icon: Clock,       color: "#6366F1", bg: "#EEF2FF" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Selamat datang, {user?.namaLengkap || "Admin"} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
              <c.icon size={20} color={c.color} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800">{c.val}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
        <h2 className="font-semibold text-slate-700 mb-4">Menu Cepat Admin</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Kelola Lowongan",   desc: "Buat dan atur lowongan",   href: "/admin/lowongan",  color: "#3B82F6", bg: "#EFF6FF" },
            { label: "Verifikasi Berkas", desc: "Cek dan verifikasi berkas", href: "/admin/berkas",    color: "#10B981", bg: "#ECFDF5" },
            { label: "Jadwal Interview",  desc: "Atur jadwal seleksi",       href: "/admin/jadwal",    color: "#8B5CF6", bg: "#F5F3FF" },
            { label: "Data Pelamar",      desc: "Lihat semua pelamar",       href: "/admin/pelamar",   color: "#F59E0B", bg: "#FFFBEB" },
          ].map((m) => (
            <a key={m.href} href={m.href}
              className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-sm"
              style={{ background: "#F8FAFC" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F8FAFC")}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: m.bg }}>
                <Briefcase size={15} color={m.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{m.label}</p>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
