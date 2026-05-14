# Panduan Instalasi & Menjalankan Aplikasi di Ubuntu Server

Panduan ini menjelaskan cara menginstal dan menjalankan **HRD Radiant** (frontend + backend) di Ubuntu Server dari nol.

---

## Prasyarat

| Kebutuhan | Versi Minimum |
|---|---|
| Ubuntu Server | 20.04 LTS / 22.04 LTS |
| Node.js | 18.x ke atas |
| npm / pnpm | npm 9+ atau pnpm 8+ |
| MySQL / MariaDB | 10.4+ |
| Git | 2.x |

---

## 1. Update Sistem & Install Dependensi Dasar

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential
```

---

## 2. Install Node.js (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # pastikan v20.x
npm -v
```

### (Opsional) Install pnpm

```bash
npm install -g pnpm
```

---

## 3. Install MySQL / MariaDB

```bash
sudo apt install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mysql_secure_installation
```

> Ikuti wizard: set root password, hapus anonymous user, larang remote root login, hapus test database.

---

## 4. Buat Database & Import Schema

Masuk ke MySQL:

```bash
sudo mysql -u root -p
```

Jalankan perintah berikut di dalam MySQL shell:

```sql
CREATE DATABASE hrd_radiant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hrd_user'@'localhost' IDENTIFIED BY 'password_kuat_anda';
GRANT ALL PRIVILEGES ON hrd_radiant.* TO 'hrd_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import schema dari file SQL proyek:

```bash
mysql -u hrd_user -p hrd_radiant < database.sql
```

---

## 5. Clone Repositori

```bash
git clone https://github.com/hasanyusufmuizz-code/Project_PPL_kelompok8_HRD-Radiant.git
cd Project_PPL_kelompok8_HRD-Radiant
```

---

## 6. Konfigurasi Environment Backend

Buat file `.env` di dalam folder `server/`:

```bash
cp server/.env.example server/.env   # jika tersedia
# atau buat manual:
nano server/.env
```

Isi file `server/.env`:

```env
PORT=3001
DB_HOST=localhost
DB_USER=hrd_user
DB_PASSWORD=password_kuat_anda
DB_NAME=hrd_radiant
JWT_SECRET=ganti_dengan_string_acak_yang_panjang
```

> **Penting:** Ganti `JWT_SECRET` dengan string acak yang kuat (minimal 32 karakter).
> Bisa generate dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 7. Install Dependensi

### Backend

```bash
cd server
npm install
cd ..
```

### Frontend

```bash
npm install
# atau jika menggunakan pnpm:
pnpm install
```

---

## 8. Build Frontend (Production)

```bash
npm run build
```

Output build akan tersimpan di folder `dist/`. Folder ini yang di-serve oleh web server (Nginx/Apache) atau bisa juga di-serve langsung via Node.js.

---

## 9. Menjalankan Aplikasi

### Mode Development (tidak disarankan untuk production)

Buka **dua terminal**:

**Terminal 1 — Backend:**

```bash
npm run server
# atau langsung:
cd server && node index.js
```

**Terminal 2 — Frontend Dev Server:**

```bash
npm run dev
```

Frontend tersedia di `http://localhost:5173`, backend di `http://localhost:3001`.

---

### Mode Production dengan PM2 (Disarankan)

Install PM2 sebagai process manager:

```bash
npm install -g pm2
```

Jalankan backend dengan PM2:

```bash
cd server
pm2 start index.js --name "hrd-radiant-api"
cd ..
```

Simpan konfigurasi PM2 agar otomatis restart saat server reboot:

```bash
pm2 save
pm2 startup
# Jalankan perintah yang muncul dari output pm2 startup
```

Cek status proses:

```bash
pm2 status
pm2 logs hrd-radiant-api
```

---

## 10. Serve Frontend dengan Nginx

Install Nginx:

```bash
sudo apt install -y nginx
```

Buat konfigurasi virtual host:

```bash
sudo nano /etc/nginx/sites-available/hrd-radiant
```

Isi konfigurasi:

```nginx
server {
    listen 80;
    server_name your-domain.com;   # ganti dengan domain/IP server

    # Frontend (build output)
    root /path/ke/Project_PPL_kelompok8_HRD-Radiant/dist;
    index index.html;

    # SPA fallback — React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy ke backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi:

```bash
sudo ln -s /etc/nginx/sites-available/hrd-radiant /etc/nginx/sites-enabled/
sudo nginx -t          # verifikasi konfigurasi
sudo systemctl reload nginx
```

---

## 11. (Opsional) Konfigurasi CORS untuk Domain Production

Edit `server/index.js`, ubah bagian `cors` agar mengizinkan domain production:

```js
app.use(cors({
  origin: ["http://your-domain.com", "https://your-domain.com"],
  credentials: true,
}));
```

Restart backend setelah perubahan:

```bash
pm2 restart hrd-radiant-api
```

---

## Ringkasan Perintah Penting

| Aksi | Perintah |
|---|---|
| Jalankan backend (dev) | `npm run server` |
| Jalankan frontend (dev) | `npm run dev` |
| Build frontend | `npm run build` |
| Start backend dengan PM2 | `pm2 start server/index.js --name hrd-radiant-api` |
| Restart backend PM2 | `pm2 restart hrd-radiant-api` |
| Lihat log backend | `pm2 logs hrd-radiant-api` |
| Health check API | `curl http://localhost:3001/api/health` |

---

## Struktur Proyek

```
Project_PPL_kelompok8_HRD-Radiant/
├── src/                  # Source code frontend (React + TypeScript)
├── server/               # Backend Express.js
│   ├── routes/           # API route handlers
│   ├── middleware/       # Auth middleware (JWT)
│   ├── db.js             # Koneksi database MySQL
│   ├── index.js          # Entry point server
│   └── .env              # Konfigurasi environment (buat manual)
├── dist/                 # Output build frontend (generated)
├── database.sql          # Schema database MySQL
├── package.json          # Config frontend + script npm run server
└── INSTALL.md            # File ini
```

---

## Troubleshooting

**Error: `ECONNREFUSED` saat backend connect ke DB**
→ Pastikan MariaDB berjalan: `sudo systemctl status mariadb`
→ Pastikan nama database, user, dan password di `.env` sudah benar.

**Error: `Cannot find module` saat jalankan backend**
→ Pastikan `npm install` sudah dijalankan di dalam folder `server/`.

**Frontend tidak bisa hit API (`Network Error`)**
→ Pastikan backend berjalan di port 3001.
→ Jika production, pastikan Nginx proxy `/api/` sudah dikonfigurasi.

**Port 3001 sudah dipakai**
→ Ubah `PORT` di `server/.env` ke port lain (misalnya `3002`), lalu update Nginx proxy.
