const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET /api/notifikasi — daftar notifikasi user yang login (semua role)
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, judul, pesan, tipe, is_read, link_url, created_at
       FROM notifikasi
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [req.user.id]
    );
    const [[unread]] = await db.query(
      "SELECT COUNT(*) AS cnt FROM notifikasi WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );
    res.json({
      unreadCount: unread.cnt,
      items: rows.map((n) => ({
        id: n.id,
        judul: n.judul,
        pesan: n.pesan,
        tipe: n.tipe,
        isRead: n.is_read === 1,
        linkUrl: n.link_url,
        createdAt: n.created_at,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/notifikasi/:id/read — tandai satu notifikasi terbaca
router.patch("/:id/read", auth, async (req, res) => {
  try {
    await db.query(
      "UPDATE notifikasi SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/notifikasi/read-all — tandai semua terbaca
router.patch("/read-all", auth, async (req, res) => {
  try {
    await db.query(
      "UPDATE notifikasi SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
