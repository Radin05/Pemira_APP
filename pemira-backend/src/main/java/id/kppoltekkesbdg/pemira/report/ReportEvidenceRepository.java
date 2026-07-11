package id.kppoltekkesbdg.pemira.report;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportEvidenceRepository extends JpaRepository<ReportEvidence, Long> {
  List<ReportEvidence> findByReportId(Long reportId);
}
