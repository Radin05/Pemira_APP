# Rencana Testing — PEMIRA IKM UI 2025

> Sebelumnya: [Task Breakdown](04-TASK-BREAKDOWN.md)

Prinsipnya: test ditulis bersama fiturnya, bukan ditumpuk di sprint terakhir. Yang paling banyak dites adalah bagian yang paling mahal kalau salah — transisi status dan integritas bukti.

---

## 1. Piramida Test

| Level | Alat | Cakupan | Target |
|---|---|---|---|
| Unit | JUnit 5 + Mockito | Business logic di `*ServiceImpl`, `ReportStateMachine`, `EncryptionService`, validator | Coverage baris ≥ 70% per modul; `ReportStateMachine` **100%** |
| Integration (BE) | `@SpringBootTest` + Testcontainers Postgres | Controller → service → repo → DB sungguhan, termasuk constraint & trigger | Semua endpoint: 1 happy path + minimal 1 error path |
| Repository | `@DataJpaTest` + Testcontainers | Query kustom, index yang benar-benar terpakai | Semua query kustom |
| Unit (FE) | Vitest + Testing Library | Komponen form, validator zod, util | Komponen domain kritis |
| E2E | Playwright | 5 alur utama lintas role | Wajib hijau sebelum deploy prod |
| Beban | k6 | 500 VU | NFR terpenuhi |
| Keamanan | OWASP dependency-check, `npm audit`, sweep manual | Top 10 | Nol temuan HIGH |

**Jangan pakai H2 untuk integration test.** H2 tidak punya `CHECK` constraint dengan regex, tidak punya trigger plpgsql, dan tidak punya tipe `inet`/`jsonb` yang sama. Test akan hijau di H2 lalu jebol di produksi. Pakai Testcontainers dengan image Postgres yang sama persis dengan produksi.

---

## 2. Test yang Wajib Ada (dan alasannya)

### 2.1 State machine — `ReportStateMachineTest`
Parameterized test atas **seluruh** matriks 12 status × 12 status × 5 role.
```java
@ParameterizedTest
@MethodSource("semuaKombinasi")
void hanyaTransisiLegalYangDiizinkan(ReportStatus from, ReportStatus to, RoleName role) {
    if (LEGAL.contains(new Transition(from, to, role))) {
        assertDoesNotThrow(() -> stateMachine.assertCanTransition(from, to, role));
    } else {
        assertThrows(IllegalStateTransitionException.class,
            () -> stateMachine.assertCanTransition(from, to, role));
    }
}
```
Ini satu-satunya tempat di mana coverage 100% benar-benar berarti: tabelnya terbatas dan setiap sel punya konsekuensi hukum.

### 2.2 Konkurensi — dua investigator, satu laporan
```java
@Test
void claimBersamaanHanyaSatuYangBerhasil() throws Exception {
    var latch = new CountDownLatch(1);
    var hasil = Collections.synchronizedList(new ArrayList<Boolean>());
    var pool = Executors.newFixedThreadPool(2);
    for (int i = 0; i < 2; i++) {
        var investigatorId = i == 0 ? invA : invB;
        pool.submit(() -> {
            latch.await();
            try { reportService.claim(reportId, investigatorId); hasil.add(true); }
            catch (IllegalStateTransitionException e) { hasil.add(false); }
            return null;
        });
    }
    latch.countDown();
    pool.shutdown(); pool.awaitTermination(10, SECONDS);

    assertThat(hasil).containsExactlyInAnyOrder(true, false);
    assertThat(historyRepo.countByReportId(reportId)).isEqualTo(2); // DITERIMA + DIVERIFIKASI, bukan 3
}
```
Tanpa test ini, guard `WHERE status = :expectedFrom` dari ADR-001 gampang dihapus orang yang menganggapnya redundan.

### 2.3 Atomisitas status + history
```java
@Test
void gagalTulisHistoryMembatalkanPerubahanStatus() {
    doThrow(new DataAccessResourceFailureException("db down"))
        .when(historyRepo).save(any());
    assertThrows(Exception.class, () -> statusService.transition(reportId, VALID, actor, "catatan"));
    assertThat(reportRepo.findById(reportId).orElseThrow().getStatus()).isEqualTo(DIVERIFIKASI);
}
```

### 2.4 Integritas bukti
- Upload `evil.jpg` yang isinya `<?php ... ?>` → ditolak 415 (deteksi magic byte, bukan ekstensi).
- Upload 11 MB → ditolak 413, dan tidak ada file yang tersisa di storage.
- `checksum_sha256` yang disimpan sama dengan `sha256sum` file yang diunduh kembali.
- `UPDATE report_evidences SET checksum_sha256 = '...'` langsung ke DB → gagal karena trigger.

### 2.5 Kebocoran data (ADR-007)
- `GET /reports/track` → assert JSON **tidak** mengandung key `description`, `findings`, `reporterName`, `reportedCandidateId`.
- `GET /reports` sebagai investigator, laporan anonim → `reporterName` bernilai `null`, bukan ciphertext.
- `GET /public/publications` → tidak ada field internal (`investigationId`, `assigneeId`).
- Sebagai `MAHASISWA`, `GET /reports/{id}` milik orang lain → 403 (bukan 404 yang membocorkan keberadaan laporan… sebenarnya di sini 404 lebih baik; **keputusan: kembalikan 404** supaya keberadaan laporan orang lain tidak bisa diprobing).

