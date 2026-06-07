-- ============================================================
-- DATABASE SCHEMA: HRD SDM Management Bimbel Radiant
-- Kelompok 8 | PPL
-- Dibuat: 2026-05-14
-- Diperbarui: 2026-05-31 (disesuaikan dengan database yang sedang digunakan)
-- ============================================================

CREATE DATABASE IF NOT EXISTS hrd_radiant
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hrd_radiant;

-- ============================================================
-- 1. USERS (US-001 Login, US-002 Logout, US-003 Registrasi)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  email         VARCHAR(150)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('pelamar','hrd','admin') NOT NULL DEFAULT 'pelamar',
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  email_verified_at DATETIME    NULL DEFAULT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- 2. USER PROFILES (US-004 Edit Profil)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED  NOT NULL UNIQUE,
  nama_lengkap    VARCHAR(150)  NOT NULL,
  no_hp           VARCHAR(20)   NULL,
  alamat          TEXT          NULL,
  posisi_dilamar  VARCHAR(100)  NULL,
  pendidikan      VARCHAR(100)  NULL,
  instansi        VARCHAR(150)  NULL,
  tentang         TEXT          NULL,
  avatar_url      VARCHAR(255)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. LOWONGAN (Admin: Kelola Lowongan)
-- ============================================================
CREATE TABLE IF NOT EXISTS lowongan (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  posisi        VARCHAR(150)    NOT NULL,
  deskripsi     TEXT            NULL,
  persyaratan   TEXT            NULL,
  kuota         INT UNSIGNED    NOT NULL DEFAULT 1,
  deadline      DATE            NOT NULL,
  status        ENUM('aktif','ditutup','draft') NOT NULL DEFAULT 'aktif',
  dibuat_oleh   INT UNSIGNED    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_lowongan_status (status),
  INDEX idx_lowongan_deadline (deadline),
  CONSTRAINT fk_lowongan_hrd FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 4. LAMARAN (Pelamar mendaftar ke lowongan)
-- ============================================================
CREATE TABLE IF NOT EXISTS lamaran (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED    NOT NULL,
  lowongan_id   INT UNSIGNED    NOT NULL,
  status        ENUM('pending','administrasi','tes_tulis','micro_teaching','wawancara','final','diterima','ditolak') NOT NULL DEFAULT 'pending',
  tanggal_daftar DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  catatan_hrd   TEXT            NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lamaran_user_lowongan (user_id, lowongan_id),
  INDEX idx_lamaran_user (user_id),
  INDEX idx_lamaran_lowongan (lowongan_id),
  INDEX idx_lamaran_status (status),
  CONSTRAINT fk_lamaran_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lamaran_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. TAHAP SELEKSI (Master data tahap)
-- ============================================================
CREATE TABLE IF NOT EXISTS tahap_seleksi (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nama        VARCHAR(100)    NOT NULL,
  urutan      INT UNSIGNED    NOT NULL,
  deskripsi   TEXT            NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tahap_urutan (urutan)
) ENGINE=InnoDB;

-- ============================================================
-- 6. HASIL SELEKSI PER TAHAP (US-023 Dashboard status)
-- ============================================================
CREATE TABLE IF NOT EXISTS hasil_seleksi (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  lamaran_id    INT UNSIGNED    NOT NULL,
  tahap_id      INT UNSIGNED    NOT NULL,
  status        ENUM('menunggu','lulus','tidak_lulus','proses') NOT NULL DEFAULT 'menunggu',
  nilai         DECIMAL(5,2)    NULL,
  catatan       TEXT            NULL,
  dinilai_oleh  INT UNSIGNED    NULL,
  dinilai_pada  DATETIME        NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hasil_lamaran_tahap (lamaran_id, tahap_id),
  INDEX idx_hasil_lamaran (lamaran_id),
  INDEX idx_hasil_tahap (tahap_id),
  CONSTRAINT fk_hasil_lamaran FOREIGN KEY (lamaran_id) REFERENCES lamaran(id) ON DELETE CASCADE,
  CONSTRAINT fk_hasil_tahap FOREIGN KEY (tahap_id) REFERENCES tahap_seleksi(id) ON DELETE RESTRICT,
  CONSTRAINT fk_hasil_penilai FOREIGN KEY (dinilai_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 7. JADWAL SELEKSI (Admin: Kelola Jadwal)
-- ============================================================
CREATE TABLE IF NOT EXISTS jadwal_seleksi (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  tahap_id      INT UNSIGNED    NOT NULL,
  lowongan_id   INT UNSIGNED    NOT NULL,
  jenis         ENUM('tes_tertulis','micro_teaching','wawancara','tes_praktik') NOT NULL,
  tanggal       DATE            NOT NULL,
  waktu_mulai   TIME            NOT NULL,
  waktu_selesai TIME            NOT NULL,
  lokasi        VARCHAR(200)    NULL,
  link_online   VARCHAR(255)    NULL,
  keterangan    TEXT            NULL,
  dibuat_oleh   INT UNSIGNED    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_jadwal_tanggal (tanggal),
  INDEX idx_jadwal_lowongan (lowongan_id),
  CONSTRAINT fk_jadwal_tahap FOREIGN KEY (tahap_id) REFERENCES tahap_seleksi(id) ON DELETE RESTRICT,
  CONSTRAINT fk_jadwal_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan(id) ON DELETE CASCADE,
  CONSTRAINT fk_jadwal_hrd FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 8. PESERTA JADWAL (Pelamar yang dijadwalkan)
-- ============================================================
CREATE TABLE IF NOT EXISTS peserta_jadwal (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  jadwal_id     INT UNSIGNED    NOT NULL,
  lamaran_id    INT UNSIGNED    NOT NULL,
  status_hadir  ENUM('terdaftar','hadir','tidak_hadir','reschedule') NOT NULL DEFAULT 'terdaftar',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_peserta_jadwal (jadwal_id, lamaran_id),
  INDEX idx_peserta_jadwal (jadwal_id),
  INDEX idx_peserta_lamaran (lamaran_id),
  CONSTRAINT fk_peserta_jadwal FOREIGN KEY (jadwal_id) REFERENCES jadwal_seleksi(id) ON DELETE CASCADE,
  CONSTRAINT fk_peserta_lamaran FOREIGN KEY (lamaran_id) REFERENCES lamaran(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. DOKUMEN LAMARAN (Upload dokumen pelamar)
-- ============================================================
CREATE TABLE IF NOT EXISTS dokumen_lamaran (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  lamaran_id    INT UNSIGNED    NOT NULL,
  jenis_dokumen VARCHAR(100)    NOT NULL COMMENT 'cv, surat_lamaran, transkrip_nilai, ijazah, foto, ktp, atau kode dokumen khusus per lowongan',
  nama_file     VARCHAR(255)    NOT NULL,
  file_url      VARCHAR(500)    NOT NULL,
  ukuran_file   INT UNSIGNED    NULL COMMENT 'dalam bytes',
  status_verifikasi ENUM('belum_diproses','terverifikasi','ditolak') NOT NULL DEFAULT 'belum_diproses',
  catatan_verifikasi TEXT       NULL,
  diverifikasi_oleh INT UNSIGNED NULL,
  diverifikasi_pada DATETIME    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_dokumen_lamaran (lamaran_id),
  INDEX idx_dokumen_jenis (jenis_dokumen),
  CONSTRAINT fk_dokumen_lamaran FOREIGN KEY (lamaran_id) REFERENCES lamaran(id) ON DELETE CASCADE,
  CONSTRAINT fk_dokumen_verifikator FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 10. PENILAIAN WAWANCARA (Admin: Penilaian)
-- ============================================================
CREATE TABLE IF NOT EXISTS penilaian (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  lamaran_id      INT UNSIGNED    NOT NULL,
  jadwal_id       INT UNSIGNED    NULL,
  penilai_id      INT UNSIGNED    NOT NULL,
  nilai_kompetensi DECIMAL(5,2)   NULL,
  nilai_komunikasi DECIMAL(5,2)   NULL,
  nilai_kepribadian DECIMAL(5,2)  NULL,
  nilai_motivasi   DECIMAL(5,2)   NULL,
  nilai_total      DECIMAL(5,2)   NULL,
  rekomendasi     ENUM('sangat_direkomendasikan','direkomendasikan','tidak_direkomendasikan') NULL,
  catatan         TEXT            NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_penilaian_lamaran (lamaran_id),
  INDEX idx_penilaian_penilai (penilai_id),
  CONSTRAINT fk_penilaian_lamaran FOREIGN KEY (lamaran_id) REFERENCES lamaran(id) ON DELETE CASCADE,
  CONSTRAINT fk_penilaian_jadwal FOREIGN KEY (jadwal_id) REFERENCES jadwal_seleksi(id) ON DELETE SET NULL,
  CONSTRAINT fk_penilaian_penilai FOREIGN KEY (penilai_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- 11. NOTIFIKASI (Notifikasi untuk pelamar)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifikasi (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED    NOT NULL,
  judul       VARCHAR(200)    NOT NULL,
  pesan       TEXT            NOT NULL,
  tipe        ENUM('info','sukses','peringatan','urgent') NOT NULL DEFAULT 'info',
  is_read     TINYINT(1)      NOT NULL DEFAULT 0,
  link_url    VARCHAR(255)    NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (is_read),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. ONBOARDING (Karyawan yang diterima)
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id           INT UNSIGNED  NOT NULL UNIQUE,
  lamaran_id        INT UNSIGNED  NOT NULL UNIQUE,
  tanggal_mulai     DATE          NULL,
  posisi_resmi      VARCHAR(150)  NOT NULL,
  status            ENUM('menunggu','proses','selesai') NOT NULL DEFAULT 'menunggu',
  progress_persen   INT UNSIGNED  NOT NULL DEFAULT 0,
  catatan_hrd       TEXT          NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_onboarding_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_lamaran FOREIGN KEY (lamaran_id) REFERENCES lamaran(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 13. CHECKLIST ONBOARDING (Tugas/item onboarding)
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_checklist (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  onboarding_id   INT UNSIGNED    NOT NULL,
  item            VARCHAR(200)    NOT NULL,
  is_completed    TINYINT(1)      NOT NULL DEFAULT 0,
  completed_at    DATETIME        NULL,
  urutan          INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_checklist_onboarding (onboarding_id),
  CONSTRAINT fk_checklist_onboarding FOREIGN KEY (onboarding_id) REFERENCES onboarding(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 14. LAPORAN (Admin: Laporan & Statistik)
-- ============================================================
CREATE TABLE IF NOT EXISTS laporan (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  periode_mulai DATE            NOT NULL,
  periode_akhir DATE            NOT NULL,
  judul         VARCHAR(200)    NOT NULL,
  total_pelamar INT UNSIGNED    NOT NULL DEFAULT 0,
  total_lulus   INT UNSIGNED    NOT NULL DEFAULT 0,
  total_ditolak INT UNSIGNED    NOT NULL DEFAULT 0,
  total_proses  INT UNSIGNED    NOT NULL DEFAULT 0,
  data_json     JSON            NULL COMMENT 'Data detail dalam format JSON',
  dibuat_oleh   INT UNSIGNED    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_laporan_hrd FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 15. BERKAS INTI (Dokumen core pelamar, tidak terikat lamaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS berkas_inti (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id             INT UNSIGNED    NOT NULL,
  jenis_dokumen       VARCHAR(100)    NOT NULL,
  nama_file           VARCHAR(255)    NOT NULL,
  file_url            VARCHAR(500)    NOT NULL,
  ukuran_file         INT UNSIGNED    NULL COMMENT 'dalam bytes',
  status_verifikasi   ENUM('belum_diproses','terverifikasi','ditolak') NOT NULL DEFAULT 'belum_diproses',
  catatan_verifikasi  TEXT            NULL,
  diverifikasi_oleh   INT UNSIGNED    NULL,
  diverifikasi_pada   DATETIME        NULL,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_user_jenis (user_id, jenis_dokumen),
  INDEX idx_berkas_inti_user (user_id),
  CONSTRAINT fk_berkas_inti_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_berkas_inti_verifikator FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 16. SYARAT DOKUMEN KHUSUS PER LOWONGAN (Admin configurable)
-- ============================================================
CREATE TABLE IF NOT EXISTS syarat_dokumen_lowongan (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  lowongan_id   INT UNSIGNED    NOT NULL,
  nama_dokumen  VARCHAR(255)    NOT NULL COMMENT 'e.g. Skor IELTS',
  kode_dokumen  VARCHAR(100)    NOT NULL COMMENT 'e.g. sertifikat_ielts',
  deskripsi     VARCHAR(500)    NULL,
  wajib         TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_syarat_lowongan (lowongan_id),
  CONSTRAINT fk_syarat_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 17. SESSION TOKENS (untuk autentikasi stateless)
-- ============================================================
CREATE TABLE IF NOT EXISTS session_tokens (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED    NOT NULL,
  token       VARCHAR(500)    NOT NULL UNIQUE,
  expires_at  DATETIME        NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_token (token(100)),
  INDEX idx_session_user (user_id),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 18. BANK SOAL (Master soal untuk Tes Online)
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_soal (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  tipe            ENUM('pilihan_ganda','esai') NOT NULL,
  pertanyaan      TEXT            NOT NULL,
  opsi_a          TEXT            NULL,
  opsi_b          TEXT            NULL,
  opsi_c          TEXT            NULL,
  opsi_d          TEXT            NULL,
  kunci_jawaban   VARCHAR(10)     NULL,
  bobot           INT UNSIGNED    NOT NULL DEFAULT 1,
  lowongan_id     INT UNSIGNED    NULL,
  dibuat_oleh     INT UNSIGNED    NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_bank_soal_lowongan (lowongan_id),
  CONSTRAINT fk_bank_soal_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan(id) ON DELETE CASCADE,
  CONSTRAINT fk_bank_soal_pembuat FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 19. TES ONLINE (Sesi tes yang dibuat HRD)
-- ============================================================
CREATE TABLE IF NOT EXISTS tes_online (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  judul         VARCHAR(200)    NOT NULL,
  durasi_menit  INT UNSIGNED    NOT NULL DEFAULT 60,
  jumlah_soal   INT UNSIGNED    NOT NULL DEFAULT 0,
  kkm           DECIMAL(5,2)    NOT NULL DEFAULT 60,
  status        ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  lowongan_id   INT UNSIGNED    NULL,
  jadwal_id     INT UNSIGNED    NULL,
  dibuat_oleh   INT UNSIGNED    NOT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tes_online_lowongan (lowongan_id),
  INDEX idx_tes_online_jadwal (jadwal_id),
  CONSTRAINT fk_tes_online_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan(id) ON DELETE SET NULL,
  CONSTRAINT fk_tes_online_jadwal FOREIGN KEY (jadwal_id) REFERENCES jadwal_seleksi(id) ON DELETE SET NULL,
  CONSTRAINT fk_tes_online_pembuat FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- 20. TES SOAL (Relasi soal di dalam suatu tes & urutannya)
-- ============================================================
CREATE TABLE IF NOT EXISTS tes_soal (
  id        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  tes_id    INT UNSIGNED    NOT NULL,
  soal_id   INT UNSIGNED    NOT NULL,
  urutan    INT UNSIGNED    NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tes_soal (tes_id, soal_id),
  INDEX idx_tes_soal_tes (tes_id),
  INDEX idx_tes_soal_soal (soal_id),
  CONSTRAINT fk_tes_soal_tes FOREIGN KEY (tes_id) REFERENCES tes_online(id) ON DELETE CASCADE,
  CONSTRAINT fk_tes_soal_soal FOREIGN KEY (soal_id) REFERENCES bank_soal(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 21. TES PENGERJAAN (Sesi pengerjaan tes oleh pelamar)
-- ============================================================
CREATE TABLE IF NOT EXISTS tes_pengerjaan (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  tes_id          INT UNSIGNED    NOT NULL,
  lamaran_id      INT UNSIGNED    NOT NULL,
  status          ENUM('belum_mulai','berlangsung','selesai','menunggu_koreksi') NOT NULL DEFAULT 'belum_mulai',
  skor            DECIMAL(5,2)    NULL,
  jumlah_benar    INT UNSIGNED    NULL,
  waktu_mulai     DATETIME        NULL,
  waktu_selesai   DATETIME        NULL,
  waktu_deadline  DATETIME        NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tes_pengerjaan (tes_id, lamaran_id),
  INDEX idx_tes_pengerjaan_lamaran (lamaran_id),
  CONSTRAINT fk_tes_pengerjaan_tes FOREIGN KEY (tes_id) REFERENCES tes_online(id) ON DELETE CASCADE,
  CONSTRAINT fk_tes_pengerjaan_lamaran FOREIGN KEY (lamaran_id) REFERENCES lamaran(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 22. TES JAWABAN (Jawaban pelamar per soal)
-- ============================================================
CREATE TABLE IF NOT EXISTS tes_jawaban (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  pengerjaan_id   INT UNSIGNED    NOT NULL,
  soal_id         INT UNSIGNED    NOT NULL,
  jawaban         VARCHAR(10)     NULL,
  jawaban_text    TEXT            NULL,
  is_benar        TINYINT(1)      NULL,
  nilai_esai      DECIMAL(5,2)    NULL,
  is_dinilai      TINYINT(1)      NOT NULL DEFAULT 0,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tes_jawaban (pengerjaan_id, soal_id),
  INDEX idx_tes_jawaban_soal (soal_id),
  CONSTRAINT fk_tes_jawaban_pengerjaan FOREIGN KEY (pengerjaan_id) REFERENCES tes_pengerjaan(id) ON DELETE CASCADE,
  CONSTRAINT fk_tes_jawaban_soal FOREIGN KEY (soal_id) REFERENCES bank_soal(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DATA AWAL (Seed Data)
-- ============================================================

-- Tahap seleksi default
INSERT INTO tahap_seleksi (nama, urutan, deskripsi) VALUES
  ('Pendaftaran & Administrasi', 1, 'Verifikasi kelengkapan berkas lamaran oleh tim HRD'),
  ('Tes Tulis (CBT)',            2, 'Tes kemampuan akademik dan pedagogik secara online'),
  ('Micro Teaching',             3, 'Demonstrasi mengajar di depan panel penilai'),
  ('Wawancara HR & User',        4, 'Wawancara dengan tim HRD dan user/kepala divisi'),
  ('Keputusan Final',            5, 'Keputusan akhir penerimaan karyawan')
ON DUPLICATE KEY UPDATE nama = VALUES(nama);

-- Akun sistem (admin & hrd) — hash bcrypt sesuai database yang sedang digunakan
INSERT INTO users (email, password_hash, role, is_active, email_verified_at) VALUES
  ('admin@radiant.sch.id', '$2a$12$6bxj5Ph.X2eV2no7IvdyDO5WlY3D901T0gsPUBDuJkRl2Dlb3kole', 'admin', 1, NOW()),
  ('hrd@radiant.sch.id',   '$2a$12$6bxj5Ph.X2eV2no7IvdyDO5WlY3D901T0gsPUBDuJkRl2Dlb3kole', 'hrd',   1, NOW())
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Profil admin
INSERT INTO user_profiles (user_id, nama_lengkap, posisi_dilamar) VALUES
  (1, 'Administrator Radiant', 'Admin Sistem'),
  (2, 'Tim HRD Radiant', 'HRD Manager')
ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap);

-- Lowongan contoh
INSERT INTO lowongan (posisi, deskripsi, persyaratan, kuota, deadline, status, dibuat_oleh) VALUES
  ('Guru Matematika',
   'Mencari tenaga pendidik Matematika yang kompeten dan berpengalaman.',
   'S1 Pendidikan Matematika/Matematika, IPK minimal 3.0, Pengalaman mengajar min 1 tahun',
   3, '2026-06-29', 'aktif', 2),
  ('Guru Bahasa Inggris',
   'Mencari guru Bahasa Inggris yang komunikatif dan inovatif.',
   'S1 Pendidikan Bahasa Inggris, Sertifikat TOEFL min 550, Mampu mengajar semua jenjang',
   2, '2026-06-30', 'aktif', 2),
  ('Guru Fisika',
   'Tenaga pendidik Fisika untuk kelas intensif persiapan SNBT.',
   'S1 Fisika/Pendidikan Fisika, Pengalaman bimbel diutamakan',
   2, '2026-05-31', 'aktif', 2),
  ('Admin Keuangan',
   'Staf administrasi keuangan dan pembukuan.',
   'D3/S1 Akuntansi, Menguasai MS Excel/Google Sheets, Teliti dan jujur',
   1, '2026-05-31', 'aktif', 2)
ON DUPLICATE KEY UPDATE posisi = VALUES(posisi);

-- ============================================================
-- VIEWS untuk Dashboard (US-023)
-- ============================================================

CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM lamaran) AS total_pelamar,
  (SELECT COUNT(*) FROM lamaran WHERE status IN ('diterima')) AS total_diterima,
  (SELECT COUNT(*) FROM lamaran WHERE status NOT IN ('diterima','ditolak','pending')) AS total_proses,
  (SELECT COUNT(*) FROM lowongan WHERE status = 'aktif') AS lowongan_aktif,
  (SELECT COUNT(*) FROM users WHERE role = 'pelamar') AS total_pengguna;

CREATE OR REPLACE VIEW v_lamaran_detail AS
SELECT
  l.id AS lamaran_id,
  l.status,
  l.tanggal_daftar,
  u.id AS user_id,
  u.email,
  up.nama_lengkap,
  up.no_hp,
  up.avatar_url,
  lw.id AS lowongan_id,
  lw.posisi,
  lw.deadline
FROM lamaran l
  JOIN users u          ON l.user_id     = u.id
  LEFT JOIN user_profiles up ON u.id    = up.user_id
  JOIN lowongan lw      ON l.lowongan_id = lw.id;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
