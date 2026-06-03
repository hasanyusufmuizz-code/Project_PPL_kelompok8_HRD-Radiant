const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

// Mapping lamaran.status -> urutan tahap yang sedang aktif
const STATUS_TAHAP_URUTAN = {
  pending: 0,
  administrasi: 1,
  tes_tulis: 2,
  micro_teaching: 3,
  wawancara: 4,
  final: 5,
  diterima: 99,
  ditolak: 0,
};

const STATUS_LABEL = {
  pending: "Pending",
  administrasi: "Administrasi",
  tes_tulis: "Tes Tulis (CBT)",
  micro_teaching: "Micro Teaching",
  wawancara: "Wawancara",
  final: "Final Review",
  diterima: "Diterima",
  ditolak: "Ditolak",
};

// GET /api/pelamar/admin — semua pelamar dengan filter
router.get("/admin", adminAuth, async (req, res) => {
  const { status, lowonganId, search } = req.query;
  try {
    let sql = `
      SELECT l.id, l.status, l.tanggal_daftar, l.catatan_hrd,
             u.id AS user_id, u.email,
             up.nama_lengkap, up.no_hp AS no_telepon,
             low.id AS lowongan_id, low.posisi,
             (SELECT COUNT(*) FROM berkas_inti bi WHERE bi.user_id = u.id) AS jumlah_berkas_inti,
             (SELECT COUNT(*) FROM dokumen_lamaran dl WHERE dl.lamaran_id = l.id) AS jumlah_berkas_khusus
      FROM lamaran l
      JOIN users u ON u.id = l.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      JOIN lowongan low ON low.id = l.lowongan_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { sql += " AND l.status = ?"; params.push(status); }
    if (lowonganId) { sql += " AND l.lowongan_id = ?"; params.push(lowonganId); }
    if (search) {
      sql += " AND (up.nama_lengkap LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += " ORDER BY l.tanggal_daftar DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/pelamar/admin/:id/status — update status lamaran + sync hasil_seleksi + notifikasi
router.patch("/admin/:id/status", adminAuth, async (req, res) => {
  const { status, catatan_hrd } = req.body;
  const valid = ["pending","administrasi","tes_tulis","micro_teaching","wawancara","final","diterima","ditolak"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Status tidak valid" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Ambil lamaran saat ini
    const [[lamaran]] = await conn.query(
      "SELECT user_id, status AS old_status FROM lamaran WHERE id = ?",
      [req.params.id]
    );
    if (!lamaran) {
      await conn.rollback();
      return res.status(404).json({ error: "Lamaran tidak ditemukan" });
    }

    // Update status lamaran
    await conn.query(
      "UPDATE lamaran SET status = ?, catatan_hrd = ?, updated_at = NOW() WHERE id = ?",
      [status, catatan_hrd || null, req.params.id]
    );

    // Sync hasil_seleksi untuk setiap tahap
    const [tahapRows] = await conn.query("SELECT id, urutan FROM tahap_seleksi ORDER BY urutan");
    const maxUrutan = tahapRows.length;
    const activeUrutan = STATUS_TAHAP_URUTAN[status] ?? 0;
    const oldActiveUrutan = STATUS_TAHAP_URUTAN[lamaran.old_status] ?? 0;

    for (const tahap of tahapRows) {
      let tahapStatus;
      if (status === "ditolak") {
        const rejectedAt = Math.min(Math.max(oldActiveUrutan, 1), maxUrutan);
        if (tahap.urutan < rejectedAt) tahapStatus = "lulus";
        else if (tahap.urutan === rejectedAt) tahapStatus = "tidak_lulus";
        else tahapStatus = "menunggu";
      } else if (activeUrutan >= 99) {
        tahapStatus = "lulus";
      } else if (activeUrutan === 0) {
        tahapStatus = "menunggu";
      } else if (tahap.urutan < activeUrutan) {
        tahapStatus = "lulus";
      } else if (tahap.urutan === activeUrutan) {
        tahapStatus = "proses";
      } else {
        tahapStatus = "menunggu";
      }

      // Upsert tanpa menimpa nilai yang sudah ada
      const [[existing]] = await conn.query(
        "SELECT id FROM hasil_seleksi WHERE lamaran_id = ? AND tahap_id = ?",
        [req.params.id, tahap.id]
      );
      if (existing) {
        await conn.query(
          "UPDATE hasil_seleksi SET status = ?, updated_at = NOW() WHERE id = ?",
          [tahapStatus, existing.id]
        );
      } else {
        await conn.query(
          "INSERT INTO hasil_seleksi (lamaran_id, tahap_id, status) VALUES (?, ?, ?)",
          [req.params.id, tahap.id, tahapStatus]
        );
      }
    }

    // Insert notifikasi ke pelamar
    const label = STATUS_LABEL[status] || status;
    let pesan;
    if (status === "diterima") {
      pesan = "Selamat! Anda telah diterima. Tim HRD akan segera menghubungi Anda.";
    } else if (status === "ditolak") {
      pesan = "Terima kasih atas partisipasinya. Sayang sekali, lamaran Anda tidak dapat kami lanjutkan saat ini.";
    } else {
      pesan = `Status lamaran Anda telah diperbarui ke tahap ${label}. Pantau progress di dashboard.`;
    }
    const tipe = status === "diterima" ? "sukses" : status === "ditolak" ? "peringatan" : "info";

    await conn.query(
      "INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, ?)",
      [lamaran.user_id, `Status Lamaran: ${label}`, pesan, tipe]
    );

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
