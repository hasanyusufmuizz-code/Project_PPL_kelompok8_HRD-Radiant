import { useState } from "react";
import {
  BookOpen,
  FileText,
  ScrollText,
  Download,
  Eye,
  CheckCircle,
  Lock,
  Star,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";

interface Material {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  iconBg: string;
  gradientFrom: string;
  gradientTo: string;
  pages: number;
  size: string;
  category: string;
  locked: boolean;
  read: boolean;
  required: boolean;
  description: string;
  tags: string[];
}

const materials: Material[] = [
  {
    id: 1,
    title: "Profil & Sejarah Lembaga",
    subtitle: "Kenali tempat kamu akan berkarya",
    icon: BookOpen,
    iconColor: "#3B82F6",
    iconBg: "#EFF6FF",
    gradientFrom: "#2563EB",
    gradientTo: "#3B82F6",
    pages: 24,
    size: "2.4 MB",
    category: "Profil",
    locked: false,
    read: true,
    required: true,
    description:
      "Dokumen ini berisi sejarah pendirian, visi misi, struktur organisasi, dan pencapaian lembaga selama 20 tahun beroperasi.",
    tags: ["Wajib Dibaca", "Sejarah", "Visi Misi"],
  },
  {
    id: 2,
    title: "Tata Tertib & Kode Etik",
    subtitle: "Panduan perilaku dan aturan kerja",
    icon: ScrollText,
    iconColor: "#8B5CF6",
    iconBg: "#F5F3FF",
    gradientFrom: "#7C3AED",
    gradientTo: "#8B5CF6",
    pages: 18,
    size: "1.8 MB",
    category: "Regulasi",
    locked: false,
    read: false,
    required: true,
    description:
      "Berisi aturan kehadiran, kode etik profesional, kebijakan penggunaan fasilitas, dan prosedur pelaporan.",
    tags: ["Wajib Dibaca", "Regulasi", "Etika"],
  },
  {
    id: 3,
    title: "Kontrak Kerja & Benefít",
    subtitle: "Detail perjanjian kerja & tunjangan",
    icon: FileText,
    iconColor: "#10B981",
    iconBg: "#ECFDF5",
    gradientFrom: "#059669",
    gradientTo: "#10B981",
    pages: 12,
    size: "1.2 MB",
    category: "Kontrak",
    locked: false,
    read: false,
    required: true,
    description:
      "Dokumen resmi kontrak kerja yang mencakup hak dan kewajiban, struktur gaji, tunjangan, dan ketentuan lainnya.",
    tags: ["Wajib Tandatangan", "Kontrak", "Gaji"],
  },
  {
    id: 4,
    title: "Panduan Kurikulum & Silabus",
    subtitle: "Materi pengajaran semester ini",
    icon: BookOpen,
    iconColor: "#F59E0B",
    iconBg: "#FFFBEB",
    gradientFrom: "#D97706",
    gradientTo: "#F59E0B",
    pages: 56,
    size: "4.1 MB",
    category: "Kurikulum",
    locked: true,
    read: false,
    required: false,
    description:
      "Panduan kurikulum lengkap beserta silabus mata pelajaran untuk tahun ajaran 2026/2027.",
    tags: ["Kurikulum", "Silabus", "Pengajaran"],
  },
  {
    id: 5,
    title: "Fasilitas & Lingkungan Kerja",
    subtitle: "Tour virtual kampus dan fasilitas",
    icon: Star,
    iconColor: "#EC4899",
    iconBg: "#FDF2F8",
    gradientFrom: "#DB2777",
    gradientTo: "#EC4899",
    pages: 10,
    size: "3.5 MB",
    category: "Fasilitas",
    locked: true,
    read: false,
    required: false,
    description:
      "Panduan fasilitas kampus termasuk peta gedung, akses laboratorium, perpustakaan, dan area kerja.",
    tags: ["Fasilitas", "Lingkungan", "Kampus"],
  },
];

export function OnboardingPage() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [readMaterials, setReadMaterials] = useState<Set<number>>(new Set([1]));

  const categories = ["Semua", "Profil", "Regulasi", "Kontrak", "Kurikulum", "Fasilitas"];

  const filtered =
    activeFilter === "Semua"
      ? materials
      : materials.filter((m) => m.category === activeFilter);

  const markAsRead = (id: number) => {
    setReadMaterials((prev) => new Set([...prev, id]));
  };

  const readCount = readMaterials.size;
  const totalRequired = materials.filter((m) => m.required).length;

  return (
    <div className="max-w-[1440px] mx-auto px-6">
      {/* Modal Preview */}
      {previewMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
          onClick={() => setPreviewMaterial(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.98)",
              boxShadow: "0 32px 80px rgba(15,23,42,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-6"
              style={{
                background: `linear-gradient(135deg, ${previewMaterial.gradientFrom}, ${previewMaterial.gradientTo})`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <previewMaterial.icon size={20} color="white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">{previewMaterial.category}</p>
                    <h3 className="text-white">{previewMaterial.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={15} color="white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {previewMaterial.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Halaman", value: `${previewMaterial.pages} hal` },
                  { label: "Ukuran", value: previewMaterial.size },
                  { label: "Status", value: previewMaterial.required ? "Wajib" : "Opsional" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl text-center"
                    style={{ background: "#F8FAFC" }}
                  >
                    <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {previewMaterial.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: previewMaterial.iconBg,
                      color: previewMaterial.iconColor,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${previewMaterial.gradientFrom}, ${previewMaterial.gradientTo})`,
                  }}
                  onClick={() => {
                    markAsRead(previewMaterial.id);
                    setPreviewMaterial(null);
                  }}
                >
                  <Eye size={15} />
                  Buka Dokumen
                </button>
                <button
                  className="px-4 py-3 rounded-xl text-sm flex items-center gap-2 transition-all hover:bg-slate-100"
                  style={{ background: "#F1F5F9", color: "#64748B" }}
                >
                  <Download size={15} />
                  Unduh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.5rem" }}>
            Materi Onboarding 🎓
          </h1>
          <p className="text-sm text-slate-500">
            Selamat bergabung! Pelajari semua materi berikut sebelum hari pertama
          </p>
        </div>

        {/* Progress */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)",
            border: "1px solid #BFDBFE",
          }}
        >
          <div>
            <p className="text-xs text-blue-600">Progres Membaca</p>
            <p className="text-base font-semibold text-blue-800">
              {readCount} / {materials.length} dokumen
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
          >
            <BookOpen size={18} color="white" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="rounded-2xl p-4 mb-6 flex items-center gap-4"
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(147,197,253,0.25)",
        }}
      >
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Kelengkapan Onboarding</span>
            <span className="text-blue-600 font-medium">
              {Math.round((readCount / materials.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(readCount / materials.length) * 100}%`,
                background: "linear-gradient(90deg, #2563EB, #60A5FA)",
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <CheckCircle size={15} color="#10B981" />
          <span className="text-xs text-green-600">
            {totalRequired - readMaterials.size < 0 ? totalRequired : Math.max(0, totalRequired - readMaterials.size)} wajib belum dibaca
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className="px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0"
            style={{
              background:
                activeFilter === cat
                  ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                  : "rgba(255,255,255,0.8)",
              color: activeFilter === cat ? "white" : "#64748B",
              border:
                activeFilter === cat
                  ? "none"
                  : "1px solid rgba(147,197,253,0.25)",
              boxShadow: activeFilter === cat ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((material) => (
          <div
            key={material.id}
            className="rounded-3xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            style={{
              background: material.locked
                ? "rgba(248,250,252,0.7)"
                : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(20px)",
              border: readMaterials.has(material.id)
                ? "1.5px solid #BBF7D0"
                : material.locked
                ? "1px dashed #E2E8F0"
                : "1px solid rgba(147,197,253,0.25)",
              boxShadow: readMaterials.has(material.id)
                ? "0 4px 24px rgba(16,185,129,0.1)"
                : "0 4px 24px rgba(59,130,246,0.07)",
              opacity: material.locked ? 0.7 : 1,
            }}
            onClick={() => !material.locked && setPreviewMaterial(material)}
          >
            {/* Card Header */}
            <div
              className="p-4 relative overflow-hidden"
              style={{
                background: material.locked
                  ? "#F8FAFC"
                  : `linear-gradient(135deg, ${material.gradientFrom}15, ${material.gradientTo}08)`,
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: material.locked ? "#F1F5F9" : material.iconBg }}
                >
                  {material.locked ? (
                    <Lock size={17} color="#CBD5E1" />
                  ) : (
                    <material.icon size={17} color={material.iconColor} />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {material.required && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "#FEF3C7", color: "#92400E", fontSize: "0.65rem" }}
                    >
                      Wajib
                    </span>
                  )}
                  {readMaterials.has(material.id) && (
                    <CheckCircle size={16} color="#10B981" />
                  )}
                  {material.locked && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "#F1F5F9", color: "#94A3B8", fontSize: "0.65rem" }}
                    >
                      Terkunci
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <span
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    background: material.locked ? "#F1F5F9" : material.iconBg,
                    color: material.locked ? "#94A3B8" : material.iconColor,
                    fontSize: "0.65rem",
                  }}
                >
                  {material.category}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              <h3
                className="mb-1"
                style={{
                  color: material.locked ? "#94A3B8" : "#1E293B",
                  fontSize: "0.9rem",
                }}
              >
                {material.title}
              </h3>
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{ color: material.locked ? "#CBD5E1" : "#64748B" }}
              >
                {material.subtitle}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span>{material.pages} halaman</span>
                <span>{material.size}</span>
              </div>

              {!material.locked ? (
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${material.gradientFrom}, ${material.gradientTo})`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(material.id);
                      setPreviewMaterial(material);
                    }}
                  >
                    <Eye size={12} />
                    {readMaterials.has(material.id) ? "Buka Lagi" : "Buka"}
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                    style={{ background: "#F8FAFC" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={13} color="#94A3B8" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl"
                  style={{ background: "#F8FAFC" }}
                >
                  <Lock size={12} color="#CBD5E1" />
                  <span className="text-xs text-slate-400">Tersedia setelah diterima</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div
        className="mt-6 rounded-3xl p-6 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 50%, #60A5FA 100%)",
          boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
        }}
      >
        <div>
          <h3 className="text-white mb-1">Semua selesai dibaca? 🎉</h3>
          <p className="text-blue-100 text-sm">
            Tandatangani kontrak kerja secara digital dan konfirmasi kehadiranmu di hari pertama
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          Tandatangani Kontrak
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}
