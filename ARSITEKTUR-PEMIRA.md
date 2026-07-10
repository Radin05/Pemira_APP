# Arsitektur Teknis — Aplikasi PEMIRA IKM UI 2025

Stack: **Java Spring Boot (backend)** + **Next.js/React + TypeScript (frontend)**

---

## 1. Domain & Role (ringkasan)

Role sistem:
- `MAHASISWA` — mengirim laporan (bisa login pakai akun kampus/SSO atau minimal NPM+nama)
- `HUKUM_SEKRETARIAT` — investigasi laporan, cross-check, buat laporan hasil investigasi
- `KETUA_KP` — approve/reject laporan hasil investigasi
- `PDD` — publish laporan yang sudah di-approve (IG + aplikasi)
- `ADMIN` (opsional) — kelola user, kelola calon (kandidat)

Alur status laporan (state machine):
```
DITERIMA → DIVERIFIKASI (proses cross-check)
         → VALID / HOAX
             VALID  → DIBUAT_LAPORAN_INVESTIGASI → MENUNGGU_PERSETUJUAN_KETUA
                       → DISETUJUI → DIPUBLIKASI (oleh PDD)
                       → DITOLAK → SELESAI (arsip)
             HOAX   → DICATAT_HOAX → SELESAI (tindak lanjut ke pelapor di luar sistem)
```

---

## 2. Struktur Project

### Backend (Spring Boot) — Layered + Domain-oriented package

Gunakan **package-by-feature**, bukan package-by-layer murni (`controller/`, `service/`, `repository/` global) — lebih gampang di-maintain saat fitur nambah banyak (laporan, kandidat, user, publikasi).

```
pemira-backend/
├── src/main/java/id/ikmui/pemira/
│   ├── PemiraApplication.java
│   │
│   ├── config/                     # konfigurasi global
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   ├── CorsConfig.java
│   │   ├── SwaggerConfig.java
│   │   └── WebConfig.java
│   │
│   ├── common/                     # shared utilities lintas modul
│   │   ├── response/
│   │   │   ├── ApiResponse.java        # wrapper response standar
│   │   │   └── PagedResponse.java
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── BadRequestException.java
│   │   │   └── ForbiddenException.java
│   │   ├── util/
│   │   │   ├── DateUtil.java
│   │   │   └── FileUtil.java
│   │   └── constant/
│   │       ├── RoleName.java
│   │       └── ReportStatus.java
│   │
│   ├── auth/                       # modul autentikasi
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   ├── AuthServiceImpl.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   └── RegisterRequest.java
│   │   └── security/
│   │       ├── JwtTokenProvider.java
│   │       ├── JwtAuthFilter.java
│   │       └── CustomUserDetailsService.java
│   │
│   ├── user/                       # user & role management
│   │   ├── User.java                   # entity
│   │   ├── Role.java                   # entity
│   │   ├── UserRepository.java
│   │   ├── UserController.java
│   │   ├── UserService.java
│   │   ├── UserServiceImpl.java
│   │   ├── dto/
│   │   │   ├── UserRequest.java
│   │   │   └── UserResponse.java
│   │   └── mapper/UserMapper.java
│   │
│   ├── candidate/                  # data calon ketua BEM/BPM
│   │   ├── Candidate.java
│   │   ├── CandidateRepository.java
│   │   ├── CandidateController.java
│   │   ├── CandidateService.java
│   │   ├── CandidateServiceImpl.java
│   │   ├── dto/
│   │   └── mapper/
│   │
│   ├── report/                     # MODUL INTI: laporan pelanggaran
│   │   ├── Report.java                 # entity
│   │   ├── ReportEvidence.java         # entity (lampiran bukti)
│   │   ├── ReportStatusHistory.java    # entity (audit trail status)
│   │   ├── ReportRepository.java
│   │   ├── ReportController.java       # endpoint mahasiswa submit laporan
│   │   ├── ReportService.java
│   │   ├── ReportServiceImpl.java
│   │   ├── dto/
│   │   │   ├── ReportSubmitRequest.java
│   │   │   ├── ReportResponse.java
│   │   │   └── ReportDetailResponse.java
│   │   └── mapper/ReportMapper.java
│   │
│   ├── investigation/              # modul divisi Hukum & Sekretariat
│   │   ├── Investigation.java          # entity (hasil cross-check)
│   │   ├── InvestigationRepository.java
│   │   ├── InvestigationController.java
│   │   ├── InvestigationService.java
│   │   ├── InvestigationServiceImpl.java
│   │   ├── dto/
│   │   │   ├── InvestigationRequest.java   # valid / hoax + catatan
│   │   │   └── InvestigationReportRequest.java # laporan resmi ke ketua
│   │   └── mapper/
│   │
│   ├── approval/                   # modul Ketua KP
│   │   ├── ApprovalController.java
│   │   ├── ApprovalService.java
│   │   ├── ApprovalServiceImpl.java
│   │   └── dto/ApprovalRequest.java    # approve / reject + alasan
│   │
│   ├── publication/                 # modul PDD
│   │   ├── Publication.java            # entity
│   │   ├── PublicationRepository.java
│   │   ├── PublicationController.java
│   │   ├── PublicationService.java
│   │   ├── PublicationServiceImpl.java
│   │   └── dto/
│   │
│   └── notification/               # opsional: notifikasi antar role
│       ├── Notification.java
│       ├── NotificationService.java
│       └── NotificationServiceImpl.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/               # Flyway migration scripts
│       ├── V1__init_schema.sql
│       ├── V2__seed_roles.sql
│       └── ...
│
├── src/test/java/id/ikmui/pemira/
│   └── (mirror struktur main, per modul: *ServiceTest.java, *ControllerTest.java)
│
├── pom.xml
└── Dockerfile
```

