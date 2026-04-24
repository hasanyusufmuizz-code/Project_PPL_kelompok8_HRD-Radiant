import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart2,
  Upload,
  BookOpen,
  Bell,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/status", label: "Status", icon: FileText },
  { path: "/jadwal", label: "Jadwal", icon: Calendar },
  { path: "/hasil", label: "Hasil Tes", icon: BarChart2 },
  { path: "/dokumen", label: "Dokumen", icon: Upload },
  { path: "/onboarding", label: "Onboarding", icon: BookOpen },
];

export function Navbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, text: "Jadwal Micro Teaching: Kamis, 10 April 2026", time: "2 jam lalu", unread: true, isNew: true },
    { id: 2, text: "Dokumen CV kamu telah diverifikasi ✓", time: "1 hari lalu", unread: true, isNew: true },
    { id: 3, text: "Selamat! Kamu lolos seleksi administrasi", time: "3 hari lalu", unread: false, isNew: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

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
      <div className="max-w-[1440px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
          >
            <BookOpen size={16} color="white" />
          </div>
          <span style={{ color: "#1E3A5F", fontSize: "1rem" }} className="font-semibold tracking-tight">
            TalentPath
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-0.5">
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
                  ? {
                      border: "1px solid rgba(59,130,246,0.18)",
                      boxShadow: "0 2px 8px rgba(59,130,246,0.10)",
                    }
                  : { border: "1px solid transparent" }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={15}
                    style={{
                      color: isActive ? "#2563EB" : undefined,
                      transition: "color 0.15s",
                    }}
                  />
                  <span>{label}</span>
                  {/* Active underline indicator */}
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
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              style={{ border: "1px solid transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(147,197,253,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = "1px solid transparent";
              }}
            >
              <Bell
                size={18}
                className={unreadCount > 0 ? "animate-wiggle" : ""}
              />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white animate-pulse"
                  style={{ background: "#EF4444", fontSize: "0.625rem" }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div
                className="absolute right-0 top-12 w-84 rounded-2xl p-1 z-50"
                style={{
                  width: "320px",
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 20px 60px rgba(59,130,246,0.16), 0 4px 16px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(147,197,253,0.3)",
                }}
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Notifikasi</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "#EFF6FF", color: "#2563EB" }}
                  >
                    {unreadCount} baru
                  </span>
                </div>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 rounded-xl mx-1 my-0.5 cursor-pointer hover:bg-blue-50/60 transition-colors ${notif.unread ? "bg-blue-50/40" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {notif.unread && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 animate-pulse" />
                      )}
                      <div className={`flex-1 ${notif.unread ? "" : "ml-3.5"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-slate-700 leading-relaxed flex-1">{notif.text}</p>
                          {notif.isNew && (
                            <span
                              className="text-white flex-shrink-0 px-1.5 py-0.5 rounded-md"
                              style={{ background: "#3B82F6", fontSize: "0.55rem", letterSpacing: "0.05em" }}
                            >
                              BARU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2 border-t border-slate-100">
                  <button
                    onClick={() => navigate("/jadwal")}
                    className="w-full text-xs text-blue-500 hover:text-blue-700 transition-colors py-1"
                  >
                    Lihat semua notifikasi →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200"
              style={{ border: "1px solid transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(147,197,253,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = "1px solid transparent";
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
              >
                D
              </div>
              <span className="text-sm text-slate-700 font-medium">Daffa</span>
              <ChevronDown size={13} className="text-slate-400" />
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
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <User size={14} />
                  Profil Saya
                </button>
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
      </div>
    </nav>
  );
}