import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../../lib/api";

interface NotifItem {
  id: number;
  judul: string;
  pesan: string;
  tipe: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

const TIPE_DOT: Record<string, string> = {
  info: "#3B82F6",
  sukses: "#10B981",
  peringatan: "#F59E0B",
  urgent: "#EF4444",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} hari lalu`;
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function NotifBell() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    api.get<{ unreadCount: number; items: NotifItem[] }>("/notifikasi")
      .then((d) => { setItems(d.items); setUnread(d.unreadCount); })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // polling tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  // Tutup saat klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function markRead(n: NotifItem) {
    if (!n.isRead) {
      try {
        await api.patch(`/notifikasi/${n.id}/read`, {});
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
        setUnread((u) => Math.max(0, u - 1));
      } catch { /* abaikan */ }
    }
    if (n.linkUrl) { setOpen(false); navigate(n.linkUrl); }
  }

  async function markAll() {
    try {
      await api.patch("/notifikasi/read-all", {});
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnread(0);
    } catch { /* abaikan */ }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
        aria-label="Notifikasi"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white flex items-center justify-center font-medium"
            style={{ background: "#EF4444", fontSize: "0.6rem" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden z-50"
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(59,130,246,0.16), 0 4px 16px rgba(0,0,0,0.06)",
            border: "1px solid rgba(147,197,253,0.3)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-700">Notifikasi</h3>
              {unread > 0 && (
                <span className="text-white px-1.5 py-0.5 rounded-md" style={{ background: "#3B82F6", fontSize: "0.6rem" }}>
                  {unread} baru
                </span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                <CheckCheck size={13} /> Tandai semua
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                Belum ada notifikasi
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-50 hover:bg-blue-50/40 transition-colors"
                  style={{ background: n.isRead ? "transparent" : "#EFF6FF60" }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: n.isRead ? "#CBD5E1" : (TIPE_DOT[n.tipe] || "#3B82F6") }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700 truncate">{n.judul}</p>
                      <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.pesan}</p>
                  </div>
                  {n.isRead && <Check size={13} className="text-slate-300 flex-shrink-0 mt-1" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
