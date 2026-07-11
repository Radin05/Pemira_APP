package id.kppoltekkesbdg.pemira.publication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public final class PublicationDtos {

  private PublicationDtos() {}

  /** Buat/terbitkan publikasi dari laporan yang DISETUJUI. */
  public record CreateRequest(
      @NotBlank @Size(min = 10, max = 200, message = "Judul 10–200 karakter") String title,
      @NotBlank @Size(min = 20, max = 500, message = "Ringkasan 20–500 karakter") String summary,
      @Size(max = 20000) String content,
      @Size(max = 500) String instagramUrl,
      boolean publish) {}

  public record WithdrawRequest(
      @NotBlank @Size(min = 20, message = "Alasan penarikan minimal 20 karakter") String reason) {}

  /** Laporan DISETUJUI yang siap dipublikasikan (untuk PDD). */
  public record ReadyReport(
      Long reportId,
      String ticketCode,
      String reportTitle,
      String category,
      String conclusion,
      String recommendedSanction,
      String findings,
      String reportedCandidate,
      boolean hasDraft) {}

  /** Item untuk dashboard PDD (draft & terbit). */
  public record AdminItem(
      Long id,
      Long reportId,
      String title,
      String slug,
      String status,
      OffsetDateTime publishedAt) {}

  /** Item feed publik. */
  public record PublicItem(
      String slug,
      String title,
      String summary,
      String category,
      String conclusion,
      String recommendedSanction,
      String reportedCandidate,
      String instagramUrl,
      OffsetDateTime publishedAt) {}

  /** Detail publik (+ konten). */
  public record PublicDetail(
      String slug,
      String title,
      String summary,
      String content,
      String category,
      String conclusion,
      String recommendedSanction,
      String reportedCandidate,
      String instagramUrl,
      OffsetDateTime publishedAt) {}

  /** Statistik transparansi publik. */
  public record Stats(long masuk, long diinvestigasi, long dipublikasi, long ditolak) {}
}
