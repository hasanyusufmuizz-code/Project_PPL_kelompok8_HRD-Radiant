const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const [lamaranRows] = await db.query(
      `SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!lamaranRows.length) {
      return res.json({ selesai: [], menunggu: [] });
    }

    const lamaranId = lamaranRows[0].id;

    const [selesai] = await db.query(
      `SELECT
        hs.id, hs.nilai, hs.status, hs.catatan, hs.dinilai_pada,
        ts.nama AS nama_tahap, ts.urutan,
        p.nilai_kompetensi, p.nilai_komunikasi, p.nilai_kepribadian, p.nilai_motivasi
       FROM hasil_seleksi hs
       JOIN tahap_seleksi ts ON ts.id = hs.tahap_id
       LEFT JOIN penilaian p ON p.lamaran_id = hs.lamaran_id AND p.jadwal_id IN (
         SELECT pj.jadwal_id FROM peserta_jadwal pj
         JOIN jadwal_seleksi js ON js.id = pj.jadwal_id
         WHERE pj.lamaran_id = hs.lamaran_id AND js.tahap_id = hs.tahap_id
         LIMIT 1
       )
       WHERE hs.lamaran_id = ? AND hs.status IN ('lulus', 'tidak_lulus')
       ORDER BY ts.urutan ASC`,
      [lamaranId]
    );

    const [menunggu] = await db.query(
      `SELECT ts.id, ts.nama AS nama_tahap, ts.urutan,
        COALESCE(hs.status, 'menunggu') AS status,
        js.tanggal
       FROM tahap_seleksi ts
       LEFT JOIN hasil_seleksi hs ON hs.tahap_id = ts.id AND hs.lamaran_id = ?
       LEFT JOIN peserta_jadwal pj ON pj.lamaran_id = ?
       LEFT JOIN jadwal_seleksi js ON js.id = pj.jadwal_id AND js.tahap_id = ts.id
       WHERE COALESCE(hs.status, 'menunggu') NOT IN ('lulus', 'tidak_lulus')
       GROUP BY ts.id
       ORDER BY ts.urutan ASC`,
      [lamaranId, lamaranId]
    );

    res.json({ selesai, menunggu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
