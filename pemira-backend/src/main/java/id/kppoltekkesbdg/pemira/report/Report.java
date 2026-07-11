package id.kppoltekkesbdg.pemira.report;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "reports")
@Getter
@Setter
public class Report {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "ticket_code", nullable = false, unique = true, length = 20)
  private String ticketCode;

  @Column(name = "reporter_id")
  private Long reporterId;

  @Column(name = "reporter_name_enc")
  private String reporterNameEnc;

  @Column(name = "reporter_npm_enc", nullable = false)
  private String reporterNpmEnc;

  @Column(name = "reporter_email_enc", nullable = false)
  private String reporterEmailEnc;

  @Column(name = "reporter_npm_hash", nullable = false, length = 64)
  private String reporterNpmHash;

  @Column(name = "is_anonymous", nullable = false)
  private boolean anonymous;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private ReportCategory category;

  @Column(name = "reported_candidate_text", length = 150)
  private String reportedCandidateText;

  @Column(nullable = false, length = 150)
  private String title;

  @Column(nullable = false)
  private String description;

  @Column(name = "incident_date", nullable = false)
  private LocalDate incidentDate;

  @Column(name = "incident_location", nullable = false)
  private String incidentLocation;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private ReportStatus status;

  @Column(name = "assignee_id")
  private Long assigneeId;

  @Column(name = "submitted_at", nullable = false)
  private OffsetDateTime submittedAt;

  @Column(name = "closed_at")
  private OffsetDateTime closedAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;
}
