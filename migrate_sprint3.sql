-- ============================================================
-- MIGRATION: Sprint 3 — US-015 s.d. US-021
-- Kelompok 8 | PPL
-- Additive migration on top of database.sql
-- ============================================================

USE hrd_radiant;

-- ============================================================
-- Extend role ENUM: tambah 'manajer_training' dan 'pimpinan'
-- (US-017/018/019 Manajer Training, US-021 Pimpinan)
-- ============================================================
ALTER TABLE users
  MODIFY COLUMN role ENUM('pelamar','hrd','admin','manajer_training','pimpinan')
  NOT NULL DEFAULT 'pelamar';

-- ============================================================
-- MATERI TRAINING (US-017 Kelola Materi Training, US-020 Akses Materi)
-- ============================================================
CREATE TABLE IF NOT EXISTS materi_training (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  judul         VARCHAR(200)    NOT NULL,
  deskripsi     TEXT            NULL,
  nama_file     VARCHAR(255)    NOT NULL,
  file_url      VARCHAR(500)    NOT NULL,
  ukuran_file   INT UNSIGNED    NULL COMMENT 'dalam bytes',
  pemateri_nama VARCHAR(150)    NOT NULL,
  dibuat_oleh   INT UNSIGNED    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_materi_dibuat_oleh FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- JADWAL TRAINING (US-018 Jadwal Training)
-- ============================================================
CREATE TABLE IF NOT EXISTS jadwal_training (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  tanggal       DATE            NOT NULL,
  waktu_mulai   TIME            NOT NULL,
  waktu_selesai TIME            NULL,
  lokasi        VARCHAR(200)    NULL,
  pemateri_nama VARCHAR(150)    NOT NULL,
  materi_id     INT UNSIGNED    NULL,
  keterangan    TEXT            NULL,
  dibuat_oleh   INT UNSIGNED    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_jadwal_training_tanggal (tanggal),
  CONSTRAINT fk_jt_materi FOREIGN KEY (materi_id) REFERENCES materi_training(id) ON DELETE SET NULL,
  CONSTRAINT fk_jt_dibuat_oleh FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- PESERTA TRAINING (US-018 daftar peserta, US-019 Absensi Training)
-- status_hadir dipakai dua kali: sebagai daftar peserta terdaftar
-- dan sebagai catatan absensi per sesi.
-- ============================================================
CREATE TABLE IF NOT EXISTS training_peserta (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  jadwal_training_id  INT UNSIGNED    NOT NULL,
  user_id             INT UNSIGNED    NOT NULL,
  status_hadir        ENUM('terdaftar','hadir','tidak_hadir') NOT NULL DEFAULT 'terdaftar',
  hadir_pada          DATETIME        NULL,
  dicatat_oleh        INT UNSIGNED    NULL,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_training_peserta (jadwal_training_id, user_id),
  INDEX idx_tp_jadwal (jadwal_training_id),
  INDEX idx_tp_user (user_id),
  CONSTRAINT fk_tp_jadwal FOREIGN KEY (jadwal_training_id) REFERENCES jadwal_training(id) ON DELETE CASCADE,
  CONSTRAINT fk_tp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tp_dicatat_oleh FOREIGN KEY (dicatat_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- DATA AWAL untuk testing (Sprint 3)
-- Password hash sama dengan admin/hrd seed di database.sql
-- ============================================================
INSERT INTO users (email, password_hash, role, is_active, email_verified_at) VALUES
  ('manajertraining@radiant.sch.id', '$2a$12$6bxj5Ph.X2eV2no7IvdyDO5WlY3D901T0gsPUBDuJkRl2Dlb3kole', 'manajer_training', 1, NOW()),
  ('pimpinan@radiant.sch.id',        '$2a$12$6bxj5Ph.X2eV2no7IvdyDO5WlY3D901T0gsPUBDuJkRl2Dlb3kole', 'pimpinan',        1, NOW())
ON DUPLICATE KEY UPDATE role = VALUES(role);

INSERT INTO user_profiles (user_id, nama_lengkap, posisi_dilamar)
SELECT id, 'Manajer Training Radiant', 'Manajer Training' FROM users WHERE email = 'manajertraining@radiant.sch.id'
ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap);

INSERT INTO user_profiles (user_id, nama_lengkap, posisi_dilamar)
SELECT id, 'Pimpinan Radiant', 'Pimpinan' FROM users WHERE email = 'pimpinan@radiant.sch.id'
ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
