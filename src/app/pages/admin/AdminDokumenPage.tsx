import { Upload, Download, Trash2, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    "Aktif": "bg-green-100 text-green-700 border-green-200",
    "Tidak Valid": "bg-red-100 text-red-700 border-red-200",
    "Terverifikasi": "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <Badge className={variants[status] || "bg-blue-100 text-blue-700 border-blue-200"}>
      {status}
    </Badge>
  );
}

function FileItem({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-blue-50/30 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 rounded-lg bg-blue-100">
          <FileText className="size-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="hover:bg-blue-50">
          <Download className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function AdminDokumenPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dokumen</h2>
          <p className="text-sm text-gray-600 mt-1">Kelola dokumen dan berkas pelamar</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30">
          <Upload className="size-4" />
          Upload Dokumen
        </Button>
      </div>

      <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
        <CardContent className="p-6 space-y-3">
          <FileItem name="Template_Surat_Panggilan.docx" status="Aktif" />
          <FileItem name="Formulir_Pendaftaran.pdf" status="Aktif" />
          <FileItem name="Panduan_Tes_2025.pdf" status="Tidak Valid" />
          <FileItem name="SOP_Rekrutmen.pdf" status="Aktif" />
        </CardContent>
      </Card>
    </div>
  );
}
