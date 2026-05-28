const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

// GET /api/admin/jadwal — semua jadwal
router.get("/", adminAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT js.id, js.jenis, js.tanggal, js.waktu_mulai, js.waktu_selesai,
              js.lokasi, js.link_online, js.keterangan,
              ts.nama AS nama_tahap,
              low.posisi AS posisi_lowongan, low.id AS lowongan_id,
              COUNT(pj.id) AS jumlah_peserta
       FROM jadwal_seleksi js
       JOIN tahap_seleksi ts ON ts.id = js.tahap_id
       JOIN lowongan low ON low.id = js.lowongan_id
       LEFT JOIN peserta_jadwal pj ON pj.jadwal_id = js.id
       GROUP BY js.id
       ORDER BY js.tanggal ASC, js.waktu_mulai ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/jadwal/:id/peserta — peserta di jadwal tertentu
router.get("/:id/peserta", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pj.id, pj.status_hadir, lm.id AS lamaran_id,
              up.nama_lengkap, u.email
       FROM peserta_jadwal pj
       JOIN lamaran lm ON lm.id = pj.lamaran_id
       JOIN users u ON u.id = lm.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE pj.jadwal_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/jadwal — buat jadwal baru
router.post("/", adminAuth, async (req, res) => {
  const { tahapId, lowonganId, jenis, tanggal, waktuMulai, waktuSelesai, lokasi, linkOnline, keterangan } = req.body;
  if (!tahapId || !lowonganId || !jenis || !tanggal || !waktuMulai || !waktuSelesai) {
    return res.status(400).json({ error: "Field tahap, lowongan, jenis, tanggal, dan waktu wajib diisi" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO jadwal_seleksi
         (tahap_id, lowongan_id, jenis, tanggal, waktu_mulai, waktu_selesai, lokasi, link_online, keterangan, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tahapId, lowonganId, jenis, tanggal, waktuMulai, waktuSelesai, lokasi || null, linkOnline || null, keterangan || null, req.user.id]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/admin/jadwal/:id — edit jadwal
router.put("/:id", adminAuth, async (req, res) => {
  const { tahapId, lowonganId, jenis, tanggal, waktuMulai, waktuSelesai, lokasi, linkOnline, keterangan } = req.body;
  if (!tahapId || !lowonganId || !jenis || !tanggal || !waktuMulai || !waktuSelesai) {
    return res.status(400).json({ error: "Field wajib tidak lengkap" });
  }

  try {
    await db.query(
      `UPDATE jadwal_seleksi
       SET tahap_id=?, lowongan_id=?, jenis=?, tanggal=?, waktu_mulai=?, waktu_selesai=?,
           lokasi=?, link_online=?, keterangan=?, updated_at=NOW()
       WHERE id=?`,
      [tahapId, lowonganId, jenis, tanggal, waktuMulai, waktuSelesai, lokasi || null, linkOnline || null, keterangan || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/admin/jadwal/:id — hapus jadwal
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await db.query(`DELETE FROM jadwal_seleksi WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/jadwal/:id/tambah-peserta — tambah peserta ke jadwal
router.post("/:id/tambah-peserta", adminAuth, async (req, res) => {
  const { lamaranId } = req.body;
  if (!lamaranId) return res.status(400).json({ error: "lamaranId wajib" });

  try {
    await db.query(
      `INSERT IGNORE INTO peserta_jadwal (jadwal_id, lamaran_id) VALUES (?, ?)`,
      [req.params.id, lamaranId]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
