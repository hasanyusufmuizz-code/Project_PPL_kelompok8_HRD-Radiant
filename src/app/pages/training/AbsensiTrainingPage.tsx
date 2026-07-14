import { useEffect, useState } from "react";
import { ClipboardCheck, CheckCircle2, Circle } from "lucide-react";
import { api } from "../../../lib/api";

interface Jadwal {
  id: number;
  tanggal: string;
  waktu_mulai: string;
  lokasi: string | null;
  pemateri_nama: string;
}

interface Peserta {
  id: number;
  user_id: number;
  status_hadir: "terdaftar" | "hadir" | "tidak_hadir";
  hadir_pada: string | null;
  nama_lengkap: string | null;
  email: string;
}

interface Rekap {
  peserta: Peserta[];
  total: number;
  hadir: number;
  persentase: number;
}

function formatTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function AbsensiTrainingPage() {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rekap, setRekap] = useState<Rekap | null>(null);
  const [kehadiran, setKehadiran] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.get<Jadwal[]>("/jadwal-training").then((rows) => {
      setJadwalList(rows);
      if (rows.length) setSelectedId(rows[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    setLoading(true);
    api.get<Rekap>(`/jadwal-training/${selectedId}/absensi`)
      .then((data) => {
        setRekap(data);
        const map: Record<number, boolean> = {};
        data.peserta.forEach((p) => { map[p.user_id] = p.status_hadir === "hadir"; });
        setKehadiran(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedId]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function toggle(userId: number) {
    setKehadiran((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }

  async function handleSave() {
    if (selectedId === null) return;
    setSaving(true);
    try {
      const body = { kehadiran: Object.entries(kehadiran).map(([userId, hadir]) => ({ userId: Number(userId), hadir })) };
      await api.put(`/jadwal-training/${selectedId}/absensi`, body);
      showToast("Absensi berhasil disimpan");
      const data = await api.get<Rekap>(`/jadwal-training/${selectedId}/absensi`);
      setRekap(data);
    } catch {
      alert("Gagal menyimpan absensi");
    } finally {
      setSaving(false);
    }
  }

  const selectedJadwal = jadwalList.find((j) => j.id === selectedId);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-sm text-white shadow-xl" style={{ background: "#10B981" }}>
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Absensi Training</h1>
        <p className="text-sm text-slate-500 mt-1">Catat dan pantau kehadiran peserta training per sesi</p>
      </div>

      {jadwalList.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <ClipboardCheck size={40} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada jadwal training</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 min-w-[280px]"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              {jadwalList.map((j) => (
                <option key={j.id} value={j.id}>
                  {formatTgl(j.tanggal)} {j.waktu_mulai.slice(0, 5)} — {j.pemateri_nama}
                </option>
              ))}
            </select>
            {rekap && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
                <span className="text-sm font-semibold text-slate-800">{rekap.hadir}/{rekap.total}</span>
                <span className="text-xs text-slate-400">hadir ({rekap.persentase}%)</span>
              </div>
            )}
          </div>

          {selectedJadwal && (
            <p className="text-xs text-slate-500">{selectedJadwal.lokasi || "Lokasi belum ditentukan"}</p>
          )}

          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
            {loading ? (
              <div className="p-12 text-center text-slate-400">Memuat...</div>
            ) : !rekap || rekap.peserta.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ClipboardCheck size={40} className="mx-auto mb-3 opacity-30" />
                <p>Belum ada peserta terdaftar pada sesi ini</p>
              </div>
            ) : (
              <div>
                {rekap.peserta.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.user_id)}
                    className="w-full flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-blue-50/20 transition-colors text-left"
                  >
                    {kehadiran[p.user_id] ? (
                      <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-slate-300 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{p.nama_lengkap || p.email}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </div>
                    <span className="text-xs font-medium" style={{ color: kehadiran[p.user_id] ? "#065F46" : "#94A3B8" }}>
                      {kehadiran[p.user_id] ? "Hadir" : "Tidak Hadir"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {rekap && rekap.peserta.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
            >
              {saving ? "Menyimpan..." : "Simpan Absensi"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
