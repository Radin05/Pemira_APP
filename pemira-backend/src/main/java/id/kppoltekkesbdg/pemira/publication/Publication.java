package id.kppoltekkesbdg.pemira.publication;

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
@Table(name = "publications")
@Getter
@Setter
public class Publication {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "report_id", nullable = false, unique = true)
  private Long reportId;

  @Column(name = "published_by")
  private Long publishedBy;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(nullable = false, length = 220, unique = true)
  private String slug;

  @Column(nullable = false)
  private String summary;

  @Column private String content;

  @Column(name = "banner_url", length = 500)
  private String bannerUrl;

  @Column(name = "instagram_url", length = 500)
  private String instagramUrl;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 12)
  private Status status = Status.DRAFT;

  @Column(name = "withdrawn_reason")
  private String withdrawnReason;

  @Column(name = "published_at")
  private OffsetDateTime publishedAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  public enum Status {
    DRAFT,
    PUBLISHED,
    WITHDRAWN
  }
}
