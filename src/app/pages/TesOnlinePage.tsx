import { useEffect, useRef, useState, useCallback } from "react";
import {
  ClipboardList, Clock, AlertCircle, CheckCircle, Send,
  ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";
import { api } from "../../lib/api";

interface TesItem {
  id: number;
  judul: string;
  durasi_menit: number;
  kkm: number;
  posisi_lowongan: string | null;
  status_pengerjaan: "belum_mulai" | "berlangsung" | "selesai" | "menunggu_koreksi";
  skor: number | null;
  pengerjaan_id: number;
  waktu_deadline: string | null;
  jadwal_tanggal: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
}

interface Soal {
  id: number;
  tipe: "pilihan_ganda" | "esai";
  pertanyaan: string;
  opsi_a: string | null;
  opsi_b: string | null;
  opsi_c: string | null;
  opsi_d: string | null;
  urutan: number;
  jawaban_terpilih: "A" | "B" | "C" | "D" | null;
  jawaban_text: string | null;
}

const OPSI = ["A", "B", "C", "D"] as const;

function formatSisa(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function fmtTgl(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function TesOnlinePage() {
  const [tesList, setTesList]   = useState<TesItem[]>([]);
  const [loading, setLoading]   = useState(true);

  // State saat mengerjakan tes
  const [activeTes, setActiveTes] = useState<TesItem | null>(null);
  const [soalList, setSoalList]   = useState<Soal[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [jawaban, setJawaban]     = useState<Record<number, { pg?: string; esai?: string }>>({});
  const [sisaDetik, setSisaDetik] = useState<number | null>(null);
  const [loadingTes, setLoadingTes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ msg: string; status: string } | null>(null);
  const [toast, setToast]         = useState<string | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const loadTesList = () => {
    setLoading(true);
    api.get<TesItem[]>("/tes/aktif").then(setTesList).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadTesList(); }, []);

  // Timer countdown
  useEffect(() => {
    if (sisaDetik === null || submitting || submitResult) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSisaDetik(prev => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sisaDetik !== null, submitting, submitResult]);

  // Auto-submit saat waktu habis
  useEffect(() => {
    if (sisaDetik === 0 && activeTes && !submitting && !submitResult && !autoSubmitted) {
      setAutoSubmitted(true);
      handleSubmit(true);
    }
  }, [sisaDetik]);

  const saveJawaban = useCallback(async (soalId: number, pg?: string, esai?: string) => {
    if (!activeTes) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      try {
        await api.patch(`/tes/${activeTes.id}/jawab`, { soalId, jawaban: pg, jawabanText: esai });
      } catch {
        // silent auto-save failure
      }
    }, 800);
  }, [activeTes]);

  async function handleMulai(tes: TesItem) {
    setLoadingTes(true);
    try {
      const { sisaDetik: sd } = await api.post<{ success: boolean; sisaDetik: number }>(`/tes/${tes.id}/mulai`, {});
      const data = await api.get<{ soal: Soal[]; sisaDetik: number }>(`/tes/${tes.id}/soal`);
      setActiveTes(tes);
      setSoalList(data.soal);
      setCurrentIdx(0);
      setSisaDetik(data.sisaDetik ?? sd);
      setAutoSubmitted(false);
      setSubmitResult(null);
      // init jawaban dari server (resume)
      const init: Record<number, { pg?: string; esai?: string }> = {};
      data.soal.forEach(s => {
        if (s.jawaban_terpilih) init[s.id] = { pg: s.jawaban_terpilih };
        if (s.jawaban_text) init[s.id] = { ...(init[s.id] || {}), esai: s.jawaban_text };
      });
      setJawaban(init);
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal membuka tes");
    } finally {
      setLoadingTes(false);
    }
  }

  async function handleSubmit(isAuto = false) {
    if (!activeTes) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const result = await api.post<{ success: boolean; message: string; status: string }>(`/tes/${activeTes.id}/submit`, {});
      setSubmitResult({ msg: result.message || "Tes berhasil dikumpulkan", status: result.status });
      if (isAuto) showToast("Waktu habis, jawaban otomatis dikumpulkan");
    } catch (e: unknown) {
      showToast((e as Error).message || "Gagal mengumpulkan tes");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveTes(null);
    setSoalList([]);
    setJawaban({});
    setSisaDetik(null);
    setSubmitResult(null);
    setAutoSubmitted(false);
    loadTesList();
  }

  const soal = soalList[currentIdx];
  const answered = Object.keys(jawaban).length;
  const isUrgent = sisaDetik !== null && sisaDetik < 300;

  // ── Halaman utama: daftar tes ──────────────────────────────────────────────
  if (!activeTes) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Tes Online</h1>
          <p className="text-sm text-slate-500 mt-1">Tes tertulis tahap seleksi</p>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : tesList.length === 0 ? (
          <div className="py-20 text-center rounded-3xl"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,197,253,0.2)" }}>
            <ClipboardList size={48} className="mx-auto mb-4 opacity-25 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-700">Belum Ada Tes</h2>
            <p className="text-sm text-slate-500 mt-1">Tes akan muncul setelah dijadwalkan oleh admin HRD.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tesList.map(tes => {
              const done = tes.status_pengerjaan === "selesai" || tes.status_pengerjaan === "menunggu_koreksi";
              const notYet = tes.jadwal_tanggal && new Date(`${tes.jadwal_tanggal}T${tes.waktu_mulai || "00:00"}`) > new Date();
              return (
                <div key={tes.id} className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="font-semibold text-slate-800">{tes.judul}</h2>
                      {tes.posisi_lowongan && <p className="text-xs text-slate-500 mt-0.5">{tes.posisi_lowongan}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={12} /> {tes.durasi_menit} menit</span>
                        {tes.jadwal_tanggal && (
                          <span className="flex items-center gap-1"><ClipboardList size={12} />
                            {fmtTgl(tes.jadwal_tanggal)} {tes.waktu_mulai?.slice(0, 5)} WIB
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {done ? (
                        <div className="text-right">
                          {tes.status_pengerjaan === "selesai" && tes.skor != null && (
                            <p className="text-sm font-bold" style={{ color: Number(tes.skor) >= tes.kkm ? "#059669" : "#DC2626" }}>
                              Skor: {Number(tes.skor).toFixed(1)}
                            </p>
                          )}
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={tes.status_pengerjaan === "selesai"
                              ? { background: "#ECFDF5", color: "#065F46" }
                              : { background: "#FFFBEB", color: "#B45309" }}>
                            {tes.status_pengerjaan === "selesai" ? "Selesai" : "Menunggu Koreksi"}
                          </span>
                        </div>
                      ) : notYet ? (
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-amber-700" style={{ background: "#FFFBEB" }}>
                          <AlertCircle size={14} />
                          Belum dimulai
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMulai(tes)}
                          disabled={loadingTes}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                          style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
                          {loadingTes ? "Memuat..." : tes.status_pengerjaan === "berlangsung" ? "Lanjutkan Tes" : "Mulai Tes"}
                        </button>
                      )}
                    </div>
                  </div>

                  {notYet && tes.jadwal_tanggal && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600" style={{ background: "#FFFBEB", padding: "8px 12px", borderRadius: "10px" }}>
                      <AlertCircle size={12} />
                      Tes tersedia mulai {fmtTgl(tes.jadwal_tanggal)} pukul {tes.waktu_mulai?.slice(0, 5)} WIB
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Hasil setelah submit ───────────────────────────────────────────────────
  if (submitResult) {
    const isWaitKoreksi = submitResult.status === "menunggu_koreksi";
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center"
          style={{ background: isWaitKoreksi ? "#FFFBEB" : "#ECFDF5" }}>
          {isWaitKoreksi ? <AlertCircle size={36} color="#B45309" /> : <CheckCircle size={36} color="#059669" />}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{isWaitKoreksi ? "Tes Berhasil Dikumpulkan" : "Tes Selesai!"}</h2>
          <p className="text-sm text-slate-500 mt-2">{submitResult.msg}</p>
        </div>
        <button onClick={handleBack}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}>
          Kembali ke Daftar Tes
        </button>
      </div>
    );
  }

  // ── Halaman pengerjaan tes ─────────────────────────────────────────────────
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-4">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-sm text-white shadow-xl"
          style={{ background: "#EF4444" }}>{toast}</div>
      )}

      {/* Top bar */}
      <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(147,197,253,0.25)" }}>
        <div>
          <h1 className="font-semibold text-slate-800 text-sm">{activeTes.judul}</h1>
          <p className="text-xs text-slate-400">{answered}/{soalList.length} soal dijawab</p>
        </div>
        <div className="flex items-center gap-3">
          {sisaDetik !== null && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono font-bold text-sm"
              style={{ background: isUrgent ? "#FEF2F2" : "#EFF6FF", color: isUrgent ? "#DC2626" : "#2563EB" }}>
              <Clock size={14} />
              {formatSisa(sisaDetik)}
              {isUrgent && <AlertTriangle size={12} />}
            </div>
          )}
          <button onClick={() => { if (window.confirm("Kumpulkan tes sekarang?")) handleSubmit(); }}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#10B981,#34D399)" }}>
            <Send size={14} />
            {submitting ? "Mengumpulkan..." : "Kumpulkan"}
          </button>
        </div>
      </div>

      {/* Layout: soal + navigasi */}
      <div className="flex gap-6 items-start">
        {/* Panel soal */}
        <div className="flex-1 min-w-0">
          {soal && (
            <div className="rounded-2xl p-6 space-y-5"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={soal.tipe === "pilihan_ganda" ? { background: "#F5F3FF", color: "#7C3AED" } : { background: "#ECFDF5", color: "#065F46" }}>
                  {soal.tipe === "pilihan_ganda" ? "Pilihan Ganda" : "Esai"}
                </span>
                <span className="text-xs text-slate-400">Soal {currentIdx + 1} dari {soalList.length}</span>
              </div>

              <p className="text-base text-slate-800 font-medium leading-relaxed">{soal.pertanyaan}</p>

              {soal.tipe === "pilihan_ganda" ? (
                <div className="space-y-2.5">
                  {OPSI.map(opt => {
                    const val = soal[`opsi_${opt.toLowerCase()}` as "opsi_a" | "opsi_b" | "opsi_c" | "opsi_d"];
                    if (!val) return null;
                    const selected = jawaban[soal.id]?.pg === opt;
                    return (
                      <button key={opt}
                        onClick={() => {
                          setJawaban(j => ({ ...j, [soal.id]: { ...j[soal.id], pg: opt } }));
                          saveJawaban(soal.id, opt, undefined);
                        }}
                        className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all border-2"
                        style={{
                          borderColor: selected ? "#2563EB" : "#E2E8F0",
                          background: selected ? "#EFF6FF" : "white",
                          color: selected ? "#1D4ED8" : "#374151",
                        }}>
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{opt}</span>
                        <span className="text-sm leading-relaxed">{val}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <textarea rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 resize-none leading-relaxed"
                    placeholder="Tulis jawaban Anda di sini..."
                    value={jawaban[soal.id]?.esai || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setJawaban(j => ({ ...j, [soal.id]: { ...j[soal.id], esai: val } }));
                      saveJawaban(soal.id, undefined, val);
                    }} />
                  <p className="text-xs text-slate-400 mt-1">Jawaban disimpan otomatis saat Anda mengetik</p>
                </div>
              )}

              {/* Navigasi prev/next */}
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 border border-slate-200">
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                <button onClick={() => setCurrentIdx(i => Math.min(soalList.length - 1, i + 1))} disabled={currentIdx === soalList.length - 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 border border-slate-200">
                  Selanjutnya <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel navigasi soal */}
        <div className="hidden lg:block w-56 flex-shrink-0 sticky top-32">
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
            <p className="text-xs font-medium text-slate-600">Navigasi Soal</p>
            <div className="grid grid-cols-5 gap-1.5">
              {soalList.map((s, idx) => {
                const isAnswered = jawaban[s.id]?.pg !== undefined || (jawaban[s.id]?.esai && jawaban[s.id].esai!.trim().length > 0);
                const isCurrent  = idx === currentIdx;
                return (
                  <button key={s.id} onClick={() => setCurrentIdx(idx)}
                    className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: isCurrent ? "#2563EB" : isAnswered ? "#ECFDF5" : "#F1F5F9",
                      color: isCurrent ? "white" : isAnswered ? "#065F46" : "#94A3B8",
                      border: isCurrent ? "2px solid #2563EB" : "2px solid transparent",
                    }}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-3 h-3 rounded bg-blue-600" /> Soal aktif
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-3 h-3 rounded" style={{ background: "#ECFDF5", border: "1px solid #059669" }} /> Sudah dijawab
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> Belum dijawab
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
