package id.kppoltekkesbdg.pemira.candidate;

import id.kppoltekkesbdg.pemira.candidate.dto.CandidateDtos.CandidateResponse;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Daftar kandidat untuk halaman publik. Hanya kandidat aktif. */
@RestController
@RequestMapping("/api/v1/public/candidates")
@RequiredArgsConstructor
public class PublicCandidateController {

  private final CandidateService candidateService;

  @GetMapping
  public ApiResponse<List<CandidateResponse>> list() {
    return ApiResponse.success(candidateService.listPublic());
  }

  @GetMapping("/{id}")
  public ApiResponse<CandidateResponse> get(@PathVariable Long id) {
    return ApiResponse.success(candidateService.get(id));
  }
}
