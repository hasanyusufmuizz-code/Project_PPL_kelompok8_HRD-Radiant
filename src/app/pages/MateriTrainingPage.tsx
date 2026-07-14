import { useEffect, useState } from "react";
import { BookOpen, Download, Lock, User } from "lucide-react";
import { api } from "../../lib/api";

interface Materi {
  id: number;
  judul: string;
  deskripsi: string | null;
  nama_file: string;
  file_url: string;
  pemateri_nama: string;
}

export function MateriTrainingPage() {
  const [list, setList] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get<Materi[]>("/materi-training")
      .then(setList)
      .catch((err: Error) => {
        if (err.message === "Anda belum memiliki akses ke halaman ini") setForbidden(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Materi Training</h1>
        <p className="text-sm text-slate-500 mt-1">Materi onboarding dan dokumen training pengajar baru</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          Memuat...
        </div>
      ) : forbidden ? (
        <div className="p-12 text-center rounded-2xl" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <Lock size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">Anda belum memiliki akses ke halaman ini</p>
        </div>
      ) : list.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)" }}>
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada materi training tersedia</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((m) => (
            <div key={m.id} className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.2)", boxShadow: "0 2px 12px rgba(59,130,246,0.06)" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)" }}>
                  <BookOpen size={18} color="#3B82F6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">{m.judul}</h3>
                  {m.deskripsi && <p className="text-xs text-slate-500 mt-1">{m.deskripsi}</p>}
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-2"><User size={11} /> {m.pemateri_nama}</p>
                </div>
              </div>
              <a
                href={`http://localhost:3001${m.file_url}`}
                target="_blank"
                rel="noreferrer"
                download
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: "linear-gradient(135deg,#2563EB,#3B82F6)" }}
              >
                <Download size={14} /> Unduh
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