**Kenapa package-by-feature?** Setiap modul (`report`, `investigation`, `approval`, `publication`) itu selaras dengan role dan tahap alur bisnis kamu. Kalau nanti butuh nambah modul baru (misal `appeal` buat banding), tinggal tambah folder baru tanpa ganggu modul lain.

### Frontend (Next.js + TypeScript, App Router)

```
pemira-frontend/
├── app/
│   ├── (public)/                   # halaman publik, tanpa login
│   │   ├── page.tsx                    # landing page
│   │   ├── kandidat/page.tsx
│   │   └── publikasi/page.tsx          # hasil publikasi (IG-feed style)
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── lapor/                      # form pengaduan mahasiswa
│   │   └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # shell dashboard + role guard
│   │   ├── hukum-sekretariat/
│   │   │   ├── page.tsx                # daftar laporan masuk
│   │   │   └── [reportId]/page.tsx     # detail + form investigasi
│   │   ├── ketua/
│   │   │   ├── page.tsx                # daftar laporan investigasi
│   │   │   └── [investigationId]/page.tsx
│   │   └── pdd/
│   │       ├── page.tsx                # daftar siap-publish
│   │       └── [publicationId]/page.tsx
│   │
│   └── layout.tsx                  # root layout
│
├── components/
│   ├── ui/                         # komponen dasar (button, input, badge, dsb — shadcn/ui)
│   ├── layout/                     # navbar, sidebar, dashboard-shell
│   └── domain/                     # komponen spesifik domain
│       ├── report/ReportCard.tsx
│       ├── report/ReportForm.tsx
│       ├── investigation/InvestigationForm.tsx
│       └── publication/PublicationCard.tsx
│
├── lib/
│   ├── api/                        # SERVICE PATTERN frontend (lihat bag. 6)
│   │   ├── client.ts                   # axios/fetch instance + interceptor
│   │   ├── auth.service.ts
│   │   ├── report.service.ts
│   │   ├── investigation.service.ts
│   │   ├── approval.service.ts
│   │   └── publication.service.ts
│   ├── auth/
│   │   ├── useAuth.ts                  # hook auth state
│   │   └── roleGuard.ts
│   ├── types/                      # semua type/interface, mirror DTO backend
│   │   ├── report.types.ts
│   │   ├── investigation.types.ts
│   │   └── user.types.ts
│   ├── validators/                 # zod schema per form
│   │   └── report.schema.ts
│   └── utils/
│
├── store/                          # state management (zustand direkomendasikan)
│   ├── auth.store.ts
│   └── report.store.ts
│
├── proxy.ts                        # optimistic role check di edge (Next 16; dulu middleware.ts)
├── next.config.ts
└── package.json                    # tema Tailwind v4 ada di app/globals.css, bukan tailwind.config.ts
```

