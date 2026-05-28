const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET /api/jadwal — jadwal milik pelamar (berdasarkan lamaran terbaru)
router.get("/", auth, async (req, res) => {
  try {
    const [lamaranRows] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!lamaranRows.length) return res.json({ upcoming: [], past: [] });

    const lamaranId = lamaranRows[0].id;
    const today = new Date().toISOString().slice(0, 10);

    const [upcoming] = await db.query(
      `SELECT js.id, js.jenis, js.tanggal, js.waktu_mulai, js.waktu_selesai,
              js.lokasi, js.link_online, js.keterangan,
              ts.nama AS nama_tahap, pj.status_hadir
       FROM peserta_jadwal pj
       JOIN jadwal_seleksi js ON js.id = pj.jadwal_id
       JOIN tahap_seleksi ts ON ts.id = js.tahap_id
       WHERE pj.lamaran_id = ? AND js.tanggal >= ?
       ORDER BY js.tanggal ASC, js.waktu_mulai ASC`,
      [lamaranId, today]
    );

    const [past] = await db.query(
      `SELECT js.id, js.jenis, js.tanggal, js.waktu_mulai, js.waktu_selesai,
              js.lokasi, js.link_online, js.keterangan,
              ts.nama AS nama_tahap, pj.status_hadir
       FROM peserta_jadwal pj
       JOIN jadwal_seleksi js ON js.id = pj.jadwal_id
       JOIN tahap_seleksi ts ON ts.id = js.tahap_id
       WHERE pj.lamaran_id = ? AND js.tanggal < ?
       ORDER BY js.tanggal DESC`,
      [lamaranId, today]
    );

    res.json({ upcoming, past });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
