import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DaftarLowonganPage } from "./pages/DaftarLowonganPage";
import { UploadBerkasPage } from "./pages/UploadBerkasPage";
import { JadwalPage } from "./pages/JadwalPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { KelolaLowonganPage } from "./pages/admin/KelolaLowonganPage";
import { KelolaBerkasPage } from "./pages/admin/KelolaBerkasPage";
import { AdminJadwalPage } from "./pages/admin/AdminJadwalPage";
import { AdminPelamarPage } from "./pages/admin/AdminPelamarPage";
import { ApprovalKandidatPage } from "./pages/admin/ApprovalKandidatPage";
import { KelolaUserPage } from "./pages/admin/KelolaUserPage";
import { useAuth } from "./context/AuthContext";

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Memuat...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Outlet />;
  const isAdmin = user?.role === "admin" || user?.role === "hrd";
  return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
}

function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin" && user.role !== "hrd") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <Navigate to="/login" replace />,
  },
  {
    Component: PublicOnlyRoute,
    children: [
      { path: "/login", Component: LoginPage },
    ],
  },
  {
    Component: PrivateRoute,
    children: [
      {
        path: "/",
        Component: MainLayout,
        children: [
          { path: "dashboard",  Component: DashboardPage       },
          { path: "lowongan",   Component: DaftarLowonganPage  },
          { path: "berkas",     Component: UploadBerkasPage    },
          { path: "jadwal",     Component: JadwalPage          },
          { path: "profil",     Component: ProfilePage         },
        ],
      },
    ],
  },
  {
    Component: AdminRoute,
    children: [
      {
        path: "/admin",
        Component: AdminLayout,
        children: [
          { index: true,         Component: AdminDashboardPage  },
          { path: "dashboard",   Component: AdminDashboardPage  },
          { path: "lowongan",    Component: KelolaLowonganPage  },
          { path: "berkas",      Component: KelolaBerkasPage    },
          { path: "jadwal",      Component: AdminJadwalPage     },
          { path: "pelamar",     Component: AdminPelamarPage    },
          { path: "approval",    Component: ApprovalKandidatPage},
          { path: "users",       Component: KelolaUserPage      },
          { path: "profil",      Component: ProfilePage         },
        ],
      },
    ],
  },
]);
