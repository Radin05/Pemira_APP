package id.kppoltekkesbdg.pemira.report;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Audit trail perubahan status. Append-only — trigger DB menolak UPDATE/DELETE.
 * Jangan tambahkan setter untuk mengubah baris lama.
 */
@Entity
@Table(name = "report_status_history")
@Getter
@Setter
public class ReportStatusHistory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "report_id", nullable = false)
  private Long reportId;

  @Enumerated(EnumType.STRING)
  @Column(name = "from_status", length = 40)
  private ReportStatus fromStatus;

  @Enumerated(EnumType.STRING)
  @Column(name = "to_status", nullable = false, length = 40)
  private ReportStatus toStatus;

  @Column(name = "actor_id")
  private Long actorId;

  @Column(name = "note")
  private String note;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  public static ReportStatusHistory of(
      Long reportId, ReportStatus from, ReportStatus to, Long actorId, String note) {
    ReportStatusHistory h = new ReportStatusHistory();
    h.setReportId(reportId);
    h.setFromStatus(from);
    h.setToStatus(to);
    h.setActorId(actorId);
    h.setNote(note);
    return h;
  }
}
