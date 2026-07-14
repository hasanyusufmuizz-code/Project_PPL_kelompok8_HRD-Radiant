const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");
const bcrypt = require("bcryptjs");

// GET /api/admin/users — list semua user
router.get("/", adminAuth, async (req, res) => {
  const { role, search } = req.query;
  try {
    let sql = `
      SELECT u.id, u.email, u.role, u.is_active, u.created_at,
             up.nama_lengkap, up.no_hp, up.avatar_url,
             (SELECT COUNT(*) FROM lamaran WHERE user_id = u.id) AS jumlah_lamaran
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (role) { sql += " AND u.role = ?"; params.push(role); }
    if (search) {
      sql += " AND (up.nama_lengkap LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += " ORDER BY u.created_at DESC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/admin/users/:id — ubah role, is_active, atau reset password
router.patch("/:id", adminAuth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Hanya admin." });

  const targetId = parseInt(req.params.id);
  if (targetId === req.user.id) return res.status(400).json({ error: "Tidak dapat mengedit akun sendiri di sini." });

  const { role, is_active, password } = req.body;
  const validRoles = ["pelamar", "hrd", "admin", "manajer_training", "pimpinan"];

  try {
    const updates = [];
    const params = [];

    if (role !== undefined) {
      if (!validRoles.includes(role)) return res.status(400).json({ error: "Role tidak valid." });
      updates.push("role = ?");
      params.push(role);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter." });
      const hash = await bcrypt.hash(password, 12);
      updates.push("password_hash = ?");
      params.push(hash);
    }

    if (updates.length === 0) return res.status(400).json({ error: "Tidak ada field yang diupdate." });

    updates.push("updated_at = NOW()");
    params.push(targetId);

    await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/admin/users/:id — hapus user (hanya jika tidak punya lamaran)
router.delete("/:id", adminAuth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Hanya admin." });

  const targetId = parseInt(req.params.id);
  if (targetId === req.user.id) return res.status(400).json({ error: "Tidak dapat menghapus akun sendiri." });

  try {
    const [[countRow]] = await db.query(
      "SELECT COUNT(*) AS cnt FROM lamaran WHERE user_id = ?",
      [targetId]
    );
    if (countRow.cnt > 0) {
      return res.status(409).json({
        error: "User ini memiliki data lamaran. Nonaktifkan akun saja untuk membatasi aksesnya.",
      });
    }

    await db.query("DELETE FROM notifikasi WHERE user_id = ?", [targetId]);
    await db.query("DELETE FROM user_profiles WHERE user_id = ?", [targetId]);
    await db.query("DELETE FROM users WHERE id = ?", [targetId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
