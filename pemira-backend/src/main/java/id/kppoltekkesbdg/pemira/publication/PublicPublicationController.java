package id.kppoltekkesbdg.pemira.publication;

import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.PublicDetail;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.PublicItem;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.Stats;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoint publik untuk halaman Transparansi. Hanya baca, tanpa auth. */
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicPublicationController {

  private final PublicationService publicationService;

  @GetMapping("/publications")
  public ApiResponse<List<PublicItem>> feed() {
    return ApiResponse.success(publicationService.listPublic());
  }

  @GetMapping("/publications/{slug}")
  public ApiResponse<PublicDetail> detail(@PathVariable String slug) {
    return ApiResponse.success(publicationService.getPublicBySlug(slug));
  }

  @GetMapping("/stats")
  public ApiResponse<Stats> stats() {
    return ApiResponse.success(publicationService.stats());
  }
}
