package id.kppoltekkesbdg.pemira.investigation;

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

/** Catatan satu tahap investigasi. Append-only (trigger DB menolak UPDATE/DELETE). */
@Entity
@Table(name = "investigation_stages")
@Getter
@Setter
public class InvestigationStage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "investigation_id", nullable = false)
  private Long investigationId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Stage stage;

  @Column(nullable = false)
  private String note;

  @Column(name = "investigator_id", nullable = false)
  private Long investigatorId;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;
}
