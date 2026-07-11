package id.kppoltekkesbdg.pemira.common.storage;

import id.kppoltekkesbdg.pemira.common.exception.BadRequestException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.util.Set;
import java.util.UUID;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Menyimpan bukti ke disk lokal (dev). Menghitung SHA-256 SERVER-SIDE saat
 * streaming (ADR: server yang menghitung = server yang menjamin), memberi nama
 * acak UUID untuk cegah path traversal, dan menolak tipe/ukuran di luar batas.
 *
 * DITUNDA (T-04-04 lanjutan): validasi magic-byte via Apache Tika dan storage
 * S3/Cloudinary. Untuk sekarang tipe divalidasi dari content-type yang dilaporkan
 * klien — cukup untuk dev, TIDAK cukup untuk produksi.
 */
@Service
public class FileStorageService {

  private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024;
  private static final Set<String> ALLOWED_TYPES =
      Set.of("image/jpeg", "image/png", "image/webp", "video/mp4", "application/pdf");
  private static final Set<String> ALLOWED_EXT =
      Set.of("jpg", "jpeg", "png", "webp", "mp4", "pdf");

  private final Path baseDir;

  public FileStorageService(@Value("${app.storage.local-dir}") String localDir) {
    this.baseDir = Path.of(localDir).toAbsolutePath().normalize();
  }

  public StoredFile store(MultipartFile file) {
    if (file.isEmpty()) {
      throw new BadRequestException("Berkas kosong tidak dapat diunggah");
    }
    if (file.getSize() > MAX_SIZE_BYTES) {
      throw new BadRequestException("Ukuran berkas melebihi 10 MB");
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
      throw new BadRequestException("Tipe berkas tidak didukung: " + contentType);
    }

    String ext = extensionOf(file.getOriginalFilename());
    if (!ALLOWED_EXT.contains(ext)) {
      throw new BadRequestException("Ekstensi berkas tidak didukung: ." + ext);
    }

    String storageKey = UUID.randomUUID() + "." + ext;
    try {
      Files.createDirectories(baseDir);
      Path target = baseDir.resolve(storageKey).normalize();
      if (!target.startsWith(baseDir)) {
        throw new BadRequestException("Nama berkas tidak valid");
      }

      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      try (InputStream in = file.getInputStream();
          DigestInputStream digestIn = new DigestInputStream(in, digest)) {
        Files.copy(digestIn, target);
      }
      String checksum = HexFormat.of().formatHex(digest.digest());

      return new StoredFile(
          storageKey,
          file.getOriginalFilename(),
          contentType,
          file.getSize(),
          checksum);
    } catch (IOException e) {
      throw new IllegalStateException("Gagal menyimpan berkas", e);
    } catch (java.security.NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 tidak tersedia", e);
    }
  }

  private String extensionOf(String filename) {
    if (filename == null) return "";
    int dot = filename.lastIndexOf('.');
    return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "";
  }
}
