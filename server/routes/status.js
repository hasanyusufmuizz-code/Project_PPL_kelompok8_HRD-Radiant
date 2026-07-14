const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const [lamaranRows] = await db.query(
      `SELECT l.id, l.status, l.tanggal_daftar, lo.posisi
       FROM lamaran l
       JOIN lowongan lo ON lo.id = l.lowongan_id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!lamaranRows.length) {
      return res.json({ lamaran: null, tahapan: [] });
    }

    const lamaran = lamaranRows[0];

    const [tahapRows] = await db.query(
      `SELECT
        ts.id, ts.nama, ts.urutan, ts.deskripsi,
        COALESCE(hs.status, 'menunggu') AS status,
        hs.nilai,
        hs.catatan,
        hs.dinilai_pada,
        js.tanggal,
        js.waktu_mulai,
        js.waktu_selesai,
        js.lokasi,
        js.link_online
       FROM tahap_seleksi ts
       LEFT JOIN hasil_seleksi hs
         ON hs.tahap_id = ts.id AND hs.lamaran_id = ?
       LEFT JOIN peserta_jadwal pj
         ON pj.lamaran_id = ?
       LEFT JOIN jadwal_seleksi js
         ON js.id = pj.jadwal_id AND js.tahap_id = ts.id
       ORDER BY ts.urutan ASC`,
      [lamaran.id, lamaran.id]
    );

    // Deduplicate (tahap can appear multiple times due to LEFT JOINs)
    const seen = new Set();
    const tahapan = tahapRows.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    res.json({ lamaran, tahapan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
