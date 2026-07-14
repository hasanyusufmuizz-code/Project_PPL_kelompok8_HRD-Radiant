import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle2, XCircle, Filter } from "lucide-react";
import { api } from "../../../lib/api";

interface Dashboard {
  total_pendaftar: number;
  kandidat_proses: number;
  total_lolos: number;
  total_gagal: number;
}

interface Lowongan { id: number; posisi: string; }

export function PimpinanDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [lowonganList, setLowonganList] = useState<Lowongan[]>([]);
  const [lowonganId, setLowonganId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Lowongan[]>("/pimpinan/lowongan").then(setLowonganList).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (lowonganId) params.set("lowonganId", lowonganId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    api.get<Dashboard>(`/pimpinan/dashboard?${params}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [lowonganId, startDate, endDate]);

  const cards = data
    ? [
        { label: "Total Pendaftar", value: data.total_pendaftar, icon: Users, bg: "#EFF6FF", text: "#1D4ED8" },
        { label: "Kandidat Proses", value: data.kandidat_proses, icon: Clock, bg: "#FFFBEB", text: "#B45309" },
        { label: "Lolos", value: data.total_lolos, icon: CheckCircle2, bg: "#ECFDF5", text: "#065F46" },
        { label: "Gagal", value: data.total_gagal, icon: XCircle, bg: "#FEF2F2", text: "#991B1B" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard Rekrutmen</h1>
        <p className="text-sm text-slate-500 mt-1">Statistik dan laporan rekrutmen secara instan</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
            value={lowonganId}
            onChange={(e) => setLowonganId(e.target.value)}
          >
            <option value="">Semua Lowongan</option>
            {lowonganList.map((l) => <option key={l.id} value={l.id}>{l.posisi}</option>)}
          </select>
        </div>
        <input
          type="date"
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span className="text-slate-400 text-sm">s/d</span>
        <input
          type="date"
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          Memuat...
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: c.bg }}>
                <c.icon size={18} color={c.text} />
              </div>
              <p className="text-2xl font-semibold" style={{ color: c.text }}>{c.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
