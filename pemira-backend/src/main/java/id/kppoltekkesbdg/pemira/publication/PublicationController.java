package id.kppoltekkesbdg.pemira.publication;

import id.kppoltekkesbdg.pemira.auth.security.UserPrincipal;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.AdminItem;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.CreateRequest;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.ReadyReport;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.WithdrawRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Dashboard PDD (EPIC-07). Semua endpoint khusus role PDD. */
@RestController
@RequestMapping("/api/v1/publications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PDD')")
public class PublicationController {

  private final PublicationService publicationService;

  @GetMapping("/ready")
  public ApiResponse<List<ReadyReport>> ready() {
    return ApiResponse.success(publicationService.listReady());
  }

  @GetMapping("/ready/{reportId}")
  public ApiResponse<ReadyReport> readyOne(@PathVariable Long reportId) {
    return ApiResponse.success(publicationService.getReady(reportId));
  }

  @GetMapping
  public ApiResponse<List<AdminItem>> list() {
    return ApiResponse.success(publicationService.listAll());
  }

  @PostMapping("/report/{reportId}")
  public ApiResponse<Map<String, Long>> save(
      @PathVariable Long reportId,
      @Valid @RequestBody CreateRequest request,
      @AuthenticationPrincipal UserPrincipal principal) {
    Long id = publicationService.save(reportId, principal.id(), request);
    return ApiResponse.success(
        request.publish() ? "Publikasi diterbitkan" : "Draft tersimpan", Map.of("id", id));
  }

  @PostMapping("/{id}/publish")
  public ApiResponse<Void> publish(
      @PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
    publicationService.publish(id, principal.id());
    return ApiResponse.success("Publikasi diterbitkan", null);
  }

  @PostMapping("/{id}/withdraw")
  public ApiResponse<Void> withdraw(
      @PathVariable Long id,
      @Valid @RequestBody WithdrawRequest request,
      @AuthenticationPrincipal UserPrincipal principal) {
    publicationService.withdraw(id, principal.id(), request.reason());
    return ApiResponse.success("Publikasi ditarik", null);
  }
}
