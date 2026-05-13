import { Users, Clock, CheckCircle, XCircle, Plus, Calendar, BarChart3 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { useNavigate } from "react-router";

export function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pelamar"
          value="248"
          icon={<Users className="size-6 text-blue-500" />}
          trend="+12%"
          bgGradient="from-blue-400/10 to-blue-500/10"
        />
        <StatsCard
          title="Sedang Diproses"
          value="89"
          icon={<Clock className="size-6 text-yellow-500" />}
          trend="+5%"
          bgGradient="from-yellow-400/10 to-yellow-500/10"
        />
        <StatsCard
          title="Lulus"
          value="142"
          icon={<CheckCircle className="size-6 text-green-500" />}
          trend="+18%"
          bgGradient="from-green-400/10 to-green-500/10"
        />
        <StatsCard
          title="Gagal"
          value="17"
          icon={<XCircle className="size-6 text-red-500" />}
          trend="-3%"
          bgGradient="from-red-400/10 to-red-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Update terkini sistem rekrutmen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityItem
                name="Sarah Wijaya"
                action="mengajukan berkas untuk posisi"
                target="Software Engineer"
                time="5 menit lalu"
                status="new"
              />
              <ActivityItem
                name="Admin"
                action="menjadwalkan tes untuk"
                target="Data Analyst - Batch 2"
                time="1 jam lalu"
                status="scheduled"
              />
              <ActivityItem
                name="Budi Santoso"
                action="menyelesaikan tes"
                target="UI/UX Designer"
                time="2 jam lalu"
                status="completed"
              />
              <ActivityItem
                name="Admin"
                action="memverifikasi berkas"
                target="15 pelamar"
                time="3 jam lalu"
                status="verified"
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Akses cepat fitur utama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate("/admin/lowongan")}
                className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30"
              >
                <Plus className="size-4" />
                Buat Lowongan
              </Button>
              <Button
                onClick={() => navigate("/admin/jadwal")}
                className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
              >
                <Calendar className="size-4" />
                Jadwalkan Tes
              </Button>
              <Button
                onClick={() => navigate("/admin/pelamar")}
                variant="outline"
                className="w-full justify-start border-blue-200 hover:bg-blue-50/50"
              >
                <Users className="size-4" />
                Lihat Pelamar
              </Button>
              <Button
                onClick={() => navigate("/admin/laporan")}
                variant="outline"
                className="w-full justify-start border-blue-200 hover:bg-blue-50/50"
              >
                <BarChart3 className="size-4" />
                Lihat Laporan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, trend, bgGradient }: { title: string; value: string; icon: React.ReactNode; trend: string; bgGradient: string }) {
  return (
    <Card className="backdrop-blur-xl bg-white/70 border-blue-100/50 shadow-xl hover:shadow-2xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-green-600 mt-2">{trend} dari bulan lalu</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ name, action, target, time, status }: { name: string; action: string; target: string; time: string; status: string }) {
  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    scheduled: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    verified: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50/30 transition-colors">
      <div className={`p-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        <div className="size-2 rounded-full bg-current"></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium text-gray-900">{name}</span>{" "}
          <span className="text-gray-600">{action}</span>{" "}
          <span className="font-medium text-blue-600">{target}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
