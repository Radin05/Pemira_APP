package id.kppoltekkesbdg.pemira.candidate;

import id.kppoltekkesbdg.pemira.candidate.dto.CandidateDtos.CandidateRequest;
import id.kppoltekkesbdg.pemira.candidate.dto.CandidateDtos.CandidateResponse;
import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CandidateService {

  private final CandidateRepository candidateRepository;

  @Transactional(readOnly = true)
  public List<CandidateResponse> listPublic() {
    return candidateRepository.findByActiveTrueOrderByElectionTypeAscCandidateNumberAsc().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<CandidateResponse> listAll() {
    return candidateRepository.findAllByOrderByElectionTypeAscCandidateNumberAsc().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public CandidateResponse get(Long id) {
    return toResponse(requireCandidate(id));
  }

  @Transactional
  public Long create(CandidateRequest req) {
    Candidate c = new Candidate();
    apply(c, req);
    return candidateRepository.save(c).getId();
  }

  @Transactional
  public void update(Long id, CandidateRequest req) {
    Candidate c = requireCandidate(id);
    apply(c, req);
    candidateRepository.save(c);
  }

  @Transactional
  public void delete(Long id) {
    candidateRepository.delete(requireCandidate(id));
  }

  private void apply(Candidate c, CandidateRequest req) {
    c.setCandidateNumber(req.candidateNumber().shortValue());
    c.setElectionType(req.electionType());
    c.setChiefName(req.chiefName().trim());
    c.setViceName(req.viceName());
    c.setStudyProgram(req.studyProgram());
    c.setPhotoUrl(req.photoUrl());
    c.setVision(req.vision());
    c.setMission(req.mission());
    c.setWorkPrograms(req.workPrograms());
    if (req.active() != null) c.setActive(req.active());
  }

  private Candidate requireCandidate(Long id) {
    return candidateRepository
        .findById(id)
        .orElseThrow(() -> ResourceNotFoundException.of("Kandidat", id));
  }

  private CandidateResponse toResponse(Candidate c) {
    return new CandidateResponse(
        c.getId(),
        c.getCandidateNumber(),
        c.getElectionType().name(),
        c.getChiefName(),
        c.getViceName(),
        c.getStudyProgram(),
        c.getPhotoUrl(),
        c.getVision(),
        c.getMission(),
        c.getWorkPrograms(),
        c.isActive());
  }
}
