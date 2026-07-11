package id.kppoltekkesbdg.pemira.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

  @Query("SELECT u FROM User u WHERE lower(u.email) = lower(:email) AND u.deletedAt IS NULL")
  Optional<User> findByEmailIgnoreCase(@Param("email") String email);

  @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL ORDER BY u.createdAt")
  List<User> findAllActive();

  /** Jumlah user AKTIF (belum dihapus, is_active) yang punya role tertentu. */
  @Query(
      "SELECT count(u) FROM User u JOIN u.roles r "
          + "WHERE r.name = :role AND u.active = true AND u.deletedAt IS NULL")
  long countActiveByRole(@Param("role") String role);
}
