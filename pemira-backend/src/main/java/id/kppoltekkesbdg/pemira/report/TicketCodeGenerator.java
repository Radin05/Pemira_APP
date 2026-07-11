package id.kppoltekkesbdg.pemira.report;

import java.security.SecureRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Menghasilkan kode tiket PMR-2025-XXXXX. 5 digit acak (bukan berurutan) supaya
 * tidak bisa ditebak/dienumerasi. Cek unik ke DB, ulang bila bentrok.
 */
@Component
@RequiredArgsConstructor
public class TicketCodeGenerator {

  private static final String YEAR = "2025";
  private static final int MAX_ATTEMPTS = 10;

  private final ReportRepository reportRepository;
  private final SecureRandom random = new SecureRandom();

  public String generate() {
    for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      String code = "PMR-%s-%05d".formatted(YEAR, random.nextInt(100_000));
      if (!reportRepository.existsByTicketCode(code)) {
        return code;
      }
    }
    throw new IllegalStateException("Gagal menghasilkan kode tiket unik setelah beberapa percobaan");
  }
}
