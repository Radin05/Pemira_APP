package id.kppoltekkesbdg.pemira.content;

import com.fasterxml.jackson.databind.JsonNode;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ContentSettingController {

  private final ContentSettingService service;

  @GetMapping("/{key}")
  public ApiResponse<JsonNode> get(@PathVariable String key) {
    return ApiResponse.success(service.get(key));
  }

  @PutMapping("/{key}")
  public ApiResponse<JsonNode> save(@PathVariable String key, @RequestBody JsonNode payload) {
    return ApiResponse.success("Konten diperbarui", service.save(key, payload));
  }

  @DeleteMapping("/{key}")
  public ApiResponse<Void> delete(@PathVariable String key) {
    service.delete(key);
    return ApiResponse.success("Konten dikembalikan ke template", null);
  }
}
