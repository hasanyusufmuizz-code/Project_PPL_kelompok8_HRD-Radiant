import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
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
          { path: "dashboard", Component: DashboardPage },
          { path: "profil",    Component: ProfilePage   },
        ],
      },
    ],
  },
]);
