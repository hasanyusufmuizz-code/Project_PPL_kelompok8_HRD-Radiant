import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export function LowonganPage() {
  const lowongan = [
    { id: 1, posisi: "Software Engineer", deadline: "2026-05-01", status: "Aktif", pelamar: 45 },
    { id: 2, posisi: "Data Analyst", deadline: "2026-04-25", status: "Aktif", pelamar: 32 },
    { id: 3, posisi: "UI/UX Designer", deadline: "2026-04-20", status: "Ditutup", pelamar: 28 },
    { id: 4, posisi: "Product Manager", deadline: "2026-05-10", status: "Aktif", pelamar: 18 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Lowongan Pekerjaan</h2>
          <p className="text-sm text-gray-600 mt-1">Kelola lowongan pekerjaan yang tersedia</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30">
          <Plus className="size-4" />
          Tambah Lowongan
        </Button>
      </div>

      <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-100/50">
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Posisi</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Deadline</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Pelamar</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {lowongan.map((item) => (
                  <tr key={item.id} className="border-b border-blue-50/50 hover:bg-blue-50/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{item.posisi}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{item.deadline}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {item.pelamar} pelamar
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={item.status === "Aktif" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="size-4" />
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
