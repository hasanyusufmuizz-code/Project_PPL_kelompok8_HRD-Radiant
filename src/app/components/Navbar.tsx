import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  ChevronDown,
  LogOut,
  User,
  Briefcase,
  FileStack,
  Calendar,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { path: "/lowongan",  label: "Lowongan",   icon: Briefcase       },
  { path: "/berkas",    label: "Berkas",      icon: FileStack       },
  { path: "/jadwal",    label: "Jadwal",      icon: Calendar        },
  { path: "/materi-training", label: "Materi Training", icon: GraduationCap },
];

export function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initial = user?.namaLengkap?.[0]?.toUpperCase() ?? "U";

  return (
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
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
          >
            <BookOpen size={16} color="white" />
          </div>
          <span style={{ color: "#1E3A5F", fontSize: "1rem" }} className="font-semibold tracking-tight">
            Radiant Edu
          </span>
        </div>

        {/* Nav Links — desktop */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 group ${
                  isActive
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/70"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { border: "1px solid rgba(59,130,246,0.18)", boxShadow: "0 2px 8px rgba(59,130,246,0.10)" }
                  : { border: "1px solid transparent" }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} style={{ color: isActive ? "#2563EB" : undefined, transition: "color 0.15s" }} />
                  <span>{label}</span>
                  {isActive && (
                    <span
                      className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                      style={{ background: "#2563EB" }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200"
              style={{ border: "1px solid transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(147,197,253,0.3)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid transparent"; }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
              >
                {initial}
              </div>
              <span className="hidden sm:inline text-sm text-slate-700 font-medium max-w-[140px] truncate">{user?.namaLengkap || user?.email || "Pengguna"}</span>
              <ChevronDown size={13} className="hidden sm:block text-slate-400" />
            </button>

            {showProfile && (
              <div
                className="absolute right-0 top-12 w-48 rounded-2xl p-1 z-50"
                style={{
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 20px 60px rgba(59,130,246,0.16), 0 4px 16px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(147,197,253,0.3)",
                }}
              >
                <button
                  onClick={() => { navigate("/profil"); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <User size={14} /> Profil Saya
                </button>
                <button
                  onClick={() => { logout(); navigate("/login"); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Keluar
                </button>
              </div>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-3 pt-1 space-y-1"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(147,197,253,0.3)",
            boxShadow: "0 8px 24px rgba(59,130,246,0.08)",
          }}
        >
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/70"
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
