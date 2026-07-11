package id.kppoltekkesbdg.pemira.approval;

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

/** Keputusan Ketua atas laporan investigasi. Append-conceptually — tidak ditimpa. */
@Entity
@Table(name = "approvals")
@Getter
@Setter
public class Approval {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "investigation_id", nullable = false)
  private Long investigationId;

  @Column(name = "approver_id", nullable = false)
  private Long approverId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private Decision decision;

  @Column private String reason;

  @Column(name = "revision_number", nullable = false)
  private short revisionNumber = 0;

  @CreationTimestamp
  @Column(name = "decided_at", nullable = false, updatable = false)
  private OffsetDateTime decidedAt;

  public enum Decision {
    APPROVED,
    REJECTED
  }
}
