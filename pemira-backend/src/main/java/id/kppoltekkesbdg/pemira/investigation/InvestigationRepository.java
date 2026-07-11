package id.kppoltekkesbdg.pemira.investigation;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvestigationRepository extends JpaRepository<Investigation, Long> {
  Optional<Investigation> findByReportId(Long reportId);
}
