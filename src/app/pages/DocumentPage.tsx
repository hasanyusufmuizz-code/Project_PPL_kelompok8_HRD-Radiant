import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Trash2, Eye, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { useNavigate } from "react-router";

interface UploadedFile {
  id: number;
  name: string;
  size: string;
  status: "verified" | "pending" | "rejected";
  uploadedAt: string;
  required: boolean;
  uploading?: boolean;
}

const initialFiles: UploadedFile[] = [
  {
    id: 1,
    name: "CV_Muhammad_Daffa.pdf",
    size: "1.2 MB",
    status: "verified",
    uploadedAt: "10 Mar 2026",
    required: true,
  },
  {
    id: 2,
    name: "Transkrip_Nilai.pdf",
    size: "3.4 MB",
    status: "verified",
    uploadedAt: "10 Mar 2026",
    required: true,
  },
  {
    id: 3,
    name: "Surat_Lamaran.pdf",
    size: "0.8 MB",
    status: "pending",
    uploadedAt: "12 Mar 2026",
    required: true,
  },
];

const requiredDocs = [
  { id: "cv", label: "Curriculum Vitae (CV)", desc: "Format PDF, max 5MB", required: true, uploaded: true },
  { id: "transkrip", label: "Transkrip Nilai", desc: "Legalisir dari kampus, PDF, max 5MB", required: true, uploaded: true },
  { id: "surat", label: "Surat Lamaran", desc: "Ditujukan kepada Kepala HRD, PDF", required: true, uploaded: true },
  { id: "ijazah", label: "Ijazah / SKL", desc: "Scan berwarna, PDF, max 5MB", required: true, uploaded: false },
  { id: "foto", label: "Foto Formal", desc: "Latar belakang merah/biru, PDF", required: false, uploaded: false },
];

