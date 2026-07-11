package id.kppoltekkesbdg.pemira.report;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportStatusHistoryRepository extends JpaRepository<ReportStatusHistory, Long> {
  List<ReportStatusHistory> findByReportIdOrderByCreatedAtAsc(Long reportId);

  long countByReportId(Long reportId);
}
