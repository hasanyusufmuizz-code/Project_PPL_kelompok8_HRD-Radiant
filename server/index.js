require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes      = require("./routes/auth");
const profileRoutes   = require("./routes/profile");
const dashboardRoutes = require("./routes/dashboard");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));
app.use(express.json());

app.use("/api/auth",      authRoutes);
app.use("/api/profile",   profileRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`✅  Server HRD Radiant berjalan di http://localhost:${PORT}`);
});
