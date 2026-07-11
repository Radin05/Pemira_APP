package id.kppoltekkesbdg.pemira.report;

import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

  Optional<Report> findByTicketCode(String ticketCode);

  boolean existsByTicketCode(String ticketCode);

  /** Untuk rate limit US-406: hitung laporan per NPM dalam rentang waktu. */
  @Query(
      "SELECT count(r) FROM Report r "
          + "WHERE r.reporterNpmHash = :npmHash AND r.submittedAt > :since")
  long countByReporterNpmHashSince(
      @Param("npmHash") String npmHash, @Param("since") OffsetDateTime since);
}
