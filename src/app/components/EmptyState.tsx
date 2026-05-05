import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Illustration circle */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5 relative"
        style={{
          background: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)",
          border: "1.5px dashed rgba(147,197,253,0.6)",
        }}
      >
        {/* Decorative rings */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{ boxShadow: "0 0 0 8px rgba(219,234,254,0.3)" }}
        />
        <div className="relative z-10 text-blue-400">{icon}</div>
      </div>

      <h3
        className="mb-2"
        style={{ color: "#334155", fontSize: "1rem" }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed max-w-xs mb-6"
        style={{ color: "#94A3B8" }}
      >
        {description}
      </p>

      <div className="flex items-center gap-3">
        {actionLabel && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-md"
            style={{
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
            }}
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            className="px-5 py-2.5 rounded-xl text-sm transition-all hover:bg-slate-100"
            style={{
              background: "#F1F5F9",
              color: "#64748B",
            }}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
