package id.kppoltekkesbdg.pemira.investigation;

import id.kppoltekkesbdg.pemira.auth.security.UserPrincipal;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import id.kppoltekkesbdg.pemira.investigation.dto.SubmitToChiefRequest;
import id.kppoltekkesbdg.pemira.investigation.dto.VerdictRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports/{reportId}")
@RequiredArgsConstructor
public class InvestigationController {

  private final InvestigationService investigationService;

  /** Tetapkan hasil cross-check VALID/HOAX untuk laporan yang sedang diverifikasi. */
  @PostMapping("/verdict")
  @PreAuthorize("hasRole('HUKUM_SEKRETARIAT')")
  public ApiResponse<Void> setVerdict(
      @PathVariable Long reportId,
      @Valid @RequestBody VerdictRequest request,
      @AuthenticationPrincipal UserPrincipal principal) {
    investigationService.setVerdict(
        reportId, principal.id(), request.verdict(), request.crossCheckNote());
    return ApiResponse.success("Hasil investigasi tersimpan", null);
  }

  /** Susun laporan resmi & ajukan ke Ketua (untuk laporan berstatus VALID). */
  @PostMapping("/submit-to-chief")
  @PreAuthorize("hasRole('HUKUM_SEKRETARIAT')")
  public ApiResponse<Void> submitToChief(
      @PathVariable Long reportId,
      @Valid @RequestBody SubmitToChiefRequest request,
      @AuthenticationPrincipal UserPrincipal principal) {
    investigationService.submitToChief(
        reportId, principal.id(), request.findings(), request.recommendedSanction());
    return ApiResponse.success("Laporan diajukan ke Ketua", null);
  }
}
