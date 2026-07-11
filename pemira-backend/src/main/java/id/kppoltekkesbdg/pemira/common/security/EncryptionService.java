package id.kppoltekkesbdg.pemira.common.security;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Enkripsi kolom identitas pelapor (ADR-006). AES-256-GCM: memberi kerahasiaan
 * sekaligus deteksi manipulasi (auth tag). IV acak 12 byte per enkripsi,
 * disatukan di depan ciphertext lalu di-Base64 supaya muat di kolom TEXT.
 *
 * Kunci diambil dari properti app.encryption.key (env var di produksi), harus
 * tepat 32 byte (256 bit). Dekripsi hanya dipanggil lewat jalur yang menulis
 * audit log (ReporterIdentityService) — jangan panggil langsung dari controller.
 */
@Service
public class EncryptionService {

  private static final String TRANSFORM = "AES/GCM/NoPadding";
  private static final int IV_LENGTH = 12;
  private static final int TAG_BITS = 128;

  private final SecretKeySpec key;
  private final SecureRandom random = new SecureRandom();

  public EncryptionService(@Value("${app.encryption.key}") String rawKey) {
    byte[] keyBytes = rawKey.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length != 32) {
      throw new IllegalStateException(
          "app.encryption.key harus tepat 32 byte (256 bit), sekarang " + keyBytes.length);
    }
    this.key = new SecretKeySpec(keyBytes, "AES");
  }

  public String encrypt(String plaintext) {
    try {
      byte[] iv = new byte[IV_LENGTH];
      random.nextBytes(iv);
      Cipher cipher = Cipher.getInstance(TRANSFORM);
      cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
      byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

      byte[] combined = new byte[iv.length + ciphertext.length];
      System.arraycopy(iv, 0, combined, 0, iv.length);
      System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);
      return Base64.getEncoder().encodeToString(combined);
    } catch (Exception e) {
      throw new IllegalStateException("Gagal mengenkripsi", e);
    }
  }

  public String decrypt(String encoded) {
    try {
      byte[] combined = Base64.getDecoder().decode(encoded);
      byte[] iv = new byte[IV_LENGTH];
      System.arraycopy(combined, 0, iv, 0, IV_LENGTH);
      byte[] ciphertext = new byte[combined.length - IV_LENGTH];
      System.arraycopy(combined, IV_LENGTH, ciphertext, 0, ciphertext.length);

      Cipher cipher = Cipher.getInstance(TRANSFORM);
      cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
      return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    } catch (Exception e) {
      throw new IllegalStateException("Gagal mendekripsi", e);
    }
  }
}
