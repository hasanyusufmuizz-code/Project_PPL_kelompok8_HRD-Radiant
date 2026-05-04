import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Briefcase,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
interface Lowongan {
  id: number;
  posisi: string;
  departemen: string;
  deadline: string;
  status: "Aktif" | "Ditutup" | "Draft";
  pelamar: number;
  deskripsi: string;
}

// ─────────────────────────────────────────────
//  Shared card / glass style
// ─────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(147,197,253,0.25)",
  boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
  borderRadius: "1.5rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.875rem",
  borderRadius: "0.75rem",
  border: "1px solid rgba(147,197,253,0.4)",
  background: "rgba(248,250,252,0.8)",
  fontSize: "0.875rem",
  color: "#334155",
  outline: "none",
};

// ─────────────────────────────────────────────
//  Status badge
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: Lowongan["status"] }) {
  const map = {
    Aktif: { bg: "#ECFDF5", color: "#065F46", dot: "#10B981" },
    Ditutup: { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" },
    Draft: { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B" },
  };
  const s = map[status];
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────
//  Modal Tambah / Edit Lowongan
// ─────────────────────────────────────────────
interface ModalProps {
  item: Partial<Lowongan> | null;
  onClose: () => void;
  onSave: (data: Omit<Lowongan, "id" | "pelamar">) => void;
}

function LowonganModal({ item, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({
    posisi: item?.posisi ?? "",
    departemen: item?.departemen ?? "",
    deadline: item?.deadline ?? "",
    status: (item?.status ?? "Draft") as Lowongan["status"],
    deskripsi: item?.deskripsi ?? "",
  });

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit() {
    if (!form.posisi.trim() || !form.deadline) {
      toast.error("Posisi dan deadline wajib diisi!");
      return;
    }
    onSave(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div style={{ ...card, width: "100%", maxWidth: 540 }} className="p-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              {item?.id ? "Edit Lowongan" : "Tambah Lowongan"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {item?.id ? "Perbarui data lowongan" : "Buat lowongan pekerjaan baru"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Posisi */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Posisi <span className="text-red-400">*</span>
            </label>
            <input
              name="posisi"
              value={form.posisi}
              onChange={handle}
              placeholder="contoh: Software Engineer"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Departemen & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Departemen
              </label>
              <input
                name="departemen"
                value={form.departemen}
                onChange={handle}
                placeholder="contoh: IT"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Deadline <span className="text-red-400">*</span>
              </label>
              <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handle}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handle}
              style={inputStyle}
            >
              <option value="Draft">Draft</option>
              <option value="Aktif">Aktif</option>
              <option value="Ditutup">Ditutup</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Deskripsi Lowongan
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handle}
              rows={3}
              placeholder="Uraikan tanggung jawab dan persyaratan posisi..."
              style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-all"
              style={{ border: "1px solid rgba(147,197,253,0.4)" }}
            >
              Batal
            </button>
            <button
              onClick={submit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
              }}
            >
              <Save size={14} />
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Confirm Delete Modal
// ─────────────────────────────────────────────
function ConfirmModal({
  posisi,
  onConfirm,
  onClose,
}: {
  posisi: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div style={{ ...card, width: "100%", maxWidth: 420 }} className="p-7 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#FEF2F2" }}
        >
          <AlertCircle size={22} color="#EF4444" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Hapus Lowongan?</h3>
        <p className="text-sm text-slate-500 mb-6">
          Lowongan <strong>{posisi}</strong> akan dihapus secara permanen.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-all"
            style={{ border: "1px solid rgba(147,197,253,0.4)" }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", boxShadow: "0 4px 16px rgba(239,68,68,0.25)" }}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
const initialData: Lowongan[] = [
  { id: 1, posisi: "Software Engineer", departemen: "IT", deadline: "2026-05-01", status: "Aktif", pelamar: 45, deskripsi: "Mengembangkan dan memelihara aplikasi web perusahaan." },
  { id: 2, posisi: "Data Analyst", departemen: "Riset", deadline: "2026-04-25", status: "Aktif", pelamar: 32, deskripsi: "Menganalisis data rekrutmen dan menyajikan laporan." },
  { id: 3, posisi: "UI/UX Designer", departemen: "Produk", deadline: "2026-04-20", status: "Ditutup", pelamar: 28, deskripsi: "Merancang antarmuka yang intuitif dan estetis." },
  { id: 4, posisi: "Product Manager", departemen: "Produk", deadline: "2026-05-10", status: "Aktif", pelamar: 18, deskripsi: "Memimpin siklus pengembangan produk dari ideasi hingga rilis." },
];

export function AdminLowonganPage() {
  const [data, setData] = useState<Lowongan[]>(initialData);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Lowongan | null>(null);

  // ── Computed ──────────────────────────────
  const filtered = data.filter((l) => {
    const matchSearch = l.posisi.toLowerCase().includes(search.toLowerCase()) ||
      l.departemen.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: data.length,
    aktif: data.filter((d) => d.status === "Aktif").length,
    ditutup: data.filter((d) => d.status === "Ditutup").length,
    draft: data.filter((d) => d.status === "Draft").length,
  };

  // ── Handlers ──────────────────────────────
  function handleSave(formData: Omit<Lowongan, "id" | "pelamar">) {
    if (selected?.id) {
      // edit
      setData((prev) =>
        prev.map((l) => (l.id === selected.id ? { ...l, ...formData } : l))
      );
      toast.success(`Lowongan "${formData.posisi}" berhasil diperbarui!`);
    } else {
      // tambah
      const newId = Math.max(0, ...data.map((d) => d.id)) + 1;
      setData((prev) => [...prev, { id: newId, pelamar: 0, ...formData }]);
      toast.success(`Lowongan "${formData.posisi}" berhasil ditambahkan!`);
    }
    closeModal();
  }

  function handleDelete() {
    if (!selected) return;
    setData((prev) => prev.filter((l) => l.id !== selected.id));
    toast.success(`Lowongan "${selected.posisi}" berhasil dihapus.`);
    closeModal();
  }

  function closeModal() {
    setModal(null);
    setSelected(null);
  }

  // ── Summary stat cards ────────────────────
  const stats = [
    { label: "Total Lowongan", value: counts.total, icon: Briefcase, color: "#3B82F6", bg: "#EFF6FF" },
    { label: "Aktif", value: counts.aktif, icon: CheckCircle, color: "#10B981", bg: "#ECFDF5" },
    { label: "Ditutup", value: counts.ditutup, icon: XCircle, color: "#64748B", bg: "#F1F5F9" },
    { label: "Total Pelamar", value: data.reduce((a, b) => a + b.pelamar, 0), icon: Users, color: "#8B5CF6", bg: "#F5F3FF" },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-slate-800 mb-1" style={{ fontSize: "1.375rem", fontWeight: 600 }}>
            Kelola Lowongan
          </h1>
          <p className="text-sm text-slate-400">Tambah, edit, dan kelola lowongan pekerjaan yang tersedia</p>
        </div>
        <button
          onClick={() => { setSelected(null); setModal("add"); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
            boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
          }}
        >
          <Plus size={15} />
          Tambah Lowongan
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={card} className="p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-xl">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}
            >
              <Icon size={20} color={color} />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div style={card} className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari posisi atau departemen..."
              style={{ ...inputStyle, paddingLeft: "2.25rem" }}
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F1F5F9" }}>
            {["Semua", "Aktif", "Ditutup", "Draft"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  filterStatus === s
                    ? { background: "white", color: "#2563EB", boxShadow: "0 1px 4px rgba(59,130,246,0.15)" }
                    : { color: "#64748B" }
                }
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <Filter size={12} />
            {filtered.length} dari {data.length} lowongan
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Posisi", "Departemen", "Deadline", "Pelamar", "Status", "Aksi"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    style={h === "Aksi" ? { textAlign: "right" } : {}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase size={28} className="text-slate-300" />
                      Tidak ada lowongan yang ditemukan
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Posisi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "#EFF6FF" }}
                        >
                          <Briefcase size={15} color="#3B82F6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.posisi}</p>
                          {item.deskripsi && (
                            <p className="text-xs text-slate-400 mt-0.5 max-w-[240px] truncate">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Departemen */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{item.departemen || "–"}</span>
                    </td>

                    {/* Deadline */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar size={13} className="text-slate-400" />
                        {item.deadline}
                      </div>
                    </td>

                    {/* Pelamar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "#EFF6FF", color: "#2563EB" }}
                        >
                          {item.pelamar} pelamar
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelected(item); setModal("edit"); }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => { setSelected(item); setModal("delete"); }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {(modal === "add" || modal === "edit") && (
        <LowonganModal
          item={modal === "edit" ? selected : null}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
      {modal === "delete" && selected && (
        <ConfirmModal
          posisi={selected.posisi}
          onConfirm={handleDelete}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
