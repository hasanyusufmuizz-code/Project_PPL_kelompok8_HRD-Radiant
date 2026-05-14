import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    "Lulus": "bg-green-100 text-green-700 border-green-200",
    "Tidak Lulus": "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <Badge className={variants[status] || "bg-blue-100 text-blue-700 border-blue-200"}>
      {status}
    </Badge>
  );
}

function PenilaianItem({ nama, nilai, status, jenis }: { nama: string; nilai: number; status: string; jenis: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-blue-50/30 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{nama}</p>
        <p className="text-sm text-gray-600">{jenis}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">{nilai}</p>
          <p className="text-xs text-gray-500">Nilai</p>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export function PenilaianPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Penilaian Pelamar</h2>
        <p className="text-sm text-gray-600 mt-1">Input hasil penilaian tes dan wawancara</p>
      </div>

      <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pelamar</label>
            <Input placeholder="Pilih pelamar..." className="bg-white/50 border-blue-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Penilaian</label>
            <Input placeholder="Tes Tertulis / Wawancara / Praktik" className="bg-white/50 border-blue-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nilai (0-100)</label>
              <Input type="number" placeholder="85" className="bg-white/50 border-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                  Lulus
                </Button>
                <Button variant="outline" className="flex-1 border-red-200 text-red-700 hover:bg-red-50">
                  Tidak Lulus
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
            <textarea
              className="w-full min-h-24 p-3 rounded-lg bg-white/50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Catatan tambahan tentang penilaian..."
            />
          </div>

          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30">
            Simpan Penilaian
          </Button>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
        <CardHeader>
          <CardTitle>Riwayat Penilaian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PenilaianItem nama="Sarah Wijaya" nilai={85} status="Lulus" jenis="Tes Tertulis" />
          <PenilaianItem nama="Budi Santoso" nilai={72} status="Lulus" jenis="Wawancara" />
          <PenilaianItem nama="Ahmad Fadli" nilai={58} status="Tidak Lulus" jenis="Tes Praktik" />
        </CardContent>
      </Card>
    </div>
  );
}
