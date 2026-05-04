import { MapPin, Video, type LucideIcon } from "lucide-react";

export interface Schedule {
  id: number;
  type: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  date: string;
  dateShort: string;
  day: string;
  time: string;
  location: string;
  mode: string;
  modeIcon: LucideIcon;
  urgent: boolean;
  daysLeft: number;
  notes: string;
  color: string;
  bg: string;
  isNew: boolean;
}

export interface PastSchedule {
  id: number;
  type: string;
  date: string;
  time: string;
  status: string;
  result: string;
}

export const upcomingSchedules: Schedule[] = [
  {
    id: 1,
    type: "Micro Teaching",
    tag: "Praktek",
    tagColor: "#7C3AED",
    tagBg: "#F5F3FF",
    date: "Kamis, 10 April 2026",
    dateShort: "10 Apr",
    day: "KAM",
    time: "09.00 – 11.00 WIB",
    location: "Ruang A-201, Gedung Utama",
    mode: "Luring",
    modeIcon: MapPin,
    urgent: true,
    daysLeft: 9,
    notes: "Hadir 15 menit sebelumnya. Bawa RPP dan perangkat ajar.",
    color: "#7C3AED",
    bg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
    isNew: true,
  },
  {
    id: 2,
    type: "Wawancara HR",
    tag: "Interview",
    tagColor: "#2563EB",
    tagBg: "#EFF6FF",
    date: "Senin, 21 April 2026",
    dateShort: "21 Apr",
    day: "SEN",
    time: "13.00 – 14.00 WIB",
    location: "Via Zoom Meeting",
    mode: "Daring",
    modeIcon: Video,
    urgent: false,
    daysLeft: 20,
    notes: "Link meeting akan dikirim melalui email 1 hari sebelumnya.",
    color: "#2563EB",
    bg: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
    isNew: false,
  },
];

export const pastSchedules: PastSchedule[] = [
  {
    id: 3,
    type: "Tes Tulis CBT",
    date: "22 Maret 2026",
    time: "08.00 – 10.00 WIB",
    status: "Selesai",
    result: "Lulus",
  },
  {
    id: 4,
    type: "Registrasi Online",
    date: "15 Maret 2026",
    time: "– (Deadline)",
    status: "Selesai",
    result: "Diterima",
  },
];

export const calendarEvents: { day: number; color: string; label: string }[] = [
  { day: 10, color: "#7C3AED", label: "10 Apr – Micro Teaching" },
  { day: 21, color: "#2563EB", label: "21 Apr – Wawancara HR" },
];
