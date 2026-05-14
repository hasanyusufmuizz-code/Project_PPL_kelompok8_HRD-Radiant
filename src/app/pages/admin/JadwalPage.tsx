import { Plus, Eye, Edit, Calendar, Clock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export function JadwalPage() {
  const jadwal = [
    { id: 1, jenis: "Tes Tertulis", posisi: "Software Engineer", tanggal: "2026-04-22", waktu: "09:00 - 11:00", peserta: 12 },
    { id: 2, jenis: "Wawancara", posisi: "Data Analyst", tanggal: "2026-04-23", waktu: "13:00 - 17:00", peserta: 8 },
    { id: 3, jenis: "Tes Praktik", posisi: "UI/UX Designer", tanggal: "2026-04-24", waktu: "10:00 - 12:00", peserta: 6 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Jadwal Seleksi</h2>
          <p className="text-sm text-gray-600 mt-1">Kelola jadwal tes dan wawancara</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30">
            <Plus className="size-4" />
            Jadwalkan Tes
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30">
            <Plus className="size-4" />
            Jadwalkan Wawancara
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jadwal.map((item) => (
          <Card key={item.id} className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">{item.jenis}</Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-700">{item.peserta} peserta</Badge>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{item.posisi}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  {item.tanggal}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  {item.waktu}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-blue-100/50">
                <Button variant="outline" size="sm" className="flex-1 border-blue-200 hover:bg-blue-50">
                  <Eye className="size-4" />
                  Detail
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <Edit className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
