import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
]);