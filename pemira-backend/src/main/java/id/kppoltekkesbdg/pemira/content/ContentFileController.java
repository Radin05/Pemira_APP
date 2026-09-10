package id.kppoltekkesbdg.pemira.content;

import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import id.kppoltekkesbdg.pemira.common.storage.StoredFile;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/content/files")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ContentFileController {

  private final ContentFileStorageService storage;

  public record UploadResponse(
      String storageKey, String originalFilename, String mimeType, long sizeBytes, String href) {}

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<UploadResponse> upload(@RequestPart("file") MultipartFile file) {
    StoredFile stored = storage.store(file);
    String href =
        ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/v1/public/content/files/{key}")
            .buildAndExpand(stored.storageKey())
            .toUriString();
    return ApiResponse.success(
        "Berkas formulir diunggah",
        new UploadResponse(
            stored.storageKey(),
            stored.originalFilename(),
            stored.mimeType(),
            stored.sizeBytes(),
            href));
  }
}
