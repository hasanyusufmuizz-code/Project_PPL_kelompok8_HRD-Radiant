const express = require("express");
const router = express.Router();
const db = require("../db");
const pimpinanAuth = require("../middleware/pimpinanAuth");

// GET /api/pimpinan/lowongan — daftar lowongan untuk filter dropdown
router.get("/lowongan", pimpinanAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, posisi FROM lowongan ORDER BY posisi ASC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/pimpinan/dashboard?lowonganId=&startDate=&endDate= — metrik rekrutmen (US-021)
router.get("/dashboard", pimpinanAuth, async (req, res) => {
  const { lowonganId, startDate, endDate } = req.query;
  try {
    let sql = `SELECT status FROM lamaran WHERE 1=1`;
    const params = [];
    if (lowonganId) { sql += " AND lowongan_id = ?"; params.push(lowonganId); }
    if (startDate) { sql += " AND tanggal_daftar >= ?"; params.push(startDate); }
    if (endDate) { sql += " AND tanggal_daftar <= ?"; params.push(`${endDate} 23:59:59`); }

    const [rows] = await db.query(sql, params);

    const totalPendaftar = rows.length;
    const totalLolos = rows.filter((r) => r.status === "diterima").length;
    const totalGagal = rows.filter((r) => r.status === "ditolak").length;
    const totalProses = totalPendaftar - totalLolos - totalGagal;

    res.json({
      total_pendaftar: totalPendaftar,
      kandidat_proses: totalProses,
      total_lolos: totalLolos,
      total_gagal: totalGagal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
