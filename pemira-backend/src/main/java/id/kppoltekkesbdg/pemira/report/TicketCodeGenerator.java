package id.kppoltekkesbdg.pemira.report;

import java.security.SecureRandom;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Menghasilkan kode tiket PMR-2026-XXXXX. 5 digit acak (bukan berurutan) supaya
 * tidak bisa ditebak/dienumerasi. Cek unik ke DB, ulang bila bentrok.
 *
 * Tahunnya ikut edisi PEMIRA (app.pemira.year), bukan tahun sistem: laporan yang
 * masuk Januari 2027 untuk PEMIRA 2026 tetap harus berkode PMR-2026. Kode tiket
 * lama tidak ikut berubah — pelacakannya memakai kode yang tersimpan apa adanya.
 */
@Component
public class TicketCodeGenerator {

  private static final int MAX_ATTEMPTS = 10;

  private final ReportRepository reportRepository;
  private final String year;
  private final SecureRandom random = new SecureRandom();

  public TicketCodeGenerator(
      ReportRepository reportRepository, @Value("${app.pemira.year:2026}") String year) {
    this.reportRepository = reportRepository;
    this.year = year;
  }

  public String generate() {
    for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      String code = "PMR-%s-%05d".formatted(year, random.nextInt(100_000));
      if (!reportRepository.existsByTicketCode(code)) {
        return code;
      }
    }
    throw new IllegalStateException("Gagal menghasilkan kode tiket unik setelah beberapa percobaan");
  }
}
