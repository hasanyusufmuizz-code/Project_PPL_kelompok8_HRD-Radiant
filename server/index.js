require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes      = require("./routes/auth");
const profileRoutes   = require("./routes/profile");
const dashboardRoutes = require("./routes/dashboard");
const lowonganRoutes  = require("./routes/lowongan");
const berkasRoutes    = require("./routes/berkas");
const jadwalRoutes    = require("./routes/jadwal");
const adminJadwalRoutes = require("./routes/adminJadwal");
const statusRoutes    = require("./routes/status");
const hasilRoutes     = require("./routes/hasil");
const tahapRoutes     = require("./routes/tahap");
const pelamarRoutes   = require("./routes/pelamar");
const usersRoutes     = require("./routes/users");
const notifikasiRoutes = require("./routes/notifikasi");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));
app.use(express.json());

// Static file serving untuk uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",         authRoutes);
app.use("/api/profile",      profileRoutes);
app.use("/api/dashboard",    dashboardRoutes);
app.use("/api/lowongan",     lowonganRoutes);
app.use("/api/berkas",       berkasRoutes);
app.use("/api/jadwal",       jadwalRoutes);
app.use("/api/admin/jadwal", adminJadwalRoutes);
app.use("/api/status",       statusRoutes);
app.use("/api/hasil",        hasilRoutes);
app.use("/api/tahap",        tahapRoutes);
app.use("/api/pelamar",      pelamarRoutes);
app.use("/api/admin/users",  usersRoutes);
app.use("/api/notifikasi",   notifikasiRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`✅  Server HRD Radiant berjalan di http://localhost:${PORT}`);
});
