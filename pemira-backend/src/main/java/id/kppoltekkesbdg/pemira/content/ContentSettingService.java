package id.kppoltekkesbdg.pemira.content;

import com.fasterxml.jackson.databind.JsonNode;
import id.kppoltekkesbdg.pemira.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContentSettingService {

  private final ContentSettingRepository repository;

  @Transactional(readOnly = true)
  public JsonNode get(String key) {
    return repository.findById(key).map(ContentSetting::getPayload).orElse(null);
  }

  @Transactional
  public JsonNode save(String key, JsonNode payload) {
    if (!key.matches("[a-z0-9-]{2,80}") || payload == null || payload.isNull()) {
      throw new BadRequestException("Payload konten tidak valid");
    }
    ContentSetting setting = repository.findById(key).orElseGet(ContentSetting::new);
    setting.setKey(key);
    setting.setPayload(payload);
    repository.save(setting);
    return payload;
  }

  @Transactional
  public void delete(String key) {
    repository.deleteById(key);
  }
}
