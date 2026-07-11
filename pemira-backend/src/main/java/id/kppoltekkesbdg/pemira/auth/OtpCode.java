package id.kppoltekkesbdg.pemira.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "otp_codes")
@Getter
@Setter
public class OtpCode {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 150)
  private String email;

  @Column(length = 30)
  private String npm;

  /** SHA-256 hex dari kode 6 digit — kode mentah tidak pernah disimpan. */
  @Column(name = "code_hash", nullable = false, length = 64)
  private String codeHash;

  @Column(nullable = false, length = 20)
  private String purpose;

  @Column(name = "attempt_count", nullable = false)
  private short attemptCount = 0;

  @Column(name = "expires_at", nullable = false)
  private OffsetDateTime expiresAt;

  @Column(name = "consumed_at")
  private OffsetDateTime consumedAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  public boolean isUsable() {
    return consumedAt == null && expiresAt.isAfter(OffsetDateTime.now());
  }
}
