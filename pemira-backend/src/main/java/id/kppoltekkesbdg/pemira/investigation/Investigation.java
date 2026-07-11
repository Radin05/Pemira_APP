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
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "investigations")
@Getter
@Setter
public class Investigation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "report_id", nullable = false, unique = true)
  private Long reportId;

  @Column(name = "investigator_id", nullable = false)
  private Long investigatorId;

  @Enumerated(EnumType.STRING)
  @Column(length = 10)
  private Verdict verdict;

  @Column(name = "cross_check_note")
  private String crossCheckNote;

  @Column private String findings;

  @Column private String recommendation;

  @Column(name = "recommended_sanction", length = 30)
  private String recommendedSanction;

  @Column(name = "revision_number", nullable = false)
  private short revisionNumber = 0;

  @Column(name = "verdict_at")
  private OffsetDateTime verdictAt;

  @Column(name = "submitted_to_chief_at")
  private OffsetDateTime submittedToChiefAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  public enum Verdict {
    VALID,
    HOAX
  }
}
