package id.kppoltekkesbdg.pemira.report;

import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import id.kppoltekkesbdg.pemira.report.dto.ReportSubmitRequest;
import id.kppoltekkesbdg.pemira.report.dto.ReportSubmitResponse;
import id.kppoltekkesbdg.pemira.report.dto.ReportTrackResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
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

  /**
   * Submit laporan. Multipart: bagian "payload" (JSON) + berkas "evidence".
   *
   * <p>TODO(EPIC-02): kunci ke role MAHASISWA lewat @PreAuthorize. Untuk sekarang
   * dibuka publik karena autentikasi belum ada (lihat SecurityConfig).
   */
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<ReportSubmitResponse> submit(
      @Valid @RequestPart("payload") ReportSubmitRequest payload,
      @RequestPart(value = "evidence", required = false) List<MultipartFile> evidence) {
    return ApiResponse.success("Laporan berhasil dikirim", reportService.submit(payload, evidence));
  }

  /** Pelacakan publik dengan tiket + NPM. Hanya status & timeline (ADR-007). */
  @GetMapping("/track")
  public ApiResponse<ReportTrackResponse> track(
      @RequestParam String ticket, @RequestParam String npm) {
    ReportTrackResponse result =
        reportService
            .track(ticket, npm)
            .orElseThrow(() -> new ResourceNotFoundException("Laporan tidak ditemukan"));
    return ApiResponse.success(result);
  }
}
