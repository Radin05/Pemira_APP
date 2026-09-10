package id.kppoltekkesbdg.pemira.content;

import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/content/files")
@RequiredArgsConstructor
public class PublicContentFileController {

  private final ContentFileStorageService storage;

  @GetMapping("/{key:.+}")
  public ResponseEntity<Resource> download(@PathVariable String key) throws MalformedURLException {
    Path file = storage.resolve(key);
    Resource resource = new UrlResource(file.toUri());
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(storage.contentType(file)))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(key, StandardCharsets.UTF_8).build().toString())
        .body(resource);
  }
}
