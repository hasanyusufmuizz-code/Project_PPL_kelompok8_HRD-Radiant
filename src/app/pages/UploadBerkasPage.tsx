import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload, CheckCircle, Clock, XCircle, Trash2, Eye, AlertCircle, FilePlus2, Star
} from "lucide-react";
import { apiUpload, api } from "../../lib/api";

interface BerkasItem {
  id: number;
  jenis_dokumen: string;
  nama_file: string;
  file_url: string;
  ukuran_file: number;
  status_verifikasi: "belum_diproses" | "terverifikasi" | "ditolak";
  catatan_verifikasi: string | null;
}

interface SyaratKhusus {
  id: number;
  nama_dokumen: string;
  kode_dokumen: string;
  deskripsi: string | null;
  wajib: boolean;
}

interface LowonganInfo { id: number; posisi: string; }

const DOKUMEN_INTI = [
  { key: "cv",              label: "Curriculum Vitae (CV)", desc: "Format PDF, max 5MB",                  wajib: true  },
  { key: "transkrip_nilai", label: "Transkrip Nilai",        desc: "Legalisir dari kampus, PDF, max 5MB", wajib: true  },
  { key: "surat_lamaran",   label: "Surat Lamaran",          desc: "Ditujukan kepada Kepala HRD, PDF",    wajib: true  },
  { key: "ijazah",          label: "Ijazah / SKL",           desc: "Scan berwarna, PDF, max 5MB",         wajib: true  },
  { key: "foto",            label: "Foto Formal",            desc: "Latar belakang merah/biru, PDF",      wajib: false },
  { key: "ktp",             label: "KTP",                    desc: "Scan KTP, PDF, max 5MB",              wajib: false },
];

const STATUS_UI = {
  belum_diproses: { label: "Menunggu",      bg: "#FFF7ED", text: "#92400E", icon: Clock       },
  terverifikasi:  { label: "Terverifikasi", bg: "#ECFDF5", text: "#065F46", icon: CheckCircle },
  ditolak:        { label: "Ditolak",       bg: "#FEF2F2", text: "#991B1B", icon: XCircle     },
};

function fmtSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadBerkasPage() {
  const [berkasInti, setBerkasInti] = useState<BerkasItem[]>([]);
  const [berkasKhusus, setBerkasKhusus] = useState<BerkasItem[]>([]);
  const [syaratKhusus, setSyaratKhusus] = useState<SyaratKhusus[]>([]);
  const [lamaran, setLamaran] = useState<LowonganInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [activeUpload, setActiveUpload] = useState<{ jenis: string; sumber: "inti" | "khusus" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api.get<{
      berkasInti: BerkasItem[];
      berkasKhusus: BerkasItem[];
      syaratKhusus: SyaratKhusus[];
      lamaran: LowonganInfo | null;
    }>("/berkas")
      .then((d) => {
        setBerkasInti(d.berkasInti);
        setBerkasKhusus(d.berkasKhusus);
        setSyaratKhusus(d.syaratKhusus);
        setLamaran(d.lamaran);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const intiMap = berkasInti.reduce((acc, b) => { acc[b.jenis_dokumen] = b; return acc; }, {} as Record<string, BerkasItem>);
  const khususMap = berkasKhusus.reduce((acc, b) => { acc[b.jenis_dokumen] = b; return acc; }, {} as Record<string, BerkasItem>);

  const wajibIntiDone = DOKUMEN_INTI.filter((d) => d.wajib && intiMap[d.key]).length;
  const totalWajibInti = DOKUMEN_INTI.filter((d) => d.wajib).length;
  const wajibKhususDone = syaratKhusus.filter((s) => s.wajib && khususMap[s.kode_dokumen]).length;
  const totalWajibKhusus = syaratKhusus.filter((s) => s.wajib).length;
  const totalWajibDone = wajibIntiDone + wajibKhususDone;
  const totalWajib = totalWajibInti + totalWajibKhusus;
  const progressPct = totalWajib > 0 ? Math.round((totalWajibDone / totalWajib) * 100) : 0;

  async function uploadFile(file: File, jenis: string, sumber: "inti" | "khusus") {
    if (file.size > 5 * 1024 * 1024) { alert("Ukuran file melebihi batas 5MB"); return; }
    if (file.type !== "application/pdf") { alert("Hanya file PDF yang diizinkan"); return; }
    setUploadingKey(jenis);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jenisDokumen", jenis);
      await apiUpload(sumber === "khusus" ? "/berkas/khusus" : "/berkas", formData);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Gagal mengupload");
    } finally {
      setUploadingKey(null);
      setActiveUpload(null);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && activeUpload) uploadFile(file, activeUpload.jenis, activeUpload.sumber);
    e.target.value = "";
  }

  function triggerUpload(jenis: string, sumber: "inti" | "khusus") {
    setActiveUpload({ jenis, sumber });
    inputRef.current?.click();
  }

  async function handleDelete(id: number, sumber: "inti" | "khusus") {
    try {
      await api.delete(sumber === "khusus" ? `/berkas/khusus/${id}` : `/berkas/${id}`);
      load();
    } catch { alert("Gagal menghapus berkas"); }
  }

  function renderRow(
    dok: { key: string; label: string; desc: string; wajib: boolean },
    existing: BerkasItem | undefined,
    sumber: "inti" | "khusus"
  ) {
    const isUploading = uploadingKey === dok.key;
    const isDragging = dragKey === dok.key;
    const st = existing ? STATUS_UI[existing.status_verifikasi] : null;
    const StIcon = st?.icon;

    return (
      <div
        key={dok.key}
        className="rounded-2xl p-4 transition-all"
        style={{
          background: existing ? "rgba(255,255,255,0.95)" : isDragging ? "#EFF6FF" : "rgba(255,255,255,0.8)",
          border: isDragging ? "2px dashed #3B82F6" : existing ? "1px solid rgba(147,197,253,0.3)" : "2px dashed rgba(147,197,253,0.4)",
          boxShadow: "0 2px 12px rgba(59,130,246,0.05)",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragKey(dok.key); }}
        onDragLeave={() => setDragKey(null)}
        onDrop={(e) => { e.preventDefault(); setDragKey(null); const f = e.dataTransfer.files[0]; if (f) uploadFile(f, dok.key, sumber); }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: existing ? "#ECFDF5" : "#EFF6FF" }}>
            {existing ? <CheckCircle size={17} color="#10B981" /> : <FilePlus2 size={17} color="#3B82F6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-800">{dok.label}</p>
              {dok.wajib && (
                <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: "#FEF3C7", color: "#92400E" }}>Wajib</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{dok.desc}</p>
            {existing && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-500 truncate max-w-[200px]">{existing.nama_file}</p>
                <span className="text-xs text-slate-400">· {fmtSize(existing.ukuran_file)}</span>
                {st && StIcon && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: st.bg, color: st.text }}>
                    <StIcon size={10} /> {st.label}
                  </span>
                )}
              </div>
            )}
            {existing?.catatan_verifikasi && (
              <p className="text-xs text-red-500 mt-0.5">{existing.catatan_verifikasi}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {existing && (
              <>
                <a
                  href={`http://localhost:3001${existing.file_url}`}
                  target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye size={14} />
                </a>
                <button
                  onClick={() => handleDelete(existing.id, sumber)}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <button
              onClick={() => triggerUpload(dok.key, sumber)}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: existing ? "#EFF6FF" : "linear-gradient(135deg,#2563EB,#3B82F6)", color: existing ? "#2563EB" : "white" }}
            >
              {isUploading ? (
                <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Uploading...</>
              ) : (
                <><Upload size={12} /> {existing ? "Ganti" : "Upload"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 space-y-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Upload Dokumen</h1>
            <p className="text-sm text-slate-500 mt-1">Upload dokumen yang diperlukan untuk proses seleksi</p>
            {lamaran && <p className="text-xs text-blue-500 mt-0.5">Posisi dilamar: {lamaran.posisi}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs text-slate-500">Kelengkapan Dokumen</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">{totalWajibDone} / {totalWajib} Wajib</p>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#3B82F6" strokeWidth="4"
                  strokeDasharray={`${(progressPct / 100) * 100.5} 100.5`}
                  strokeLinecap="round" transform="rotate(-90 20 20)" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Berkas Inti */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle size={12} color="#2563EB" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Berkas Inti</h2>
              <span className="text-xs text-slate-400">— dapat diupload kapan saja</span>
            </div>
            <div className="space-y-3">
              {DOKUMEN_INTI.map((dok) => renderRow(dok, intiMap[dok.key], "inti"))}
            </div>
          </div>

          {/* Berkas Khusus */}
          {syaratKhusus.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star size={11} color="#D97706" />
                </div>
                <h2 className="text-sm font-semibold text-slate-700">Berkas Khusus</h2>
                <span className="text-xs text-slate-400">— untuk posisi {lamaran?.posisi}</span>
              </div>
              <div className="space-y-3">
                {syaratKhusus.map((s) =>
                  renderRow(
                    { key: s.kode_dokumen, label: s.nama_dokumen, desc: s.deskripsi || "PDF, max 5MB", wajib: s.wajib },
                    khususMap[s.kode_dokumen],
                    "khusus"
                  )
                )}
              </div>
            </div>
          )}

          <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileChange} />

          {/* Drag & Drop zone */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.6)", border: "2px dashed rgba(147,197,253,0.4)" }}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "#EFF6FF" }}>
              <Upload size={22} color="#3B82F6" />
            </div>
            <p className="text-sm font-medium text-slate-700">Drag &amp; drop file di sini</p>
            <p className="text-xs text-slate-400 mt-1">atau klik tombol Upload pada dokumen di atas</p>
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs text-slate-500" style={{ background: "#F1F5F9" }}>
              📄 Hanya PDF • Maks. 5MB per file
            </span>
          </div>
        </div>

        {/* Sidebar kanan */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.05)" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Dokumen yang Diperlukan</h3>
            <div className="space-y-3">
              {DOKUMEN_INTI.map((dok) => {
                const uploaded = !!intiMap[dok.key];
                return (
                  <div key={dok.key} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">
                      {uploaded
                        ? <CheckCircle size={16} color="#10B981" />
                        : <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{ borderColor: dok.wajib ? "#F59E0B" : "#CBD5E1" }} />
                      }
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-slate-700">{dok.label}</p>
                      {dok.wajib && <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: "#FEF3C7", color: "#92400E" }}>Wajib</span>}
                    </div>
                  </div>
                );
              })}

              {syaratKhusus.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-amber-600 mb-2">Khusus: {lamaran?.posisi}</p>
                  {syaratKhusus.map((s) => {
                    const uploaded = !!khususMap[s.kode_dokumen];
                    return (
                      <div key={s.kode_dokumen} className="flex items-start gap-2.5 mb-2">
                        <div className="mt-0.5 flex-shrink-0">
                          {uploaded
                            ? <CheckCircle size={16} color="#10B981" />
                            : <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{ borderColor: s.wajib ? "#F59E0B" : "#CBD5E1" }} />
                          }
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-slate-700">{s.nama_dokumen}</p>
                          {s.wajib && <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: "#FEF3C7", color: "#92400E" }}>Wajib</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {totalWajibDone < totalWajib ? (
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: "#FFF7ED", border: "1px solid rgba(251,191,36,0.3)" }}>
                <AlertCircle size={14} color="#F59E0B" className="flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Lengkapi semua berkas wajib untuk melanjutkan proses seleksi.</p>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: "#ECFDF5", border: "1px solid rgba(16,185,129,0.3)" }}>
                <CheckCircle size={14} color="#10B981" className="flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-700">Semua berkas wajib sudah lengkap! Tim HRD akan memverifikasi.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.05)" }}>
            <h3 className="text-sm font-semibold text-blue-600 mb-3 flex items-center gap-1.5">
              <AlertCircle size={14} /> Ketentuan Upload
            </h3>
            <ul className="space-y-1.5">
              {[
                "Format file: PDF saja",
                "Ukuran maks: 5MB per file",
                "Nama file jelas & deskriptif",
                "Scan/foto harus terbaca jelas",
                "Ijazah/SKL harus legalisir",
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-blue-400 mt-0.5">•</span> {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
