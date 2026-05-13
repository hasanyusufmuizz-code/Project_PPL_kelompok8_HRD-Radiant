import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, BookOpen, ArrowRight, CheckCircle } from "lucide-react";

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  const features = [
    "Pantau status lamaran secara real-time",
    "Terima notifikasi jadwal tes otomatis",
    "Akses materi onboarding kapan saja",
    "Upload dokumen dengan mudah & aman",
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 60%, #F0F9FF 100%)" }}
    >
      {/* Left Panel - Illustration */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1D4ED8 0%, #3B82F6 40%, #60A5FA 100%)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.3)" }}
        />
        <div
          className="absolute top-40 -right-16 w-60 h-60 rounded-full opacity-10"
          style={{ background: "rgba(255,255,255,0.3)" }}
        />
        <div
          className="absolute -bottom-10 left-20 w-48 h-48 rounded-full opacity-15"
          style={{ background: "rgba(255,255,255,0.3)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen size={20} color="white" />
            </div>
            <span className="text-white text-xl font-semibold">Radiant Edu</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-white mb-3" style={{ fontSize: "2rem", lineHeight: "1.3" }}>
              Wujudkan Karirmu<br />Bersama Kami ✨
            </h1>
            <p className="text-blue-100 text-base leading-relaxed">
              Platform rekrutmen modern yang transparan dan efisien. Ikuti setiap tahap seleksi dengan percaya diri.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={12} color="white" />
                </div>
                <span className="text-blue-50 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "2.4K+", label: "Pelamar" },
              { value: "89%", label: "Kepuasan" },
              { value: "156", label: "Diterima" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 text-center"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)" }}
              >
                <div className="text-white font-semibold" style={{ fontSize: "1.25rem" }}>{stat.value}</div>
                <div className="text-blue-200" style={{ fontSize: "0.75rem" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative z-10">
          <div
            className="rounded-2xl overflow-hidden h-40"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1758520144429-74037f3e6492?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBqb2IlMjBpbnRlcnZpZXclMjBjYXJlZXJ8ZW58MXx8fHwxNzc3MjEwNjA2fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Professional Career"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
            >
              <BookOpen size={16} color="white" />
            </div>
            <span className="font-semibold text-slate-800">Radiant Edu</span>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(147,197,253,0.3)",
              boxShadow: "0 20px 60px rgba(59,130,246,0.1)",
            }}
          >
            {/* Tab Switch */}
            <div
              className="flex rounded-2xl p-1 mb-8"
              style={{ background: "#F1F5F9" }}
            >
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  !isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                }`}
              >
                Daftar
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-slate-800 mb-1">
                {isLogin ? "Selamat Datang Kembali! 👋" : "Buat Akun Baru ✨"}
              </h2>
              <p className="text-sm text-slate-500">
                {isLogin
                  ? "Masuk untuk melanjutkan perjalanan karirmu"
                  : "Daftar dan mulai perjalanan rekrutmenmu"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Muhammad Daffa Ardiansyah"
                      className="w-full pl-4 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-300"
                      style={{
                        background: "#F8FAFC",
                        borderColor: "rgba(147,197,253,0.4)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(147,197,253,0.4)")}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="daffa@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-300"
                    style={{
                      background: "#F8FAFC",
                      borderColor: "rgba(147,197,253,0.4)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(147,197,253,0.4)")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-300"
                    style={{
                      background: "#F8FAFC",
                      borderColor: "rgba(147,197,253,0.4)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(147,197,253,0.4)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
                    Lupa password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] mt-2"
                style={{
                  background: loading
                    ? "#93C5FD"
                    : "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.35)",
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Masuk" : "Daftar Sekarang"}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Demo hint */}
            <div
              className="mt-6 p-3 rounded-xl text-center"
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
            >
              <p className="text-xs text-blue-600">
                💡 Demo: Klik "Masuk" untuk mengakses portal kandidat
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
