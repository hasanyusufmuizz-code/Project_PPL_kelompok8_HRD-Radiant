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

// PATCH /api/jadwal/:id/konfirmasi-hadir — pelamar konfirmasi kehadiran/selesai mengerjakan
router.patch("/:id/konfirmasi-hadir", auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lamaran milik user yang login
    const [[lamaran]] = await conn.query(
      "SELECT id FROM lamaran WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    if (!lamaran) {
      await conn.rollback();
      return res.status(404).json({ error: "Lamaran tidak ditemukan" });
    }

    // Pastikan user memang peserta jadwal ini
    const [[peserta]] = await conn.query(
      "SELECT id, status_hadir FROM peserta_jadwal WHERE jadwal_id = ? AND lamaran_id = ?",
      [req.params.id, lamaran.id]
    );
    if (!peserta) {
      await conn.rollback();
      return res.status(403).json({ error: "Anda bukan peserta jadwal ini" });
    }
    if (peserta.status_hadir === "hadir") {
      await conn.rollback();
      return res.status(409).json({ error: "Kehadiran sudah dikonfirmasi sebelumnya" });
    }

    // Tandai hadir — TIDAK menggerakkan progress bar (lulus tetap keputusan HRD)
    await conn.query(
      "UPDATE peserta_jadwal SET status_hadir = 'hadir' WHERE id = ?",
      [peserta.id]
    );

    // Detail jadwal + nama pelamar untuk notifikasi HRD
    const [[jadwal]] = await conn.query(
      `SELECT js.jenis, ts.nama AS nama_tahap
       FROM jadwal_seleksi js
       JOIN tahap_seleksi ts ON ts.id = js.tahap_id
       WHERE js.id = ?`,
      [req.params.id]
    );
    const [[profil]] = await conn.query(
      "SELECT nama_lengkap FROM user_profiles WHERE user_id = ?",
      [req.user.id]
    );
    const namaPelamar = profil?.nama_lengkap || "Seorang pelamar";

    // Notifikasi ke semua admin/HRD agar segera menilai
    const [adminUsers] = await conn.query(
      "SELECT id FROM users WHERE role IN ('admin','hrd') AND is_active = 1"
    );
    if (jadwal && adminUsers.length) {
      const judul = `Konfirmasi Hadir: ${jadwal.nama_tahap}`;
      const pesan = `${namaPelamar} telah mengonfirmasi kehadiran/menyelesaikan ${jadwal.nama_tahap}. Mohon beri penilaian di Data Pelamar.`;
      const values = adminUsers.map((u) => [u.id, judul, pesan, "info", "/admin/pelamar"]);
      await conn.query(
        "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link_url) VALUES ?",
        [values]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;
