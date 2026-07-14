const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
require("dotenv").config();

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { namaLengkap, email, password } = req.body;

  if (!namaLengkap || !email || !password) {
    return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password minimal 6 karakter." });
  }

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    const hash = await bcrypt.hash(password, 12);

    const [result] = await conn.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'pelamar')",
      [email, hash]
    );
    const userId = result.insertId;

    await conn.query(
      "INSERT INTO user_profiles (user_id, nama_lengkap) VALUES (?, ?)",
      [userId, namaLengkap]
    );

    const token = jwt.sign(
      { id: userId, email, role: "pelamar" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: "Registrasi berhasil.",
      token,
      user: { id: userId, email, namaLengkap, role: "pelamar" },
    });
  } finally {
    conn.release();
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT u.id, u.email, u.password_hash, u.role, up.nama_lengkap, up.avatar_url
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        email: user.email,
        namaLengkap: user.nama_lengkap || "",
        role: user.role,
        avatarUrl: user.avatar_url || null,
      },
    });
  } finally {
    conn.release();
  }
});

// GET /api/auth/me — cek token & kembalikan data user
const authMiddleware = require("../middleware/auth");
router.get("/me", authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT u.id, u.email, u.role, up.nama_lengkap, up.no_hp, up.alamat,
              up.posisi_dilamar, up.pendidikan, up.instansi, up.tentang, up.avatar_url
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan." });
    const u = rows[0];
    return res.json({
      id: u.id,
      email: u.email,
      role: u.role,
      namaLengkap: u.nama_lengkap || "",
      noHp: u.no_hp || "",
      alamat: u.alamat || "",
      posisi: u.posisi_dilamar || "",
      pendidikan: u.pendidikan || "",
      instansi: u.instansi || "",
      tentang: u.tentang || "",
      avatarUrl: u.avatar_url || null,
    });
  } finally {
    conn.release();
  }
});

module.exports = router;
