import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle,
  Shield,
  Edit3,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

const inputStyle = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  borderRadius: "0.75rem",
  border: "1px solid rgba(147,197,253,0.4)",
  background: "rgba(248,250,252,0.8)",
  fontSize: "0.875rem",
  color: "#334155",
  outline: "none",
  transition: "all 0.2s",
} as React.CSSProperties;

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "#64748B",
  marginBottom: "0.375rem",
} as React.CSSProperties;

const cardStyle = {
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(147,197,253,0.25)",
  boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
  borderRadius: "1.5rem",
  padding: "1.5rem",
} as React.CSSProperties;

export function ProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "security">("personal");

  const [form, setForm] = useState({
    namaLengkap: "Muhammad Daffa",
    email: "daffa@example.com",
    noHp: "081234567890",
    alamat: "Jl. Merdeka No. 10, Bandung",
    posisi: "Guru Matematika",
    pendidikan: "S1 Pendidikan Matematika",
    instansi: "Universitas Pendidikan Indonesia",
    tentang: "Seorang calon tenaga pendidik yang berdedikasi dengan pengalaman mengajar selama 2 tahun.",
  });

  const [passwordForm, setPasswordForm] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  }

  function handleSave() {
    setSaved(true);
    toast.success("Profil berhasil diperbarui!", { duration: 3000 });
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSavePassword() {
    if (passwordForm.passwordBaru !== passwordForm.konfirmasiPassword) {
      toast.error("Password baru tidak cocok!");
      return;
    }
    if (passwordForm.passwordBaru.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }
    toast.success("Password berhasil diperbarui!");
    setPasswordForm({ passwordLama: "", passwordBaru: "", konfirmasiPassword: "" });
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(147,197,253,0.3)" }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-slate-800" style={{ fontSize: "1.375rem" }}>
              Edit Profil
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Kelola informasi pribadi dan akun kamu</p>
          </div>
        </div>
        {activeTab === "personal" && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", boxShadow: "0 4px 16px rgba(37,99,235,0.25)" }}
          >
            {saved ? <CheckCircle size={15} /> : <Save size={15} />}
            {saved ? "Tersimpan!" : "Simpan Perubahan"}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 p-1 w-fit rounded-2xl"
        style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(147,197,253,0.2)" }}
      >
        {[
          { key: "personal", label: "Informasi Pribadi", icon: User },
          { key: "security", label: "Keamanan Akun", icon: Shield },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "personal" | "security")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200"
            style={
              activeTab === key
                ? {
                    background: "white",
                    color: "#2563EB",
                    fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.15)",
                  }
                : { color: "#64748B" }
            }
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "personal" && (
        <div className="grid grid-cols-3 gap-5">
          {/* Left - Avatar Card */}
          <div className="col-span-1 space-y-5">
            {/* Avatar */}
            <div style={cardStyle}>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-semibold overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)", boxShadow: "0 8px 24px rgba(99,102,241,0.28)" }}
                  >
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      "D"
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110"
                    style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
                  >
                    <Camera size={13} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <p className="text-sm font-semibold text-slate-700">{form.namaLengkap}</p>
                <p className="text-xs text-slate-400 mt-0.5">{form.posisi}</p>
                <div
                  className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs"
                  style={{ background: "#ECFDF5", color: "#065F46" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Kandidat Aktif
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                {[
                  { icon: Mail, value: form.email },
                  { icon: Phone, value: form.noHp },
                  { icon: MapPin, value: form.alamat },
                ].map(({ icon: Icon, value }, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
                      <Icon size={12} color="#3B82F6" />
                    </div>
                    <span className="text-xs text-slate-500 truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Card */}
            <div style={cardStyle}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">Kelengkapan Profil</p>
                <span className="text-sm font-semibold text-blue-600">85%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: "85%", background: "linear-gradient(90deg, #2563EB, #3B82F6)" }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Tambahkan foto profil untuk melengkapi data kamu</p>
            </div>
          </div>

          {/* Right - Form */}
          <div className="col-span-2 space-y-5">
            {/* Personal Info */}
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                  <Edit3 size={14} color="#3B82F6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Data Pribadi</h3>
                  <p className="text-xs text-slate-400">Informasi dasar yang akan ditampilkan di profil kamu</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Nama Lengkap</label>
                  <input
                    style={inputStyle}
                    value={form.namaLengkap}
                    onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>No. Handphone</label>
                  <input
                    style={inputStyle}
                    value={form.noHp}
                    onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Alamat</label>
                  <input
                    style={inputStyle}
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F5F3FF" }}>
                  <Briefcase size={14} color="#8B5CF6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Informasi Profesional</h3>
                  <p className="text-xs text-slate-400">Latar belakang pendidikan dan posisi yang dilamar</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Posisi yang Dilamar</label>
                  <div className="relative">
                    <Briefcase size={14} color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                      value={form.posisi}
                      onChange={(e) => setForm({ ...form, posisi: e.target.value })}
                      onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Pendidikan Terakhir</label>
                  <div className="relative">
                    <GraduationCap size={14} color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                      value={form.pendidikan}
                      onChange={(e) => setForm({ ...form, pendidikan: e.target.value })}
                      onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label style={labelStyle}>Institusi Pendidikan</label>
                  <input
                    style={inputStyle}
                    value={form.instansi}
                    onChange={(e) => setForm({ ...form, instansi: e.target.value })}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            </div>

            {/* About */}
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FFFBEB" }}>
                  <User size={14} color="#F59E0B" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Tentang Saya</h3>
                  <p className="text-xs text-slate-400">Ceritakan sedikit tentang dirimu kepada tim rekrutmen</p>
                </div>
              </div>
              <textarea
                rows={4}
                style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                value={form.tentang}
                onChange={(e) => setForm({ ...form, tentang: e.target.value })}
                onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <p className="text-xs text-slate-400 mt-1.5 text-right">{form.tentang.length} / 300 karakter</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="max-w-2xl">
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <Lock size={14} color="#3B82F6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Ubah Password</h3>
                <p className="text-xs text-slate-400">Gunakan password yang kuat untuk keamanan akunmu</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: "passwordLama", label: "Password Lama", show: showPassword, toggle: () => setShowPassword(!showPassword) },
                { key: "passwordBaru", label: "Password Baru", show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword) },
                { key: "konfirmasiPassword", label: "Konfirmasi Password Baru", show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword) },
              ].map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      style={{ ...inputStyle, paddingRight: "2.75rem" }}
                      value={passwordForm[key as keyof typeof passwordForm]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                      placeholder="••••••••"
                      onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(147,197,253,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <button
                      onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "#EFF6FF", border: "1px solid rgba(147,197,253,0.3)" }}>
                  <Shield size={13} color="#3B82F6" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-600 leading-relaxed">
                    Password minimal 8 karakter, disarankan menggunakan kombinasi huruf besar, kecil, angka, dan simbol.
                  </p>
                </div>

                <button
                  onClick={handleSavePassword}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", boxShadow: "0 4px 16px rgba(37,99,235,0.25)" }}
                >
                  <Lock size={14} />
                  Perbarui Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
