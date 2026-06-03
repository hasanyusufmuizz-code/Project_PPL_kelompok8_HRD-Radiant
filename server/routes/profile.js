const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /api/profile
router.get("/", authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT u.email, up.nama_lengkap, up.no_hp, up.alamat,
              up.posisi_dilamar, up.pendidikan, up.instansi, up.tentang, up.avatar_url
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Profil tidak ditemukan." });
    const p = rows[0];
    return res.json({
      email: p.email,
      namaLengkap: p.nama_lengkap || "",
      noHp: p.no_hp || "",
      alamat: p.alamat || "",
      posisi: p.posisi_dilamar || "",
      pendidikan: p.pendidikan || "",
      instansi: p.instansi || "",
      tentang: p.tentang || "",
      avatarUrl: p.avatar_url || null,
    });
  } finally {
    conn.release();
  }
});

// PUT /api/profile
router.put("/", authMiddleware, async (req, res) => {
  const { namaLengkap, noHp, alamat, posisi, pendidikan, instansi, tentang } = req.body;
  const conn = await pool.getConnection();
  try {
    // Pastikan baris profil ada
    const [existing] = await conn.query(
      "SELECT id FROM user_profiles WHERE user_id = ?",
      [req.user.id]
    );

    if (existing.length === 0) {
      await conn.query(
        `INSERT INTO user_profiles (user_id, nama_lengkap, no_hp, alamat, posisi_dilamar, pendidikan, instansi, tentang)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, namaLengkap, noHp, alamat, posisi, pendidikan, instansi, tentang]
      );
    } else {
      await conn.query(
        `UPDATE user_profiles
         SET nama_lengkap = ?, no_hp = ?, alamat = ?, posisi_dilamar = ?,
             pendidikan = ?, instansi = ?, tentang = ?
         WHERE user_id = ?`,
        [namaLengkap, noHp, alamat, posisi, pendidikan, instansi, tentang, req.user.id]
      );
    }

    return res.json({ message: "Profil berhasil diperbarui." });
  } finally {
    conn.release();
  }
});

// PUT /api/profile/password — ganti password
router.put("/password", authMiddleware, async (req, res) => {
  const { passwordLama, passwordBaru } = req.body;
  if (!passwordLama || !passwordBaru) {
    return res.status(400).json({ message: "Password lama dan baru wajib diisi." });
  }
  if (passwordBaru.length < 8) {
    return res.status(400).json({ message: "Password baru minimal 8 karakter." });
  }
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "User tidak ditemukan." });

    const match = await bcrypt.compare(passwordLama, rows[0].password_hash);
    if (!match) return res.status(400).json({ message: "Password lama tidak sesuai." });

    const hash = await bcrypt.hash(passwordBaru, 12);
    await conn.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.user.id]);
    return res.json({ message: "Password berhasil diperbarui." });
  } finally {
    conn.release();
  }
});

module.exports = router;
