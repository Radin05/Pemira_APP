package id.kppoltekkesbdg.pemira.candidate;

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
@Table(name = "candidates")
@Getter
@Setter
public class Candidate {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "candidate_number", nullable = false)
  private short candidateNumber;

  @Enumerated(EnumType.STRING)
  @Column(name = "election_type", nullable = false, length = 10)
  private ElectionType electionType;

  @Column(name = "chief_name", nullable = false, length = 150)
  private String chiefName;

  @Column(name = "vice_name", length = 150)
  private String viceName;

  @Column(name = "study_program", length = 150)
  private String studyProgram;

  @Column(name = "photo_url", length = 500)
  private String photoUrl;

  @Column private String vision;

  @Column private String mission;

  @Column(name = "work_programs")
  private String workPrograms;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  public enum ElectionType {
    BEM,
    BPM
  }
}
