package id.kppoltekkesbdg.pemira.report;

import id.kppoltekkesbdg.pemira.auth.security.UserPrincipal;
import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import id.kppoltekkesbdg.pemira.common.response.PagedResponse;
import id.kppoltekkesbdg.pemira.investigation.InvestigationService;
import id.kppoltekkesbdg.pemira.report.dto.ReportDetailResponse;
import id.kppoltekkesbdg.pemira.report.dto.ReportSubmitRequest;
import id.kppoltekkesbdg.pemira.report.dto.ReportSubmitResponse;
import id.kppoltekkesbdg.pemira.report.dto.ReportSummaryResponse;
import id.kppoltekkesbdg.pemira.report.dto.ReportTrackResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

  private final ReportService reportService;
  private final InvestigationService investigationService;

  // ── Publik ────────────────────────────────────────────────────────────
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<ReportSubmitResponse> submit(
      @Valid @RequestPart("payload") ReportSubmitRequest payload,
      @RequestPart(value = "evidence", required = false) List<MultipartFile> evidence) {
    return ApiResponse.success("Laporan berhasil dikirim", reportService.submit(payload, evidence));
  }

  @GetMapping("/track")
  public ApiResponse<ReportTrackResponse> track(
      @RequestParam String ticket, @RequestParam String npm) {
    ReportTrackResponse result =
        reportService
            .track(ticket, npm)
            .orElseThrow(() -> new ResourceNotFoundException("Laporan tidak ditemukan"));
    return ApiResponse.success(result);
  }

  // ── Divisi Hukum & Sekretariat ───────────────────────────────────────
  @GetMapping
  @PreAuthorize("hasAnyRole('HUKUM_SEKRETARIAT', 'KETUA_KP')")
  public ApiResponse<PagedResponse<ReportSummaryResponse>> list(
      @RequestParam(required = false) ReportStatus status,
      @RequestParam(required = false) ReportCategory category,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    var result =
        reportService.listForStaff(status, category, PageRequest.of(page, Math.min(size, 100)));
    return ApiResponse.success(PagedResponse.of(result));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('HUKUM_SEKRETARIAT', 'KETUA_KP')")
  public ApiResponse<ReportDetailResponse> detail(@PathVariable Long id) {
    return ApiResponse.success(reportService.getDetail(id));
  }

  @PostMapping("/{id}/claim")
  @PreAuthorize("hasRole('HUKUM_SEKRETARIAT')")
  public ApiResponse<Void> claim(
      @PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
    investigationService.claim(id, principal.id());
    return ApiResponse.success("Laporan berhasil diambil untuk investigasi", null);
  }
}
