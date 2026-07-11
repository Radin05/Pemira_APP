package id.kppoltekkesbdg.pemira.investigation;

import id.kppoltekkesbdg.pemira.auth.security.UserPrincipal;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import id.kppoltekkesbdg.pemira.investigation.dto.AdvanceStageRequest;
import id.kppoltekkesbdg.pemira.investigation.dto.SubmitToChiefRequest;
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

  /** Selesaikan tahap investigasi saat ini & maju ke tahap berikutnya. */
  @PostMapping("/advance-stage")
  @PreAuthorize("hasRole('HUKUM_SEKRETARIAT')")
  public ApiResponse<Void> advanceStage(
      @PathVariable Long reportId,
      @Valid @RequestBody AdvanceStageRequest request,
      @AuthenticationPrincipal UserPrincipal principal) {
    investigationService.advanceStage(reportId, principal.id(), request.note());
    return ApiResponse.success("Tahap investigasi diperbarui", null);
  }

  /** Isi template laporan resmi & ajukan ke Ketua (setelah seluruh tahap selesai). */
  @PostMapping("/submit-to-chief")
  @PreAuthorize("hasRole('HUKUM_SEKRETARIAT')")
  public ApiResponse<Void> submitToChief(
      @PathVariable Long reportId,
      @Valid @RequestBody SubmitToChiefRequest request,
      @AuthenticationPrincipal UserPrincipal principal) {
    investigationService.submitToChief(
        reportId,
        principal.id(),
        request.findings(),
        request.conclusion(),
        request.recommendedSanction());
    return ApiResponse.success("Laporan diajukan ke Ketua", null);
  }
}
