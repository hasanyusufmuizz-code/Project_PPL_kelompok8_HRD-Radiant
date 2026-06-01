const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// GET /api/lowongan — daftar lowongan aktif untuk pelamar (publik)
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.id, l.posisi, l.deskripsi, l.persyaratan, l.kuota, l.deadline, l.status,
              up.nama_lengkap AS dibuat_oleh_nama, l.created_at
       FROM lowongan l
       LEFT JOIN users u ON u.id = l.dibuat_oleh
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE l.status = 'aktif' AND l.deadline >= CURDATE()
       ORDER BY l.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/lowongan/:id — detail lowongan
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, up.nama_lengkap AS dibuat_oleh_nama
       FROM lowongan l
       LEFT JOIN users u ON u.id = l.dibuat_oleh
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE l.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Lowongan tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/lowongan/daftar — pelamar mendaftar ke lowongan
router.post("/daftar", auth, async (req, res) => {
  const { lowonganId } = req.body;
  if (!lowonganId) return res.status(400).json({ error: "lowonganId wajib diisi" });

  try {
    // Cek lowongan masih aktif
    const [low] = await db.query(
      `SELECT id FROM lowongan WHERE id = ? AND status = 'aktif' AND deadline >= CURDATE()`,
      [lowonganId]
    );
    if (!low.length) return res.status(400).json({ error: "Lowongan tidak tersedia" });

    // Cek apakah sudah pernah mendaftar
    const [existing] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? AND lowongan_id = ?`,
      [req.user.id, lowonganId]
    );
    if (existing.length) return res.status(409).json({ error: "Anda sudah mendaftar lowongan ini" });

    const [result] = await db.query(
      `INSERT INTO lamaran (user_id, lowongan_id, status) VALUES (?, ?, 'pending')`,
      [req.user.id, lowonganId]
    );
    const lamaranId = result.insertId;

    // Otomatis masukkan ke tahap 1 (Pendaftaran & Administrasi) dengan status proses
    const [tahap1] = await db.query(
      `SELECT id FROM tahap_seleksi ORDER BY urutan ASC LIMIT 1`
    );
    if (tahap1.length) {
      await db.query(
        `INSERT INTO hasil_seleksi (lamaran_id, tahap_id, status) VALUES (?, ?, 'proses')`,
        [lamaranId, tahap1[0].id]
      );
    }

    res.status(201).json({ success: true, lamaranId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// === ADMIN ROUTES ===

// GET /api/lowongan/admin/semua — semua lowongan untuk admin
router.get("/admin/semua", adminAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.id, l.posisi, l.deskripsi, l.persyaratan, l.kuota, l.deadline, l.status,
              up.nama_lengkap AS dibuat_oleh_nama, l.created_at,
              COUNT(lm.id) AS jumlah_pelamar
       FROM lowongan l
       LEFT JOIN users u ON u.id = l.dibuat_oleh
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN lamaran lm ON lm.lowongan_id = l.id
       GROUP BY l.id
       ORDER BY l.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/lowongan/admin — buat lowongan baru
router.post("/admin", adminAuth, async (req, res) => {
  const { posisi, deskripsi, persyaratan, kuota, deadline, status } = req.body;
  if (!posisi || !deadline) return res.status(400).json({ error: "Posisi dan deadline wajib diisi" });

  try {
    const [result] = await db.query(
      `INSERT INTO lowongan (posisi, deskripsi, persyaratan, kuota, deadline, status, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [posisi, deskripsi || null, persyaratan || null, kuota || 1, deadline, status || "aktif", req.user.id]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/lowongan/admin/:id — edit lowongan
router.put("/admin/:id", adminAuth, async (req, res) => {
  const { posisi, deskripsi, persyaratan, kuota, deadline, status } = req.body;
  if (!posisi || !deadline) return res.status(400).json({ error: "Posisi dan deadline wajib diisi" });

  try {
    await db.query(
      `UPDATE lowongan SET posisi=?, deskripsi=?, persyaratan=?, kuota=?, deadline=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [posisi, deskripsi || null, persyaratan || null, kuota || 1, deadline, status || "aktif", req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/lowongan/admin/:id — hapus lowongan
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    await db.query(`DELETE FROM lowongan WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
