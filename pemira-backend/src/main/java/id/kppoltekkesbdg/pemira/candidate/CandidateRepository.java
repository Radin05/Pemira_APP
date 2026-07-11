package id.kppoltekkesbdg.pemira.candidate;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

  List<Candidate> findByActiveTrueOrderByElectionTypeAscCandidateNumberAsc();

  List<Candidate> findAllByOrderByElectionTypeAscCandidateNumberAsc();
}
