package id.kppoltekkesbdg.pemira.auth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

  /** OTP terbaru yang belum dipakai untuk sebuah email + tujuan. */
  @Query(
      "SELECT o FROM OtpCode o WHERE lower(o.email) = lower(:email) AND o.purpose = :purpose "
          + "AND o.consumedAt IS NULL ORDER BY o.createdAt DESC LIMIT 1")
  Optional<OtpCode> findLatestUsable(
      @Param("email") String email, @Param("purpose") String purpose);
}