export function DocumentPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [showEmptyFiles] = useState(false); // Set to `true` to preview empty state

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const validateAndUpload = (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      toast.error("Format file tidak didukung. Hanya file PDF yang diizinkan.", {
        icon: "📄",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file melebihi 5MB. Kompres file dan coba lagi.", {
        icon: "⚠️",
      });
      return;
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const tempId = Date.now();

    // Add uploading state
    const newFile: UploadedFile = {
      id: tempId,
      name: file.name,
      size: `${sizeMB} MB`,
      status: "pending",
      uploadedAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      required: false,
      uploading: true,
    };
    setFiles((prev) => [...prev, newFile]);

    // Simulate upload progress
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, uploading: false } : f))
      );
      toast.success(`"${file.name}" berhasil diupload!`, {
        icon: "✅",
      });

      // Check for missing required docs
      const missingRequired = requiredDocs.filter((d) => d.required && !d.uploaded);
      if (missingRequired.length > 0) {
        setTimeout(() => {
          toast.warning(`Lengkapi semua berkas wajib: ${missingRequired[0].label} masih belum diupload.`, {
            icon: "📋",
          });
        }, 800);
      }
    }, 1500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(validateAndUpload);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(validateAndUpload);
    }
  };

  const removeFile = (id: number, name: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success(`"${name}" berhasil dihapus.`);
  };

  const statusConfig = {
    verified: { label: "Terverifikasi", color: "#065F46", bg: "#ECFDF5", icon: CheckCircle, iconColor: "#10B981" },
    pending: { label: "Menunggu Review", color: "#92400E", bg: "#FFFBEB", icon: AlertCircle, iconColor: "#F59E0B" },
    rejected: { label: "Ditolak", color: "#991B1B", bg: "#FEF2F2", icon: XCircle, iconColor: "#EF4444" },
  };

  const uploadedCount = requiredDocs.filter((d) => d.uploaded).length;
  const totalRequired = requiredDocs.filter((d) => d.required).length;
  const displayFiles = showEmptyFiles ? [] : files;

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>
            Upload Dokumen
          </h1>
          <p className="text-sm text-slate-500">Upload dokumen yang diperlukan untuk proses seleksi</p>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(147,197,253,0.25)" }}
        >
          <div>
            <p className="text-xs text-slate-400">Kelengkapan Dokumen</p>
            <p className="text-sm font-medium text-slate-700">
              {uploadedCount} / {totalRequired} Wajib
            </p>
          </div>
          <div
            className="w-12 h-12 relative"
            style={{ transform: "rotate(-90deg)" }}
          >
            <svg width="48" height="48">
              <circle cx="24" cy="24" r="18" fill="none" stroke="#E2E8F0" strokeWidth="4" />
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - uploadedCount / totalRequired)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.7s ease" }}
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upload Zone + File List */}
        <div className="col-span-2 space-y-5">
          {/* Drag & Drop Zone */}
          <div
            className="rounded-3xl transition-all duration-300 cursor-pointer"
            style={{
              background: isDragOver
                ? "rgba(239,246,255,0.95)"
                : "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              border: isDragOver
                ? "2px dashed #3B82F6"
                : "2px dashed rgba(147,197,253,0.5)",
              boxShadow: isDragOver ? "0 8px 32px rgba(59,130,246,0.15)" : "none",
              transform: isDragOver ? "scale(1.01)" : "scale(1)",
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="flex flex-col items-center justify-center p-10 cursor-pointer">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
                style={{
                  background: isDragOver
                    ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                    : "#EFF6FF",
                  boxShadow: isDragOver ? "0 8px 24px rgba(37,99,235,0.3)" : "none",
                }}
              >
                <Upload
                  size={24}
                  color={isDragOver ? "white" : "#3B82F6"}
                  style={{ transform: isDragOver ? "translateY(-3px)" : "none", transition: "transform 0.2s" }}
                />
              </div>
              <p className="text-slate-700 font-medium mb-1">
                {isDragOver ? "Lepaskan file di sini ✨" : "Drag & drop file di sini"}
              </p>
              <p className="text-sm text-slate-400 mb-3">atau klik untuk memilih file</p>
              <span
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "#F1F5F9", color: "#64748B" }}
              >
                📄 Hanya PDF • Maks. 5MB per file
              </span>
              <input
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          </div>

          {/* Uploaded Files */}
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
              boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
            }}
          >
            <h3 className="text-slate-700 mb-4">File Terupload ({displayFiles.length})</h3>

            {displayFiles.length === 0 ? (
              <EmptyState
                icon={<FolderOpen size={32} />}
                title="Belum Ada Dokumen"
                description="Upload dokumen wajibmu agar proses seleksi dapat berjalan. Mulai dengan mengunggah CV dan transkrip nilai."
                actionLabel="Upload Dokumen"
                onAction={() => {
                  // Trigger file input click
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (input) input.click();
                }}
                secondaryActionLabel="Lihat Lowongan"
                onSecondaryAction={() => navigate("/dashboard")}
              />
            ) : (
              <div className="space-y-2.5">
                {displayFiles.map((file) => {
                  const cfg = statusConfig[file.status];
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl group hover:shadow-sm transition-all duration-200 hover:-translate-y-px"
                      style={{
                        background: file.uploading ? "#F0F9FF" : "#F8FAFC",
                        border: file.uploading
                          ? "1px solid #BFDBFE"
                          : "1px solid #F1F5F9",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: file.uploading ? "#EFF6FF" : "#FEF2F2" }}
                      >
                        {file.uploading ? (
                          <div
                            className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
                          />
                        ) : (
                          <FileText size={17} color="#EF4444" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {file.uploading ? (
                            <span className="text-xs text-blue-500">Mengupload...</span>
                          ) : (
                            <>
                              <span className="text-xs text-slate-400">{file.size}</span>
                              <span className="text-slate-200">•</span>
                              <span className="text-xs text-slate-400">{file.uploadedAt}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {!file.uploading && (
                        <div className="flex items-center gap-2">
                          <span
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            <cfg.icon size={10} color={cfg.iconColor} />
                            {cfg.label}
                          </span>
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                            onClick={() => removeFile(file.id, file.name)}
                          >
                            <Trash2 size={13} color="#EF4444" />
                          </button>
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                          >
                            <Eye size={13} color="#3B82F6" />
                          </button>
                        </div>
                      )}
                      {file.uploading && (
                        <div className="w-16 h-1.5 rounded-full bg-blue-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-400 animate-pulse"
                            style={{ width: "60%" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="space-y-4">
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.25)",
              boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
            }}
          >
            <h3 className="text-slate-700 mb-4">Dokumen yang Diperlukan</h3>

            <div className="space-y-3">
              {requiredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-px ${
                    activeDocId === doc.id ? "ring-2 ring-blue-200" : ""
                  }`}
                  style={{
                    background: doc.uploaded
                      ? "#F0FDF4"
                      : "#F8FAFC",
                    border: doc.uploaded
                      ? "1px solid #BBF7D0"
                      : "1px solid #F1F5F9",
                  }}
                  onClick={() => setActiveDocId(activeDocId === doc.id ? null : doc.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {doc.uploaded ? (
                      <CheckCircle size={16} color="#10B981" />
                    ) : (
                      <div
                        className="w-4 h-4 rounded-full border-2 border-dashed flex items-center justify-center"
                        style={{ borderColor: doc.required ? "#F59E0B" : "#CBD5E1" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className="text-xs font-medium"
                        style={{ color: doc.uploaded ? "#065F46" : "#475569" }}
                      >
                        {doc.label}
                      </p>
                      {doc.required && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background: "#FEF3C7", color: "#92400E", fontSize: "0.6rem" }}
                        >
                          Wajib
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning for missing docs */}
            {requiredDocs.some((d) => d.required && !d.uploaded) && (
              <div
                className="mt-3 flex items-start gap-2 p-3 rounded-xl"
                style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
              >
                <AlertCircle size={13} color="#D97706" className="mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Lengkapi semua berkas wajib untuk melanjutkan proses seleksi.
                </p>
              </div>
            )}
          </div>

          {/* Upload Rules */}
          <div
            className="rounded-3xl p-5"
            style={{
              background: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)",
              border: "1px solid #BFDBFE",
            }}
          >
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle size={14} color="#3B82F6" className="mt-0.5" />
              <p className="text-xs font-medium text-blue-800">Ketentuan Upload</p>
            </div>
            <ul className="space-y-1.5">
              {[
                "Format file: PDF saja",
                "Ukuran maks: 5MB per file",
                "Nama file jelas & deskriptif",
                "Scan dengan kualitas baik",
                "Pastikan dokumen terbaca",
              ].map((rule, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-blue-700">
                  <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
