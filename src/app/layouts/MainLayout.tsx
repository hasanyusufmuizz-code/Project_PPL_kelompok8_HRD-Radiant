import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { Toaster } from "sonner";

export function MainLayout() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F0F9FF 100%)" }}>
      <Navbar />
      <main className="pt-20 pb-10">
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
