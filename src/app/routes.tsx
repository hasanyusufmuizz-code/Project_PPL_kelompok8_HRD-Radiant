import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StatusPage } from "./pages/StatusPage";
import { SchedulePage } from "./pages/SchedulePage";
import { ResultPage } from "./pages/ResultPage";
import { DocumentPage } from "./pages/DocumentPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { useAuth } from "./context/AuthContext";

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Memuat...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <Navigate to="/login" replace />,
  },
  {
    // Halaman publik — jika sudah login redirect ke dashboard
    Component: PublicOnlyRoute,
    children: [
      { path: "/login", Component: LoginPage },
    ],
  },
  {
    // Halaman privat — harus login
    Component: PrivateRoute,
    children: [
      {
        path: "/",
        Component: MainLayout,
        children: [
          { path: "dashboard",  Component: DashboardPage  },
          { path: "status",     Component: StatusPage     },
          { path: "jadwal",     Component: SchedulePage   },
          { path: "hasil",      Component: ResultPage     },
          { path: "dokumen",    Component: DocumentPage   },
          { path: "onboarding", Component: OnboardingPage },
          { path: "profil",     Component: ProfilePage    },
        ],
      },
    ],
  },
]);