### 2.6 Matriks otorisasi
Satu integration test tabular: setiap endpoint × setiap role → status yang diharapkan.
```java
@ParameterizedTest
@CsvSource({
  "POST, /api/v1/reports,                    MAHASISWA,          201",
  "POST, /api/v1/reports,                    HUKUM_SEKRETARIAT,  403",
  "GET,  /api/v1/reports,                    MAHASISWA,          403",
  "GET,  /api/v1/reports,                    HUKUM_SEKRETARIAT,  200",
  "POST, /api/v1/investigations/1/approve,   HUKUM_SEKRETARIAT,  403",
  "POST, /api/v1/investigations/1/approve,   KETUA_KP,           200",
  "POST, /api/v1/publications/1/publish,     KETUA_KP,           403",
  "POST, /api/v1/publications/1/publish,     PDD,                200",
  // ... semua kombinasi
})
```
Test inilah yang menangkap `@PreAuthorize` yang lupa dipasang saat menambah endpoint baru.

### 2.7 Auth
- Refresh token dipakai dua kali → panggilan kedua 401 **dan** seluruh chain token milik user itu ter-revoke.
- Access token dengan signature dimodifikasi → 401.
- Access token kadaluarsa → 401 dengan kode `TOKEN_EXPIRED` (bukan `INVALID_TOKEN`), supaya interceptor frontend tahu harus refresh.
- OTP: percobaan ke-6 → 429; OTP yang sudah dipakai → 400.
- `/auth/otp/request` untuk email tidak terdaftar → tetap 200 dengan pesan identik (cegah user enumeration). Bandingkan juga waktu responsnya agar tidak bocor lewat timing.

### 2.8 Rate limit
- Laporan ke-4 dalam 24 jam → 429.
- Redis dimatikan → laporan ke-4 **tetap** 429 (fallback `count(*)` Postgres, ADR-005).

---

## 3. Data Test

`@Sql` fixture atau builder pattern. Satu file seed dev berisi:
- 1 user per role, password seragam `Test@1234`
- 4 kandidat (2 BEM, 2 BPM)
- 10 laporan tersebar di semua status, untuk menguji filter & tampilan
- 3 publikasi (1 DRAFT, 1 PUBLISHED, 1 WITHDRAWN)

Setiap test kelas integration memakai `@Transactional` + rollback, atau `@Sql(scripts = "/cleanup.sql", executionPhase = AFTER_TEST_METHOD)` untuk test yang butuh commit sungguhan (test konkurensi tidak bisa rollback otomatis — bersihkan manual).

---

## 4. Skenario E2E (Playwright)

| # | Skenario | Langkah |
|---|---|---|
| E2E-1 | **Alur bahagia ujung ke ujung** | Mahasiswa minta OTP → verifikasi → isi form + unggah 2 bukti → dapat tiket → investigator claim → tandai VALID → susun laporan → submit → ketua approve → PDD buat draft → publish → laporan muncul di `/publikasi` → mahasiswa cek `/status` = DIPUBLIKASI |
| E2E-2 | **Alur hoax** | Submit → investigator tandai HOAX + catatan → status `SELESAI` → tidak pernah muncul di halaman publik |
| E2E-3 | **Alur tolak & revisi** | Investigasi disubmit → ketua reject + alasan → investigator revisi → submit ulang → ketua approve. Assert `approvals` punya 2 baris |
| E2E-4 | **Guard peran** | Login sebagai PDD → akses `/ketua` → dialihkan ke halaman 403, bukan crash |
| E2E-5 | **Rate limit** | Submit 4 laporan berturut-turut → laporan ke-4 menampilkan pesan "Batas 3 laporan per hari tercapai" |

Semuanya dijalankan di CI terhadap environment staging sebelum promote ke prod.

---

## 5. Uji Beban (k6)

| Skenario | VU | Durasi | Ambang lolos |
|---|---|---|---|
| Baca feed publik `/public/publications` | 500 | 5 mnt | p95 < 300 ms, error < 1% |
| Submit laporan (dengan 1 bukti 2 MB) | 50 | 5 mnt | p95 < 2 s, error < 1% |
| Antrean investigator (query + filter) | 20 | 5 mnt | p95 < 600 ms |

Kalau p95 baca feed meleset, curigai N+1 query di `publications → investigation → report → candidate`. Aktifkan `spring.jpa.properties.hibernate.generate_statistics=true` di staging dan hitung jumlah query per request.

---

## 6. Gate Kualitas di CI

PR tidak bisa di-merge kalau salah satu gagal:
- [ ] Spotless & ESLint bersih
- [ ] Semua unit + integration test hijau
- [ ] Coverage modul yang disentuh tidak turun
- [ ] `ReportStateMachine` coverage 100%
- [ ] OWASP dependency-check: nol HIGH
- [ ] `npm audit --audit-level=high`: nol temuan
- [ ] Migrasi Flyway baru berhasil dijalankan di DB kosong **dan** di DB yang sudah berisi data seed

Deploy prod tambahan:
- [ ] E2E-1 sampai E2E-5 hijau di staging
- [ ] Uji beban memenuhi ambang
- [ ] Restore backup terverifikasi (T-10-08)
