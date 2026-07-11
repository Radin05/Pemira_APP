package id.kppoltekkesbdg.pemira.candidate;

import id.kppoltekkesbdg.pemira.candidate.dto.CandidateDtos.CandidateRequest;
import id.kppoltekkesbdg.pemira.candidate.dto.CandidateDtos.CandidateResponse;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** CRUD kandidat oleh ADMIN (EPIC-03). Baca publik ada di PublicCandidateController. */
@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CandidateController {

  private final CandidateService candidateService;

  @GetMapping
  public ApiResponse<List<CandidateResponse>> list() {
    return ApiResponse.success(candidateService.listAll());
  }

  @GetMapping("/{id}")
  public ApiResponse<CandidateResponse> get(@PathVariable Long id) {
    return ApiResponse.success(candidateService.get(id));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<Map<String, Long>> create(@Valid @RequestBody CandidateRequest request) {
    return ApiResponse.success("Kandidat dibuat", Map.of("id", candidateService.create(request)));
  }

  @PutMapping("/{id}")
  public ApiResponse<Void> update(
      @PathVariable Long id, @Valid @RequestBody CandidateRequest request) {
    candidateService.update(id, request);
    return ApiResponse.success("Kandidat diperbarui", null);
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(@PathVariable Long id) {
    candidateService.delete(id);
    return ApiResponse.success("Kandidat dihapus", null);
  }
}
