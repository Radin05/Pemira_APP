package id.kppoltekkesbdg.pemira.auth;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

  Optional<RefreshToken> findByTokenHash(String tokenHash);

  List<RefreshToken> findByUserId(Long userId);

  /** Revoke seluruh token aktif milik user (dipakai saat deteksi reuse & logout-all). */
  @Modifying
  @Query(
      "UPDATE RefreshToken t SET t.revokedAt = CURRENT_TIMESTAMP "
          + "WHERE t.userId = :userId AND t.revokedAt IS NULL")
  void revokeAllForUser(@Param("userId") Long userId);
}
