package id.kppoltekkesbdg.pemira.report;

import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

  Optional<Report> findByTicketCode(String ticketCode);

  boolean existsByTicketCode(String ticketCode);

  long countByStatus(ReportStatus status);

  java.util.List<Report> findByStatusOrderBySubmittedAtDesc(ReportStatus status);

  /** Untuk rate limit US-406: hitung laporan per NPM dalam rentang waktu. */
  @Query(
      "SELECT count(r) FROM Report r "
          + "WHERE r.reporterNpmHash = :npmHash AND r.submittedAt > :since")
  long countByReporterNpmHashSince(
      @Param("npmHash") String npmHash, @Param("since") OffsetDateTime since);

  /** Antrean investigator: filter status & kategori opsional, urut terbaru. */
  @Query(
      "SELECT r FROM Report r WHERE (:status IS NULL OR r.status = :status) "
          + "AND (:category IS NULL OR r.category = :category) ORDER BY r.submittedAt DESC")
  Page<Report> search(
      @Param("status") ReportStatus status,
      @Param("category") ReportCategory category,
      Pageable pageable);

  /**
   * Update status ber-guard (ADR-001): hanya berhasil bila status saat ini masih
   * {@code from}. rowcount 0 = race / status sudah berubah → transisi ilegal.
   */
  @Modifying
  @Query(
      "UPDATE Report r SET r.status = :to, r.updatedAt = CURRENT_TIMESTAMP "
          + "WHERE r.id = :id AND r.status = :from")
  int updateStatusGuarded(
      @Param("id") Long id, @Param("from") ReportStatus from, @Param("to") ReportStatus to);

  /** Claim laporan: set assignee + DITERIMA→DIVERIFIKASI dalam satu update ber-guard. */
  @Modifying
  @Query(
      "UPDATE Report r SET r.status = id.kppoltekkesbdg.pemira.report.ReportStatus.DIVERIFIKASI, "
          + "r.assigneeId = :assignee, r.updatedAt = CURRENT_TIMESTAMP "
          + "WHERE r.id = :id AND r.status = id.kppoltekkesbdg.pemira.report.ReportStatus.DITERIMA")
  int claimGuarded(@Param("id") Long id, @Param("assignee") Long assignee);
}
