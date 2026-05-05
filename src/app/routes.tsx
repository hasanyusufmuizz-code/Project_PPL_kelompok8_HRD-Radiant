import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StatusPage } from "./pages/StatusPage";
import { SchedulePage } from "./pages/SchedulePage";
import { ResultPage } from "./pages/ResultPage";
import { DocumentPage } from "./pages/DocumentPage";
import { OnboardingPage } from "./pages/OnboardingPage";

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
    ],
  },
]);