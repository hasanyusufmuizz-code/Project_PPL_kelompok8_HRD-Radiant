import { NavLink } from "react-router";
import { LayoutDashboard, BookOpen } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {

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
          {/* Profile */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ border: "1px solid rgba(147,197,253,0.3)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-medium"
              style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
            >
              D
            </div>
            <span className="text-sm text-slate-700 font-medium">Daffa</span>
          </div>
        </div>
      </div>
    </nav>
  );
}