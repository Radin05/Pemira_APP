package id.kppoltekkesbdg.pemira.publication;

import id.kppoltekkesbdg.pemira.publication.Publication.Status;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicationRepository extends JpaRepository<Publication, Long> {

  Optional<Publication> findByReportId(Long reportId);

  Optional<Publication> findBySlug(String slug);

  boolean existsBySlug(String slug);

  List<Publication> findByStatusOrderByPublishedAtDesc(Status status);
}
