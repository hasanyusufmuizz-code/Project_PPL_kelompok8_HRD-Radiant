const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard — ringkasan data pelamar yang sedang login
router.get("/", authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;

    // Data profil
    const [[profile]] = await conn.query(
      `SELECT up.nama_lengkap, up.avatar_url, up.posisi_dilamar
       FROM user_profiles up WHERE up.user_id = ?`,
      [userId]
    );

    // Lamaran aktif user beserta tahap terkini
    const [lamaranRows] = await conn.query(
      `SELECT l.id, l.status, l.tanggal_daftar, lw.posisi
       FROM lamaran l
       JOIN lowongan lw ON l.lowongan_id = lw.id
       WHERE l.user_id = ?
       ORDER BY l.tanggal_daftar DESC
       LIMIT 1`,
      [userId]
    );
    const lamaran = lamaranRows[0] || null;

    // Progress tahap seleksi (jika ada lamaran)
    let steps = [];
    if (lamaran) {
      const [hasilRows] = await conn.query(
        `SELECT ts.nama, ts.urutan, hs.status, hs.nilai
         FROM tahap_seleksi ts
         LEFT JOIN hasil_seleksi hs ON ts.id = hs.tahap_id AND hs.lamaran_id = ?
         ORDER BY ts.urutan`,
        [lamaran.id]
      );
      steps = hasilRows.map((r) => ({
        label: r.nama,
        status: r.status || "menunggu",
        nilai: r.nilai || null,
      }));
    }

    // Notifikasi terbaru
    const [notifRows] = await conn.query(
      `SELECT id, judul, pesan, tipe, is_read, created_at
       FROM notifikasi
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    return res.json({
      user: {
        namaLengkap: profile?.nama_lengkap || "",
        avatarUrl: profile?.avatar_url || null,
        posisi: lamaran?.posisi || profile?.posisi_dilamar || "",
      },
      lamaran: lamaran
        ? {
            id: lamaran.id,
            status: lamaran.status,
            tanggalDaftar: lamaran.tanggal_daftar,
            posisi: lamaran.posisi,
          }
        : null,
      steps,
      notifikasi: notifRows.map((n) => ({
        id: n.id,
        judul: n.judul,
        pesan: n.pesan,
        tipe: n.tipe,
        isRead: n.is_read === 1,
        createdAt: n.created_at,
      })),
    });
  } finally {
    conn.release();
  }
});

module.exports = router;
