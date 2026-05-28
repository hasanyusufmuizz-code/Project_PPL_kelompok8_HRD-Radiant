import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Briefcase,
  FileStack,
  Calendar,
  Users,
  BookOpen,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const adminNav = [
  { path: "/admin/dashboard",  label: "Dashboard",     icon: LayoutDashboard },
  { path: "/admin/lowongan",   label: "Kelola Lowongan", icon: Briefcase     },
  { path: "/admin/berkas",     label: "Kelola Berkas", icon: FileStack       },
  { path: "/admin/jadwal",     label: "Jadwal Interview", icon: Calendar     },
  { path: "/admin/pelamar",    label: "Data Pelamar",  icon: Users           },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F4FF" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 flex-shrink-0"
        style={{
          width: sidebarOpen ? "240px" : "64px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(147,197,253,0.25)",
          boxShadow: "2px 0 20px rgba(59,130,246,0.06)",
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
          >
            <BookOpen size={16} color="white" />
          </div>
          {sidebarOpen && (
            <span style={{ color: "#1E3A5F", fontSize: "0.9rem" }} className="font-semibold tracking-tight whitespace-nowrap">
              Radiant HRD
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? <X size={15} className="text-slate-400" /> : <Menu size={15} className="text-slate-400" />}
          </button>
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="mx-3 mb-3 px-3 py-2 rounded-xl" style={{ background: "#EFF6FF" }}>
            <p className="text-xs text-blue-400">Login sebagai</p>
            <p className="text-sm font-medium text-blue-700 capitalize">{user?.role || "Admin"}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {adminNav.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/70"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} color={isActive ? "#2563EB" : undefined} className="flex-shrink-0" />
                  {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile dropdown */}
        <div className="p-3 border-t border-slate-100 relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
            >
              {user?.namaLengkap?.[0]?.toUpperCase() ?? "A"}
            </div>
            {sidebarOpen && (
              <>
                <span className="text-xs text-slate-700 font-medium truncate flex-1 text-left">
                  {user?.namaLengkap || user?.email || "Admin"}
                </span>
                <ChevronDown size={12} className="text-slate-400 flex-shrink-0" />
              </>
            )}
          </button>

          {showProfile && (
            <div
              className="absolute bottom-16 left-3 right-3 rounded-2xl p-1 z-50"
              style={{
                background: "rgba(255,255,255,0.97)",
                boxShadow: "0 20px 60px rgba(59,130,246,0.16), 0 4px 16px rgba(0,0,0,0.06)",
                border: "1px solid rgba(147,197,253,0.3)",
              }}
            >
              <button
                onClick={() => { navigate("/admin/profil"); setShowProfile(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <User size={14} /> Profil Saya
              </button>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Keluar
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
