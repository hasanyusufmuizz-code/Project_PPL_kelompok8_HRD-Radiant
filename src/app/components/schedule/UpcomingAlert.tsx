import { AlertTriangle } from "lucide-react";

interface UpcomingAlertProps {
  title: string;
  message: string;
}

export function UpcomingAlert({ title, message }: UpcomingAlertProps) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all duration-200 hover:shadow-md"
      style={{
        background: "linear-gradient(135deg, #FEF9C3 0%, #FEF3C7 100%)",
        border: "1px solid #FDE047",
        boxShadow: "0 2px 12px rgba(234,179,8,0.15)",
      }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "#FEF08A" }}
      >
        <AlertTriangle size={14} color="#D97706" />
      </div>
      <div>
        <p className="text-xs font-semibold text-amber-800 leading-tight">{title}</p>
        <p className="text-xs text-amber-600 leading-tight">{message}</p>
      </div>
    </div>
  );
}
