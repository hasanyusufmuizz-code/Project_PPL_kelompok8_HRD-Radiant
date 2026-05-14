import { Outlet, NavLink } from "react-router";
import { Toaster } from "sonner";
import { Briefcase, Users, Calendar, ClipboardCheck, FileText, BarChart3, ChevronDown, LayoutDashboard } from "lucide-react";

function AdminNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
            : "text-gray-600 hover:bg-blue-50/50 hover:text-blue-600"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-blue-100/50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="font-semibold text-blue-900">Admin HRD</h1>
              <div className="hidden md:flex items-center gap-1 flex-wrap">
                <AdminNavItem to="/admin/dashboard" icon={<LayoutDashboard className="size-4" />} label="Dashboard" />
                <AdminNavItem to="/admin/lowongan" icon={<Briefcase className="size-4" />} label="Lowongan" />
                <AdminNavItem to="/admin/pelamar" icon={<Users className="size-4" />} label="Pelamar" />
                <AdminNavItem to="/admin/jadwal" icon={<Calendar className="size-4" />} label="Jadwal" />
                <AdminNavItem to="/admin/penilaian" icon={<ClipboardCheck className="size-4" />} label="Penilaian" />
                <AdminNavItem to="/admin/dokumen" icon={<FileText className="size-4" />} label="Dokumen" />
                <AdminNavItem to="/admin/laporan" icon={<BarChart3 className="size-4" />} label="Laporan" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50/50 transition-colors cursor-pointer">
              <div className="size-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm">
                A
              </div>
              <span className="text-sm font-medium text-gray-700">Admin HRD</span>
              <ChevronDown className="size-4 text-gray-500" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
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
