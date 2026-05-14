import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StatusPage } from "./pages/StatusPage";
import { SchedulePage } from "./pages/SchedulePage";
import { ResultPage } from "./pages/ResultPage";
import { DocumentPage } from "./pages/DocumentPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { LowonganPage } from "./pages/admin/LowonganPage";
import { PelamarPage } from "./pages/admin/PelamarPage";
import { JadwalPage } from "./pages/admin/JadwalPage";
import { PenilaianPage } from "./pages/admin/PenilaianPage";
import { AdminDokumenPage } from "./pages/admin/AdminDokumenPage";
import { LaporanPage } from "./pages/admin/LaporanPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { path: "dashboard", Component: DashboardPage },
      { path: "status", Component: StatusPage },
      { path: "jadwal", Component: SchedulePage },
      { path: "hasil", Component: ResultPage },
      { path: "dokumen", Component: DocumentPage },
      { path: "onboarding", Component: OnboardingPage },
      { path: "profil", Component: ProfilePage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { path: "", Component: () => <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", Component: AdminDashboardPage },
      { path: "lowongan", Component: LowonganPage },
      { path: "pelamar", Component: PelamarPage },
      { path: "jadwal", Component: JadwalPage },
      { path: "penilaian", Component: PenilaianPage },
      { path: "dokumen", Component: AdminDokumenPage },
      { path: "laporan", Component: LaporanPage },
    ],
  },
]);