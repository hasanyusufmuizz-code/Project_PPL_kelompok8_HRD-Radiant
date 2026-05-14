import { Download, Users, CheckCircle, Clock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export function LaporanPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Laporan Rekrutmen</h2>
          <p className="text-sm text-gray-600 mt-1">Analisis dan statistik proses rekrutmen</p>
        </div>
        <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
          <Download className="size-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lamaran</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">248</h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400/10 to-blue-500/10">
                <Users className="size-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tingkat Penerimaan</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">57%</h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-400/10 to-green-500/10">
                <CheckCircle className="size-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Waktu</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">14d</h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400/10 to-purple-500/10">
                <Clock className="size-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
              <Input placeholder="Semua batch" className="bg-white/50 border-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
              <Input type="date" className="bg-white/50 border-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
              <Input type="date" className="bg-white/50 border-blue-100" />
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30">
            Generate Laporan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
