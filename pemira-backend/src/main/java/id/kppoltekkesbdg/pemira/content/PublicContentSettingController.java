package id.kppoltekkesbdg.pemira.content;

import com.fasterxml.jackson.databind.JsonNode;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/content")
@RequiredArgsConstructor
public class PublicContentSettingController {

  private final ContentSettingService service;

  @GetMapping("/{key}")
  public ApiResponse<JsonNode> get(@PathVariable String key) {
    return ApiResponse.success(service.get(key));
  }
}
