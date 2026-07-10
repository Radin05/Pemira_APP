package id.kppoltekkesbdg.pemira.common;

import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoint sanity-check publik. Berguna untuk memastikan backend hidup dari frontend. */
@RestController
@RequestMapping("/api/v1/public")
public class PingController {

  @GetMapping("/ping")
  public ApiResponse<Map<String, Object>> ping() {
    return ApiResponse.success(
        Map.of("service", "pemira-backend", "time", OffsetDateTime.now().toString()));
  }
}
