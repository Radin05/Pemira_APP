package id.kppoltekkesbdg.pemira.approval;

import id.kppoltekkesbdg.pemira.approval.dto.RejectRequest;
import id.kppoltekkesbdg.pemira.auth.security.UserPrincipal;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Keputusan Ketua KP (EPIC-06). */
@RestController
@RequestMapping("/api/v1/reports/{reportId}")
@RequiredArgsConstructor
public class ApprovalController {

  private final ApprovalService approvalService;

  @PostMapping("/approve")
  @PreAuthorize("hasRole('KETUA_KP')")
  public ApiResponse<Void> approve(
      @PathVariable Long reportId, @AuthenticationPrincipal UserPrincipal principal) {
    approvalService.approve(reportId, principal.id());
    return ApiResponse.success("Laporan disetujui", null);
  }

  @PostMapping("/reject")
  @PreAuthorize("hasRole('KETUA_KP')")
  public ApiResponse<Void> reject(
      @PathVariable Long reportId,
      @Valid @RequestBody RejectRequest request,
      @AuthenticationPrincipal UserPrincipal principal) {
    approvalService.reject(reportId, principal.id(), request.reason());
    return ApiResponse.success("Laporan ditolak", null);
  }
}
