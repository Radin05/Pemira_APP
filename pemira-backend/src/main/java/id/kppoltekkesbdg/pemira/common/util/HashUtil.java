package id.kppoltekkesbdg.pemira.common.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public final class HashUtil {

  private HashUtil() {}

  /** SHA-256 → hex 64 karakter. Deterministik: dipakai untuk lookup NPM tanpa dekripsi. */
  public static String sha256Hex(String input) {
    try {
      byte[] digest = MessageDigest.getInstance("SHA-256").digest(input.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 tidak tersedia", e);
    }
  }
}
