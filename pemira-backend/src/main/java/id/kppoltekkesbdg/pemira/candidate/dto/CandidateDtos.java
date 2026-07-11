package id.kppoltekkesbdg.pemira.candidate.dto;

import id.kppoltekkesbdg.pemira.candidate.Candidate.ElectionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class CandidateDtos {

  private CandidateDtos() {}

  public record CandidateResponse(
      Long id,
      int candidateNumber,
      String electionType,
      String chiefName,
      String viceName,
      String studyProgram,
      String photoUrl,
      String vision,
      String mission,
      String workPrograms,
      boolean active) {}

  public record CandidateRequest(
      @NotNull @Min(value = 1, message = "Nomor urut minimal 1") Integer candidateNumber,
      @NotNull(message = "Jenis pemilihan wajib dipilih") ElectionType electionType,
      @NotBlank @Size(max = 150) String chiefName,
      @Size(max = 150) String viceName,
      @Size(max = 150) String studyProgram,
      @Size(max = 500) String photoUrl,
      String vision,
      String mission,
      String workPrograms,
      Boolean active) {}
}