---

## 3. Flow Login & Autentikasi

**Skema: JWT (access token + refresh token), role-based access control (RBAC).**

```
1. User submit email/NIM + password → POST /api/auth/login
2. Backend:
   - validasi credential (BCrypt compare)
   - generate accessToken (short-lived, 15-30 menit) berisi claim: userId, role
   - generate refreshToken (long-lived, 7 hari), simpan hash-nya di DB/Redis
   - return { accessToken, refreshToken, user: { id, nama, role } }
3. Frontend:
   - simpan accessToken di memory (Zustand store) — JANGAN localStorage untuk access token
   - simpan refreshToken di httpOnly cookie (lebih aman dari XSS)
4. Setiap request ke API → attach header Authorization: Bearer <accessToken>
5. Backend JwtAuthFilter:
   - validasi token, extract role
   - isi SecurityContext → dipakai @PreAuthorize di controller/service
6. Kalau accessToken expired (401) → frontend auto call POST /api/auth/refresh
   pakai refreshToken cookie → dapat accessToken baru → retry request asli
7. Logout → hapus refreshToken di DB/Redis + clear cookie
```

**Role guard di tiap layer:**
- Backend: `@PreAuthorize("hasRole('KETUA_KP')")` di method service/controller — **ini satu-satunya otorisasi yang mengikat**
- Frontend: `proxy.ts` (Next 16) cek role dari token sebelum render route dashboard, plus role check di tiap `layout.tsx` dashboard sebagai lapisan kedua. Keduanya hanya untuk UX; jangan pernah jadikan penjaga tunggal — lihat [ADR-010](docs/03-ARCHITECTURE.md#adr-010--role-guard-edge-ada-di-proxyts-dan-bukan-otorisasi-sebenarnya)

**Mahasiswa pelapor**: kalau mau simpel, boleh tanpa akun penuh — cukup verifikasi NIM + email kampus (OTP email), dapat token sesi terbatas hanya untuk submit & tracking laporan sendiri. Kalau mau lebih ketat, pakai SSO kampus (SIAK/SSO UI) via OAuth2.

---

## 4. Coding Style & Naming Convention

### Java (Backend)
| Item | Konvensi | Contoh |
|---|---|---|
| Package | lowercase, tanpa underscore | `id.ikmui.pemira.report` |
| Class / Interface | PascalCase | `ReportService`, `ReportServiceImpl` |
| Method / variable | camelCase | `submitReport()`, `reportStatus` |
| Constant | UPPER_SNAKE_CASE | `MAX_EVIDENCE_SIZE_MB` |
| DTO | Suffix jelas | `ReportSubmitRequest`, `ReportResponse` |
| Entity | Nama benda tunggal | `Report`, `Investigation`, `Publication` |
| Repository | Suffix `Repository` | `ReportRepository extends JpaRepository<...>` |
| Service interface + impl | `XxxService` + `XxxServiceImpl` | pisahkan interface & implementasi untuk testability |
| Endpoint REST | kebab-case, plural noun | `/api/reports`, `/api/investigations/{id}/approve` |
| Enum | PascalCase nama, UPPER_SNAKE_CASE value | `enum ReportStatus { DITERIMA, HOAX, DISETUJUI }` |

Style guide: ikuti **Google Java Style Guide**, pakai formatter otomatis (`Spotless` + `google-java-format` plugin di Maven) supaya konsisten tanpa debat manual.

### TypeScript (Frontend)
| Item | Konvensi | Contoh |
|---|---|---|
| Komponen | PascalCase, 1 file 1 komponen | `ReportForm.tsx` |
| Hook | prefix `use` | `useAuth.ts`, `useReportList.ts` |
| Fungsi/variabel | camelCase | `submitReport()`, `isLoading` |
| Type/Interface | PascalCase, prefix opsional `I` tidak wajib | `ReportResponse`, `InvestigationDto` |
| File non-komponen | kebab-case | `report.service.ts`, `report.types.ts` |
| Folder | kebab-case | `hukum-sekretariat/` |
| Konstanta global | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |

Linting: **ESLint (config Next.js default) + Prettier**, commit hook pakai **Husky + lint-staged** supaya format otomatis sebelum commit.

### Git & commit convention
Pakai **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` — memudahkan tracking histori terutama karena banyak modul per role.

---

## 5. Dependency yang Direkomendasikan

### Backend (`pom.xml`)
```xml
<!-- Core -->
spring-boot-starter-web
spring-boot-starter-data-jpa
spring-boot-starter-validation
spring-boot-starter-security

<!-- Database -->
postgresql              <!-- driver -->
flyway-core             <!-- migration -->

<!-- Auth -->
jjwt-api / jjwt-impl / jjwt-jackson   <!-- JWT -->

<!-- Utility -->
lombok                  <!-- kurangi boilerplate getter/setter -->
mapstruct               <!-- entity <-> DTO mapping otomatis -->
springdoc-openapi-starter-webmvc-ui   <!-- Swagger/OpenAPI docs -->

<!-- File upload (bukti laporan) -->
spring-boot-starter (built-in multipart) + integrasi S3/Cloudinary (aws-java-sdk-s3 atau cloudinary-http-client)

<!-- Testing -->
spring-boot-starter-test
h2 (in-memory DB untuk test)
testcontainers (integration test dengan Postgres asli)

<!-- Formatter -->
spotless-maven-plugin
```

### Frontend (`package.json`)
```
next, react, react-dom, typescript

// UI
tailwindcss, shadcn/ui, lucide-react

// Data fetching & state
@tanstack/react-query      // server state + caching
zustand                    // client state (auth, dsb)
axios

// Form & validasi
react-hook-form
zod
@hookform/resolvers

// Dev tooling
eslint, prettier, husky, lint-staged
```

Database: **PostgreSQL** (relasional, cocok karena data laporan-investigasi-approval-publikasi punya relasi jelas dan butuh transactional integrity, misal saat update status laporan + insert history harus atomic).

---

## 6. Service Pattern

### Backend: Controller → Service (interface + impl) → Repository, dengan DTO Mapping

```java
// Controller — HANYA handle HTTP concern, validasi input, delegasikan ke service
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @PreAuthorize("hasRole('MAHASISWA')")
    public ResponseEntity<ApiResponse<ReportResponse>> submitReport(
            @Valid @RequestBody ReportSubmitRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReportResponse result = reportService.submitReport(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

// Service interface — kontrak, memudahkan testing (mock interface)
public interface ReportService {
    ReportResponse submitReport(ReportSubmitRequest request, Long reporterId);
    ReportDetailResponse getReportDetail(Long reportId);
}

// Service impl — business logic ADA DI SINI, bukan di controller/repository
@Service
@RequiredArgsConstructor
@Transactional
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;
    private final ReportStatusHistoryRepository historyRepository;
    private final NotificationService notificationService;

    @Override
    public ReportResponse submitReport(ReportSubmitRequest request, Long reporterId) {
        Report report = reportMapper.toEntity(request);
        report.setReporterId(reporterId);
        report.setStatus(ReportStatus.DITERIMA);

        Report saved = reportRepository.save(report);
        historyRepository.save(ReportStatusHistory.of(saved, ReportStatus.DITERIMA));
        notificationService.notifyRole(RoleName.HUKUM_SEKRETARIAT, "Laporan baru masuk");

        return reportMapper.toResponse(saved);
    }
}

// Repository — hanya akses data, tidak ada logic
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(ReportStatus status);
    Page<Report> findByReporterId(Long reporterId, Pageable pageable);
}
```

**Prinsip:**
- Controller: tipis, tidak ada logic bisnis, hanya validasi request + panggil service.
- Service: semua logic bisnis, state transition laporan, dan orchestration antar repository ada di sini.
- Repository: query murni, tidak ada logic.
- DTO ≠ Entity: entity tidak pernah langsung diekspos ke response API — selalu lewat Mapper (MapStruct) supaya field sensitif atau internal tidak bocor.
- Exception ditangani terpusat lewat `GlobalExceptionHandler` (`@ControllerAdvice`), bukan try-catch berserakan di tiap controller.
- Response API konsisten pakai wrapper `ApiResponse<T>` — `{ success, message, data, errors }` — supaya frontend gampang handle secara seragam.

### Frontend: Service Layer per domain, dipanggil lewat React Query hook

```typescript
// lib/api/report.service.ts — HANYA definisi call API, tanpa state/UI logic
import { apiClient } from "./client";
import { ReportSubmitRequest, ReportResponse } from "@/lib/types/report.types";

export const reportService = {
  submit: (payload: ReportSubmitRequest) =>
    apiClient.post<ReportResponse>("/reports", payload),

  getById: (id: string) =>
    apiClient.get<ReportResponse>(`/reports/${id}`),

  getIncoming: () =>
    apiClient.get<ReportResponse[]>("/reports?status=DITERIMA"),
};

// hooks/useReports.ts — React Query, dipakai komponen
export function useSubmitReport() {
  return useMutation({
    mutationFn: reportService.submit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  });
}
```

Pola ini bikin komponen React tetap bersih (cuma render + panggil hook), semua detail HTTP terisolasi di `service` layer, dan caching/loading/error state diurus React Query — tidak perlu `useEffect` + `useState` manual di tiap halaman.

---

## 7. UI / Design System

### 7.1 Palet Warna

Berdasarkan referensi (poster ucapan selamat & landing page), tema utama: **navy blue** sebagai base + **gold/kuning** sebagai aksen, dengan sentuhan merah marun untuk elemen dekoratif dan hitam untuk navigasi.

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-primary` (Navy) | `#1B2A4A` | background utama, header, section gelap |
| `--color-primary-dark` | `#0F1A30` | background lebih gelap (navbar, footer) |
| `--color-accent` (Gold) | `#D4A72C` | aksen utama: tombol primer, highlight teks, tab aktif, garis pemisah |
| `--color-accent-light` | `#E8C158` | hover state elemen gold |
| `--color-maroon` | `#7A1F1F` | elemen dekoratif/label (dipakai secukupnya, bukan warna utama) |
| `--color-surface` | `#FFFFFF` | card, form, area konten (mode terang) |
| `--color-surface-dark` | `#0D0D0D` | background navbar/dashboard mode gelap |
| `--color-text-primary` | `#1A1A1A` | teks di atas surface terang |
| `--color-text-inverse` | `#FFFFFF` | teks di atas surface gelap/navy |
| `--color-success` | `#2E7D32` | status "Valid / Disetujui" |
| `--color-danger` | `#B3261E` | status "Hoax / Ditolak" |
| `--color-warning` | `#D4A72C` | status "Dalam Proses / Menunggu" (reuse gold) |

> ⚠️ **Usang.** Proyek memakai Tailwind v4, yang memindahkan tema dari `tailwind.config.ts` ke blok `@theme`
> di dalam CSS. Token yang berlaku ada di `pemira-frontend/app/globals.css`. Lihat
> [ADR-009](docs/03-ARCHITECTURE.md#adr-009--tema-tailwind-di-css-theme-bukan-tailwindconfigts).
>
> ```css
> /* app/globals.css */
> @theme {
>   --color-primary: #1b2a4a;
>   --color-accent: #d4a72c;
>   /* ... */
> }
> ```

**Aturan pakai:** navy dominan untuk hero/section besar, gold hanya untuk elemen yang perlu ditonjolkan (CTA, status aktif, angka penting) — jangan dipakai merata supaya tetap kelihatan premium, bukan norak. Halaman dashboard internal (Hukum & Sekretariat / Ketua / PDD) sebaiknya pakai versi netral (surface putih + aksen gold tipis) supaya fokus ke data, sementara halaman publik (landing, publikasi) boleh lebih ekspresif dengan navy+gold penuh gaya poster.

### 7.2 Tipografi

Font pada referensi (judul "VISI DAN MISI") itu sans-serif tegas, bold di heading, regular di body — kemungkinan besar mengarah ke keluarga **Inter** atau **Helvetica Neue / Arial**. Rekomendasi web font open-source yang paling dekat dan gratis:

- **Heading**: `Inter` (weight 700–800) — clean, bold, sangat legible untuk judul besar
- **Body**: `Inter` (weight 400–500) — konsisten satu keluarga font, aman untuk readability
- Alternatif kalau mau kesan sedikit lebih formal/institusional: `Plus Jakarta Sans` atau `Manrope`

```ts
// next.config / font loading (next/font/google)
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], weight: ["400","500","700","800"] });
```

Skala ukuran (dashboard + landing):
| Level | Size | Weight |
|---|---|---|
| H1 (hero/landing) | 40–56px | 800 |
| H1 (dashboard page title) | 28px | 700 |
| H2 | 22px | 700 |
| H3 | 18px | 600 |
| Body | 14–16px | 400–500 |
| Caption/label | 12px | 500 |

### 7.3 Navbar (Landing Page)

Struktur navbar referensi kamu bagus (dark bar, pill gold untuk tab aktif), aku sesuaikan penamaannya ke konteks PEMIRA KP biar tidak identik dengan sumber tapi tetap fungsinya sama:

| Referensi | Diganti jadi | Isi halaman |
|---|---|---|
| Home | **Beranda** | landing, sambutan, timeline pemira |
| Intelligence Hub | **Info Pemira** | berita/edukasi seputar tahapan & sosialisasi pemira |
| Regulations | **Aturan Main** | tata tertib kampanye, dasar hukum pelanggaran |
| Report Center | **Lapor Pelanggaran** | form pengaduan mahasiswa (halaman `/lapor`) |
| Case Flow | **Status Laporan** | tracking status laporan (state machine section 1) |
| Transparency | **Transparansi** | rekap publikasi hasil sidang/sanksi |
| About Us | **Tentang KP** | profil KP, struktur divisi (Hukum&Sekretariat, Ketua, PDD) |

Styling navbar:
```css
.navbar {
  background: var(--color-surface-dark); /* #0D0D0D */
  padding: 12px 24px;
  display: flex;
  gap: 8px;
}
.navbar-item {
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 999px; /* pill */
  font-weight: 600;
  font-size: 14px;
}
.navbar-item.active {
  background: var(--color-accent); /* #D4A72C */
  color: #0D0D0D;
}
.navbar-item:hover:not(.active) {
  background: rgba(212, 167, 44, 0.15); /* gold tipis saat hover */
}
```

Komponen React-nya bisa taruh di `components/layout/Navbar.tsx`, list menu didefinisikan sebagai konstanta supaya gampang diubah:
```ts
// lib/constant/nav-menu.ts
export const NAV_MENU = [
  { label: "Beranda", href: "/" },
  { label: "Info Pemira", href: "/info" },
  { label: "Aturan Main", href: "/aturan" },
  { label: "Lapor Pelanggaran", href: "/lapor" },
  { label: "Status Laporan", href: "/status" },
  { label: "Transparansi", href: "/publikasi" },
  { label: "Tentang KP", href: "/tentang" },
];
```

---

## 8. Catatan Tambahan
- Audit trail penting: setiap perubahan status laporan (DITERIMA → VALID/HOAX → DISETUJUI/DITOLAK → DIPUBLIKASI) sebaiknya dicatat di tabel `report_status_history` — berguna untuk transparansi kalau ada sengketa.
- Karena ini konteks pemilu kampus yang sensitif (bisa jadi sengketa/somasi), pertimbangkan simpan bukti laporan (upload file) dengan checksum/hash supaya tidak bisa diutak-atik setelah submit.
- Rate-limit endpoint submit laporan (misal max N laporan/hari per mahasiswa) untuk cegah spam.
