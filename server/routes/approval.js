const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

// ================================================================
// GET /api/approval/stats — Statistik summary approval
// ================================================================
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [[menunggu]] = await db.query(
      `SELECT COUNT(*) AS total FROM lamaran WHERE status = 'final'`
    );

    const bulanIni = new Date();
    const bulanStr = `${bulanIni.getFullYear()}-${String(bulanIni.getMonth() + 1).padStart(2, "0")}`;

    const [[diterima]] = await db.query(
      `SELECT COUNT(*) AS total FROM keputusan_kandidat
       WHERE keputusan = 'diterima'
         AND DATE_FORMAT(tanggal_keputusan, '%Y-%m') = ?`,
      [bulanStr]
    );

    const [[ditolak]] = await db.query(
      `SELECT COUNT(*) AS total FROM keputusan_kandidat
       WHERE keputusan = 'ditolak'
         AND DATE_FORMAT(tanggal_keputusan, '%Y-%m') = ?`,
      [bulanStr]
    );

    const [[totalDiputuskan]] = await db.query(
      `SELECT COUNT(*) AS total FROM keputusan_kandidat`
    );

    res.json({
      menungguKeputusan: menunggu.total,
      diterimabulanIni: diterima.total,
      ditolakBulanIni: ditolak.total,
      totalDiputuskan: totalDiputuskan.total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================================================================
// GET /api/approval/kandidat — Kandidat di tahap final (menunggu keputusan)
// ================================================================
router.get("/kandidat", adminAuth, async (req, res) => {
  const { search, lowonganId } = req.query;
  try {
    let sql = `
      SELECT
        l.id AS lamaran_id,
        l.status,
        l.tanggal_daftar,
        l.catatan_hrd,
        u.id AS user_id,
        u.email,
        up.nama_lengkap,
        up.no_hp,
        up.pendidikan,
        up.instansi,
        up.avatar_url,
        lw.id AS lowongan_id,
        lw.posisi,
        lw.deadline,
        (
          SELECT AVG(hs2.nilai)
          FROM hasil_seleksi hs2
          WHERE hs2.lamaran_id = l.id AND hs2.nilai IS NOT NULL
        ) AS nilai_rata_rata,
        (
          SELECT COUNT(*)
          FROM hasil_seleksi hs3
          WHERE hs3.lamaran_id = l.id AND hs3.status = 'lulus'
        ) AS tahap_lulus,
        (
          SELECT p.nilai_total
          FROM penilaian p
          WHERE p.lamaran_id = l.id
          ORDER BY p.created_at DESC LIMIT 1
        ) AS nilai_wawancara,
        (
          SELECT p.rekomendasi
          FROM penilaian p
          WHERE p.lamaran_id = l.id
          ORDER BY p.created_at DESC LIMIT 1
        ) AS rekomendasi_wawancara,
        kk.keputusan AS keputusan_final,
        kk.tanggal_keputusan,
        kk.alasan AS alasan_keputusan
      FROM lamaran l
      JOIN users u ON u.id = l.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      JOIN lowongan lw ON lw.id = l.lowongan_id
      LEFT JOIN keputusan_kandidat kk ON kk.lamaran_id = l.id
      WHERE l.status = 'final'
    `;
    const params = [];

    if (search) {
      sql += " AND (up.nama_lengkap LIKE ? OR u.email LIKE ? OR lw.posisi LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (lowonganId) {
      sql += " AND l.lowongan_id = ?";
      params.push(lowonganId);
    }

    sql += " ORDER BY l.tanggal_daftar ASC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================================================================
// GET /api/approval/kandidat/:id — Detail kandidat (riwayat seleksi)
// ================================================================
router.get("/kandidat/:id", adminAuth, async (req, res) => {
  const lamaranId = req.params.id;
  try {
    // Info dasar lamaran
    const [[lamaran]] = await db.query(
      `SELECT
         l.id, l.status, l.tanggal_daftar, l.catatan_hrd,
         u.id AS user_id, u.email,
         up.nama_lengkap, up.no_hp, up.alamat, up.pendidikan, up.instansi,
         up.tentang, up.avatar_url, up.posisi_dilamar,
         lw.posisi, lw.id AS lowongan_id
       FROM lamaran l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       JOIN lowongan lw ON lw.id = l.lowongan_id
       WHERE l.id = ?`,
      [lamaranId]
    );
    if (!lamaran) return res.status(404).json({ error: "Lamaran tidak ditemukan" });

    // Riwayat setiap tahap seleksi
    const [tahapRiwayat] = await db.query(
      `SELECT
         ts.id AS tahap_id, ts.nama AS nama_tahap, ts.urutan,
         hs.status AS status_tahap, hs.nilai, hs.catatan, hs.dinilai_pada,
         js.tanggal AS tgl_jadwal, js.lokasi, js.jenis
       FROM tahap_seleksi ts
       LEFT JOIN hasil_seleksi hs ON hs.tahap_id = ts.id AND hs.lamaran_id = ?
       LEFT JOIN peserta_jadwal pj ON pj.lamaran_id = ?
       LEFT JOIN jadwal_seleksi js ON js.id = pj.jadwal_id AND js.tahap_id = ts.id
       GROUP BY ts.id
       ORDER BY ts.urutan ASC`,
      [lamaranId, lamaranId]
    );

    // Penilaian wawancara (detail)
    const [penilaian] = await db.query(
      `SELECT
         p.nilai_kompetensi, p.nilai_komunikasi, p.nilai_kepribadian,
         p.nilai_motivasi, p.nilai_total, p.rekomendasi, p.catatan,
         p.created_at AS tanggal_penilaian,
         up.nama_lengkap AS nama_penilai
       FROM penilaian p
       LEFT JOIN users u ON u.id = p.penilai_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE p.lamaran_id = ?
       ORDER BY p.created_at DESC`,
      [lamaranId]
    );

    // Dokumen yang sudah diupload
    const [dokumen] = await db.query(
      `SELECT jenis_dokumen, nama_file, file_url, status_verifikasi
       FROM dokumen_lamaran
       WHERE lamaran_id = ?
       ORDER BY created_at ASC`,
      [lamaranId]
    );

    // Keputusan yang sudah dibuat (jika ada)
    const [[keputusan]] = await db.query(
      `SELECT kk.keputusan, kk.alasan, kk.tanggal_keputusan,
              up.nama_lengkap AS nama_pemutus
       FROM keputusan_kandidat kk
       LEFT JOIN users u ON u.id = kk.diputuskan_oleh
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE kk.lamaran_id = ?`,
      [lamaranId]
    );

    res.json({
      lamaran,
      tahapRiwayat,
      penilaian,
      dokumen,
      keputusan: keputusan || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================================================================
// POST /api/approval/kandidat/:id/keputusan — Submit keputusan final
// ================================================================
router.post("/kandidat/:id/keputusan", adminAuth, async (req, res) => {
  const lamaranId = req.params.id;
  const { keputusan, alasan } = req.body;
  const adminId = req.user.id;

  if (!["diterima", "ditolak"].includes(keputusan)) {
    return res.status(400).json({ error: "Keputusan harus 'diterima' atau 'ditolak'" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Cek lamaran ada dan statusnya final
    const [[lamaran]] = await conn.query(
      `SELECT l.id, l.status, l.user_id, lw.posisi
       FROM lamaran l
       JOIN lowongan lw ON lw.id = l.lowongan_id
       WHERE l.id = ?`,
      [lamaranId]
    );
    if (!lamaran) {
      await conn.rollback();
      return res.status(404).json({ error: "Lamaran tidak ditemukan" });
    }
    if (lamaran.status !== "final") {
      await conn.rollback();
      return res.status(400).json({ error: "Lamaran harus berada di tahap final untuk diputuskan" });
    }

    // Cek apakah sudah pernah diputuskan
    const [[existing]] = await conn.query(
      `SELECT id FROM keputusan_kandidat WHERE lamaran_id = ?`,
      [lamaranId]
    );
    if (existing) {
      await conn.rollback();
      return res.status(409).json({ error: "Keputusan sudah pernah dibuat untuk kandidat ini" });
    }

    // 1. Update status lamaran
    await conn.query(
      `UPDATE lamaran SET status = ?, updated_at = NOW() WHERE id = ?`,
      [keputusan, lamaranId]
    );

    // 2. Simpan record keputusan
    await conn.query(
      `INSERT INTO keputusan_kandidat (lamaran_id, diputuskan_oleh, keputusan, alasan)
       VALUES (?, ?, ?, ?)`,
      [lamaranId, adminId, keputusan, alasan || null]
    );

    // 3. Update hasil_seleksi tahap 5 (Keputusan Final)
    const [[tahapFinal]] = await conn.query(
      `SELECT id FROM tahap_seleksi WHERE urutan = 5 LIMIT 1`
    );
    if (tahapFinal) {
      const statusHasil = keputusan === "diterima" ? "lulus" : "tidak_lulus";
      const [[hasilExisting]] = await conn.query(
        `SELECT id FROM hasil_seleksi WHERE lamaran_id = ? AND tahap_id = ?`,
        [lamaranId, tahapFinal.id]
      );
      if (hasilExisting) {
        await conn.query(
          `UPDATE hasil_seleksi SET status = ?, dinilai_oleh = ?, dinilai_pada = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [statusHasil, adminId, hasilExisting.id]
        );
      } else {
        await conn.query(
          `INSERT INTO hasil_seleksi (lamaran_id, tahap_id, status, dinilai_oleh, dinilai_pada)
           VALUES (?, ?, ?, ?, NOW())`,
          [lamaranId, tahapFinal.id, statusHasil, adminId]
        );
      }
    }

    // 4. Kirim notifikasi ke pelamar
    let judulNotif, pesanNotif, tipeNotif;
    if (keputusan === "diterima") {
      judulNotif = "🎉 Selamat! Anda Diterima di Radiant";
      pesanNotif = `Selamat! Lamaran Anda untuk posisi ${lamaran.posisi} telah DITERIMA. Tim HRD akan segera menghubungi Anda untuk proses onboarding.`;
      tipeNotif = "sukses";
    } else {
      judulNotif = "Informasi Hasil Seleksi";
      pesanNotif = `Terima kasih atas partisipasi Anda melamar posisi ${lamaran.posisi}. Setelah melalui pertimbangan, kami belum dapat melanjutkan proses rekrutmen Anda saat ini.${alasan ? ` Catatan: ${alasan}` : ""} Semoga berhasil di kesempatan berikutnya.`;
      tipeNotif = "peringatan";
    }
    await conn.query(
      `INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, ?)`,
      [lamaran.user_id, judulNotif, pesanNotif, tipeNotif]
    );

    // 5. Jika diterima, buat record onboarding
    if (keputusan === "diterima") {
      // Cek apakah onboarding sudah ada
      const [[onbExisting]] = await conn.query(
        `SELECT id FROM onboarding WHERE lamaran_id = ?`,
        [lamaranId]
      );
      if (!onbExisting) {
        await conn.query(
          `INSERT INTO onboarding (user_id, lamaran_id, posisi_resmi, status, progress_persen)
           VALUES (?, ?, ?, 'menunggu', 0)`,
          [lamaran.user_id, lamaranId, lamaran.posisi]
        );
      }
    }

    await conn.commit();
    res.json({
      success: true,
      message: keputusan === "diterima"
        ? "Kandidat berhasil diterima dan proses onboarding dimulai"
        : "Keputusan penolakan berhasil disimpan",
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
});

// ================================================================
// GET /api/approval/riwayat — Riwayat semua keputusan yang sudah dibuat
// ================================================================
router.get("/riwayat", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         kk.id, kk.keputusan, kk.alasan, kk.tanggal_keputusan,
         l.id AS lamaran_id,
         u.email,
         up.nama_lengkap,
         lw.posisi,
         up2.nama_lengkap AS nama_pemutus
       FROM keputusan_kandidat kk
       JOIN lamaran l ON l.id = kk.lamaran_id
       JOIN users u ON u.id = l.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       JOIN lowongan lw ON lw.id = l.lowongan_id
       LEFT JOIN users u2 ON u2.id = kk.diputuskan_oleh
       LEFT JOIN user_profiles up2 ON up2.user_id = u2.id
       ORDER BY kk.tanggal_keputusan DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
