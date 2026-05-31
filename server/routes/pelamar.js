const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

// GET /api/pelamar/admin — semua pelamar dengan filter
router.get("/admin", adminAuth, async (req, res) => {
  const { status, lowonganId, search } = req.query;
  try {
    let sql = `
      SELECT l.id, l.status, l.tanggal_daftar, l.catatan_hrd,
             u.id AS user_id, u.email,
             up.nama_lengkap, up.no_telepon,
             low.id AS lowongan_id, low.posisi,
             (SELECT COUNT(*) FROM berkas_inti bi WHERE bi.user_id = u.id) AS jumlah_berkas_inti,
             (SELECT COUNT(*) FROM dokumen_lamaran dl WHERE dl.lamaran_id = l.id) AS jumlah_berkas_khusus
      FROM lamaran l
      JOIN users u ON u.id = l.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      JOIN lowongan low ON low.id = l.lowongan_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { sql += " AND l.status = ?"; params.push(status); }
    if (lowonganId) { sql += " AND l.lowongan_id = ?"; params.push(lowonganId); }
    if (search) {
      sql += " AND (up.nama_lengkap LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += " ORDER BY l.tanggal_daftar DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/pelamar/admin/:id/status — update status lamaran
router.patch("/admin/:id/status", adminAuth, async (req, res) => {
  const { status, catatan_hrd } = req.body;
  const valid = ["pending","administrasi","tes_tulis","micro_teaching","wawancara","final","diterima","ditolak"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Status tidak valid" });
  try {
    await db.query(
      `UPDATE lamaran SET status = ?, catatan_hrd = ?, updated_at = NOW() WHERE id = ?`,
      [status, catatan_hrd || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
