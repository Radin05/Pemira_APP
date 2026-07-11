# Panduan Deployment — PEMIRA KM Poltekkes Kemenkes Bandung

Target arsitektur (keputusan 11 Juli 2026):

```
Pengunjung ──HTTPS──▶ Vercel (Next.js frontend)
                            │  fetch  /api/v1/*
                            ▼
                     VPS ──▶ Nginx/Caddy (TLS) ──▶ Spring Boot :8080 (Docker)
                                                        │
                                                        ▼
                                          Postgres cloud terkelola (Neon/Supabase)
                                                        │
                                          Bukti ──▶ Cloud object storage (R2/S3) *
```

\* Storage cloud belum diimplementasi di kode (lihat [Bagian 6](#6-yang-belum--todo-sebelum-benar-benar-live)). Saat ini bukti masih ke disk lokal.

> Prasyarat: [Arsitektur](03-ARCHITECTURE.md) · Toolchain lihat [ARSITEKTUR-PEMIRA.md](../ARSITEKTUR-PEMIRA.md)

---

## 1. Database — Postgres cloud (Neon / Supabase)

1. Buat project Postgres baru (Neon free tier cukup untuk skala ini).
2. Buat database, catat **connection string** (`postgresql://user:pass@host/db?sslmode=require`).
3. Tidak perlu buat tabel manual — **Flyway** membuat & memvalidasi skema otomatis saat backend start (`ddl-auto=validate`). Migrasi V1–V7 berjalan berurutan.

> Backup: Neon/Supabase menyediakan backup otomatis. Untuk self-host, jadwalkan `pg_dump` harian.

---

## 2. Backend — VPS + Docker

### 2.1 Build & jalankan
```bash
# di VPS, dalam folder pemira-backend/
docker build -t pemira-backend .
docker run -d --name pemira-backend \
  --restart unless-stopped \
  -p 127.0.0.1:8080:8080 \
  --env-file /etc/pemira/backend.env \
  pemira-backend
```

### 2.2 File env backend (`/etc/pemira/backend.env`)
```env
SPRING_PROFILES_ACTIVE=prod

# Database (dari Neon/Supabase). Format JDBC.
DB_URL=jdbc:postgresql://HOST:5432/DBNAME?sslmode=require
DB_USERNAME=xxxxx
DB_PASSWORD=xxxxx

# Rahasia — WAJIB kuat & minimal 32 byte. Generate: openssl rand -base64 48
APP_JWT_SECRET=<hasil openssl rand>
APP_ENCRYPTION_KEY=<TEPAT 32 karakter, jangan berubah setelah ada data!>

# Domain frontend Vercel (untuk CORS). Boleh lebih dari satu, pisah koma.
APP_CORS_ORIGINS=https://pemira-kp.vercel.app

# Lokasi simpan bukti (sementara, sebelum storage cloud aktif).
APP_STORAGE_DIR=/var/pemira/evidence
```

> ⚠️ **`APP_ENCRYPTION_KEY` tidak boleh diubah** setelah ada laporan tersimpan — identitas pelapor yang sudah dienkripsi tidak akan bisa didekripsi lagi. Simpan dengan aman.

### 2.3 Reverse proxy TLS (Caddy — paling mudah)
`/etc/caddy/Caddyfile`:
```
api.pemira-kp.domainmu.ac.id {
    reverse_proxy 127.0.0.1:8080
}
```
Caddy mengurus sertifikat HTTPS otomatis. Backend sudah `forward-headers-strategy: framework` sehingga cookie `Secure` & IP klien terbaca benar di belakang proxy.

---

## 3. Frontend — Vercel

1. Hubungkan repo ke Vercel, **Root Directory** = `pemira-frontend`.
2. Framework: Next.js (terdeteksi otomatis).
3. Set **Environment Variable**:
   ```
   NEXT_PUBLIC_API_BASE = https://api.pemira-kp.domainmu.ac.id/api/v1
   ```
4. Deploy. Vercel memberi domain `*.vercel.app` (atau pasang domain kustom).

> Setelah tahu domain Vercel-nya, **update `APP_CORS_ORIGINS` di backend** agar cocok, lalu restart backend.

---

## 4. Checklist Environment Variable

**Backend (VPS):**

| Var | Contoh | Wajib |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | ✅ |
| `DB_URL` | `jdbc:postgresql://…?sslmode=require` | ✅ |
| `DB_USERNAME` / `DB_PASSWORD` | — | ✅ |
| `APP_JWT_SECRET` | `openssl rand -base64 48` | ✅ |
| `APP_ENCRYPTION_KEY` | 32 karakter, permanen | ✅ |
| `APP_CORS_ORIGINS` | `https://…vercel.app` | ✅ |
| `APP_STORAGE_DIR` | `/var/pemira/evidence` | ⬜ (default ada) |

**Frontend (Vercel):**

| Var | Contoh | Wajib |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://api.…/api/v1` | ✅ |

---

## 5. Verifikasi pasca-deploy

```bash
# Backend hidup?
curl https://api.pemira-kp.domainmu.ac.id/actuator/health   # → {"status":"UP"}

# CORS benar? (dari browser di domain Vercel, buka DevTools → Network, login)
# Login staf harus 200 dan set cookie refreshToken (Secure).
```

Uji manual alur inti sekali: login staf → dashboard sesuai role; buka `/publikasi` publik.

**Seed akun staf produksi**: `DevDataSeeder` HANYA jalan di profil dev, jadi di prod belum ada akun. Buat akun ADMIN pertama lewat salah satu cara:
- Sementara set `SPRING_PROFILES_ACTIVE=dev,prod`? **Jangan** (dev seeder pakai password lemah).
- Rekomendasi: sisipkan satu migrasi seed ADMIN awal (bcrypt hash password kuat) atau buat lewat `psql` manual, lalu kelola user lain dari dashboard `/admin/users`.

---

## 6. Yang belum — TODO sebelum benar-benar live

| Item | Status | Catatan |
|---|---|---|
| **Storage cloud (R2/S3)** | ⛔ Belum | Bukti masih ke disk lokal `APP_STORAGE_DIR`. Jalan di satu VPS, TIDAK jalan bila backend di-scale >1 instance. Perlu implementasi `FileStorageService` S3-compatible + presigned URL. |
| **Rate limit lapor** | ⛔ Belum | Pelaporan terbuka tanpa login → rentan spam. Perlu batas per NPM/IP. |
| **Header keamanan (CSP/HSTS)** | ⛔ Belum | Tambah di Caddy/Nginx atau Spring. |
| **Akun ADMIN produksi** | ⛔ Belum | Belum ada mekanisme seed prod (lihat §5). |
| **Backup terverifikasi** | ⬜ | Pastikan restore backup DB pernah diuji. |
| **CI/CD** | ⬜ | Deploy masih manual. |

Backend gagal-start bila env wajib kosong (by design) — ini fitur, bukan bug.
