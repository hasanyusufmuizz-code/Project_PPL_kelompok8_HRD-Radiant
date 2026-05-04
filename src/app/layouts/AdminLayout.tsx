import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Briefcase, LogOut, ChevronDown } from "lucide-react";
import { Toaster } from "sonner";

const navItems = [
  { path: "/admin/lowongan", label: "Kelola Lowongan", icon: Briefcase },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F0F9FF 100%)" }}
    >
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(147,197,253,0.3)",
          boxShadow: "0 2px 20px rgba(59,130,246,0.07)",
        }}
      >
        <div className="max-w-[1440px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
            >
              <Briefcase size={15} color="white" />
            </div>
            <div>
              <span style={{ color: "#1E3A5F", fontSize: "0.9375rem" }} className="font-semibold tracking-tight">
                Admin HRD
              </span>
              <span
                className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#EFF6FF", color: "#2563EB" }}
              >
                Radiant Edu
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200"
                  style={
                    isActive
                      ? {
                          color: "#2563EB",
                          background: "#EFF6FF",
                          fontWeight: 500,
                          border: "1px solid rgba(59,130,246,0.18)",
                          boxShadow: "0 2px 8px rgba(59,130,246,0.10)",
                        }
                      : { color: "#64748B", border: "1px solid transparent" }
                  }
                >
                  <Icon size={15} />
                  <span>{label}</span>
                  {isActive && (
                    <span
                      className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                      style={{ background: "#2563EB" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right – Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200"
              style={{ border: "1px solid transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.border = "1px solid rgba(147,197,253,0.3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.border = "1px solid transparent")
              }
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
              >
                A
              </div>
              <span className="text-sm text-slate-700 font-medium">Admin HRD</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showProfile && (
              <div
                className="absolute right-0 top-12 w-44 rounded-2xl p-1 z-50"
                style={{
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 20px 60px rgba(59,130,246,0.16), 0 4px 16px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(147,197,253,0.3)",
                }}
              >
                <button
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-10">
        <Outlet />
      </main>

      <Toaster
        position="bottom-right"
        expand={false}
        richColors={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(147,197,253,0.3)",
            boxShadow: "0 8px 40px rgba(59,130,246,0.13)",
            borderRadius: "14px",
            fontSize: "0.8125rem",
            color: "#334155",
          },
        }}
      />
    </div>
  );
}
