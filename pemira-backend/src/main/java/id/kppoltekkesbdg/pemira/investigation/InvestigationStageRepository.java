package id.kppoltekkesbdg.pemira.investigation;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvestigationStageRepository extends JpaRepository<InvestigationStage, Long> {
  List<InvestigationStage> findByInvestigationIdOrderByCreatedAtAsc(Long investigationId);
}
