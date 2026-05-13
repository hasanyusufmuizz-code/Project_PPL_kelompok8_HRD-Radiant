import { useState } from "react";
import { Search, Filter, Eye, CheckCircle, XCircle, Calendar, FileText, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    "Lulus": "bg-green-100 text-green-700 border-green-200",
    "Tidak Lulus": "bg-red-100 text-red-700 border-red-200",
    "Menunggu": "bg-gray-100 text-gray-700 border-gray-200",
    "Menunggu Tes": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Terverifikasi": "bg-green-100 text-green-700 border-green-200",
    "Belum Diproses": "bg-gray-100 text-gray-700 border-gray-200",
    "Lulus Tes": "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <Badge className={variants[status] || "bg-blue-100 text-blue-700 border-blue-200"}>
      {status}
    </Badge>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-all ${
        active ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-3 border-b border-blue-50/50 last:border-0">
      <p className="text-sm font-medium text-gray-700 w-32 shrink-0">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

function FileItem({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-blue-50/30 transition-colors">
      <div className="p-2 rounded-lg bg-blue-100">
        <FileText className="size-5 text-blue-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function DetailPelamarPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("profil");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="hover:bg-blue-50">
        <X className="size-4" />
        Kembali
      </Button>

      <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="size-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-medium">
              S
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Sarah Wijaya</h3>
              <p className="text-sm text-gray-600 mt-1">sarah.wijaya@email.com • +62 812-3456-7890</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Software Engineer</Badge>
                <StatusBadge status="Menunggu Tes" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-b border-blue-100/50 mb-6">
            <TabButton label="Profil" active={activeTab === "profil"} onClick={() => setActiveTab("profil")} />
            <TabButton label="Berkas" active={activeTab === "berkas"} onClick={() => setActiveTab("berkas")} />
            <TabButton label="Status" active={activeTab === "status"} onClick={() => setActiveTab("status")} />
          </div>

          {activeTab === "profil" && (
            <div className="space-y-4">
              <InfoRow label="Pendidikan" value="S1 Teknik Informatika - Universitas Indonesia" />
              <InfoRow label="Pengalaman" value="3 tahun sebagai Software Developer" />
              <InfoRow label="Keahlian" value="React, Node.js, PostgreSQL, TypeScript" />
              <InfoRow label="Tanggal Lahir" value="15 Januari 1998" />
              <InfoRow label="Alamat" value="Jakarta Selatan, DKI Jakarta" />
            </div>
          )}

          {activeTab === "berkas" && (
            <div className="space-y-3">
              <FileItem name="CV_Sarah_Wijaya.pdf" status="Terverifikasi" />
              <FileItem name="Ijazah_S1.pdf" status="Terverifikasi" />
              <FileItem name="Sertifikat_AWS.pdf" status="Terverifikasi" />
              <FileItem name="Portfolio.pdf" status="Terverifikasi" />
            </div>
          )}

          {activeTab === "status" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50/50">
                <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Berkas Terverifikasi</p>
                  <p className="text-sm text-gray-600">17 April 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-50/50">
                <div className="size-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Calendar className="size-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Menunggu Jadwal Tes</p>
                  <p className="text-sm text-gray-600">Proses selanjutnya</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-6 border-t border-blue-100/50">
            <Button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30">
              <CheckCircle className="size-4" />
              Verifikasi
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30">
              <Calendar className="size-4" />
              Jadwalkan Tes
            </Button>
            <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
              <XCircle className="size-4" />
              Tolak
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PelamarPage() {
  const [selectedApplicant, setSelectedApplicant] = useState<number | null>(null);

  const pelamar = [
    { id: 1, nama: "Sarah Wijaya", tanggalDaftar: "2026-04-15", statusBerkas: "Terverifikasi", statusSeleksi: "Menunggu Tes", posisi: "Software Engineer" },
    { id: 2, nama: "Budi Santoso", tanggalDaftar: "2026-04-14", statusBerkas: "Menunggu", statusSeleksi: "Belum Diproses", posisi: "Data Analyst" },
    { id: 3, nama: "Rina Putri", tanggalDaftar: "2026-04-13", statusBerkas: "Terverifikasi", statusSeleksi: "Lulus Tes", posisi: "UI/UX Designer" },
    { id: 4, nama: "Ahmad Fadli", tanggalDaftar: "2026-04-12", statusBerkas: "Terverifikasi", statusSeleksi: "Tidak Lulus", posisi: "Software Engineer" },
  ];

  if (selectedApplicant !== null) {
    return <DetailPelamarPage onBack={() => setSelectedApplicant(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Data Pelamar</h2>
          <p className="text-sm text-gray-600 mt-1">Kelola data dan status pelamar</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input placeholder="Cari nama pelamar..." className="pl-10 bg-white/50 border-blue-100" />
            </div>
            <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
              <Filter className="size-4" />
              Filter Status
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-100/50">
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Nama</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Posisi</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Tanggal Daftar</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Status Berkas</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Status Seleksi</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pelamar.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-50/50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedApplicant(item.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                          {item.nama.charAt(0)}
                        </div>
                        <p className="font-medium text-gray-900">{item.nama}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{item.posisi}</td>
                    <td className="p-4 text-sm text-gray-600">{item.tanggalDaftar}</td>
                    <td className="p-4"><StatusBadge status={item.statusBerkas} /></td>
                    <td className="p-4"><StatusBadge status={item.statusSeleksi} /></td>
                    <td className="p-4">
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="sm" className="hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); setSelectedApplicant(item.id); }}>
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
