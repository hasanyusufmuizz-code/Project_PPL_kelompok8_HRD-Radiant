const express = require("express");
const router = express.Router();
const db = require("../db");
const trainingAuth = require("../middleware/trainingAuth");

// GET /api/jadwal-training — semua jadwal training
router.get("/", trainingAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT jt.id, jt.tanggal, jt.waktu_mulai, jt.waktu_selesai, jt.lokasi,
              jt.pemateri_nama, jt.keterangan, jt.materi_id, mt.judul AS materi_judul,
              COUNT(tp.id) AS jumlah_peserta
       FROM jadwal_training jt
       LEFT JOIN materi_training mt ON mt.id = jt.materi_id
       LEFT JOIN training_peserta tp ON tp.jadwal_training_id = jt.id
       GROUP BY jt.id
       ORDER BY jt.tanggal ASC, jt.waktu_mulai ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/jadwal-training — buat jadwal training baru (US-018)
router.post("/", trainingAuth, async (req, res) => {
  const { tanggal, waktuMulai, waktuSelesai, lokasi, pemateriNama, materiId, keterangan, pesertaUserIds } = req.body;
  if (!tanggal || !waktuMulai || !pemateriNama) {
    return res.status(400).json({ error: "Tanggal, waktu, dan pemateri wajib diisi" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[cek]] = await conn.query(`SELECT (? < CURDATE()) AS lampau`, [tanggal]);
    if (cek.lampau) {
      await conn.rollback();
      return res.status(400).json({ error: "Tanggal tidak boleh di masa lalu" });
    }

    const [result] = await conn.query(
      `INSERT INTO jadwal_training (tanggal, waktu_mulai, waktu_selesai, lokasi, pemateri_nama, materi_id, keterangan, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tanggal, waktuMulai, waktuSelesai || null, lokasi || null, pemateriNama, materiId || null, keterangan || null, req.user.id]
    );
    const jadwalId = result.insertId;

    const peserta = Array.isArray(pesertaUserIds) ? pesertaUserIds : [];
    for (const userId of peserta) {
      await conn.query(
        `INSERT IGNORE INTO training_peserta (jadwal_training_id, user_id) VALUES (?, ?)`,
        [jadwalId, userId]
      );
      await conn.query(
        `INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, ?)`,
        [
          userId,
          "Jadwal Training Baru",
          `Anda dijadwalkan mengikuti training pada ${tanggal} pukul ${waktuMulai.slice(0, 5)} di ${lokasi || "lokasi yang akan diinformasikan"}.`,
          "info",
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, id: jadwalId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

// PUT /api/jadwal-training/:id — edit jadwal training (hanya yang belum berlangsung)
router.put("/:id", trainingAuth, async (req, res) => {
  const { tanggal, waktuMulai, waktuSelesai, lokasi, pemateriNama, materiId, keterangan } = req.body;
  if (!tanggal || !waktuMulai || !pemateriNama) {
    return res.status(400).json({ error: "Tanggal, waktu, dan pemateri wajib diisi" });
  }

  try {
    const [[jadwal]] = await db.query(`SELECT tanggal FROM jadwal_training WHERE id = ?`, [req.params.id]);
    if (!jadwal) return res.status(404).json({ error: "Jadwal tidak ditemukan" });

    const todayStr = new Date().toISOString().slice(0, 10);
    const jadwalTanggalStr = new Date(jadwal.tanggal).toISOString().slice(0, 10);
    if (jadwalTanggalStr < todayStr) {
      return res.status(400).json({ error: "Jadwal yang sudah berlangsung tidak dapat diubah" });
    }
    if (tanggal < todayStr) {
      return res.status(400).json({ error: "Tanggal tidak boleh di masa lalu" });
    }

    await db.query(
      `UPDATE jadwal_training
       SET tanggal=?, waktu_mulai=?, waktu_selesai=?, lokasi=?, pemateri_nama=?, materi_id=?, keterangan=?, updated_at=NOW()
       WHERE id=?`,
      [tanggal, waktuMulai, waktuSelesai || null, lokasi || null, pemateriNama, materiId || null, keterangan || null, req.params.id]
    );

    const [peserta] = await db.query(
      `SELECT user_id FROM training_peserta WHERE jadwal_training_id = ?`,
      [req.params.id]
    );
    for (const p of peserta) {
      await db.query(
        `INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, ?)`,
        [
          p.user_id,
          "Jadwal Training Diubah",
          `Jadwal training Anda diperbarui menjadi ${tanggal} pukul ${waktuMulai.slice(0, 5)} di ${lokasi || "lokasi yang akan diinformasikan"}.`,
          "peringatan",
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/jadwal-training/:id/peserta — daftar peserta suatu jadwal
router.get("/:id/peserta", trainingAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tp.id, tp.user_id, tp.status_hadir, tp.hadir_pada,
              up.nama_lengkap, u.email
       FROM training_peserta tp
       JOIN users u ON u.id = tp.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE tp.jadwal_training_id = ?
       ORDER BY up.nama_lengkap ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/jadwal-training/:id/absensi — rekap absensi per sesi (US-019)
router.get("/:id/absensi", trainingAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tp.id, tp.user_id, tp.status_hadir, tp.hadir_pada,
              up.nama_lengkap, u.email
       FROM training_peserta tp
       JOIN users u ON u.id = tp.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE tp.jadwal_training_id = ?
       ORDER BY up.nama_lengkap ASC`,
      [req.params.id]
    );
    const total = rows.length;
    const hadir = rows.filter((r) => r.status_hadir === "hadir").length;
    const persentase = total > 0 ? Math.round((hadir / total) * 10000) / 100 : 0;
    res.json({ peserta: rows, total, hadir, persentase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/jadwal-training/:id/absensi — catat/ubah absensi (US-019)
// body: { kehadiran: [{ userId, hadir: true|false }] }
router.put("/:id/absensi", trainingAuth, async (req, res) => {
  const { kehadiran } = req.body;
  if (!Array.isArray(kehadiran)) return res.status(400).json({ error: "kehadiran wajib berupa array" });

  try {
    for (const item of kehadiran) {
      const status = item.hadir ? "hadir" : "tidak_hadir";
      await db.query(
        `UPDATE training_peserta
         SET status_hadir = ?, hadir_pada = ?, dicatat_oleh = ?, updated_at = NOW()
         WHERE jadwal_training_id = ? AND user_id = ?`,
        [status, item.hadir ? new Date() : null, req.user.id, req.params.id, item.userId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
