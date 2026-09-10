package id.kppoltekkesbdg.pemira.content;

import id.kppoltekkesbdg.pemira.common.exception.BadRequestException;
import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import id.kppoltekkesbdg.pemira.common.storage.StoredFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ContentFileStorageService {

  private static final long MAX_SIZE_BYTES = 20L * 1024 * 1024;
  private static final Set<String> ALLOWED_EXT =
      Set.of("pdf", "doc", "docx", "xls", "xlsx", "txt", "odt", "rtf");
  private static final Set<String> ALLOWED_TYPES =
      Set.of(
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "application/vnd.oasis.opendocument.text",
          "application/rtf",
          "text/rtf",
          "application/octet-stream");

  private final Path baseDir;

  public ContentFileStorageService(
      @Value("${app.storage.content-dir:./storage/content}") String localDir) {
    this.baseDir = Path.of(localDir).toAbsolutePath().normalize();
  }

  public StoredFile store(MultipartFile file) {
    if (file.isEmpty()) throw new BadRequestException("Berkas kosong tidak dapat diunggah");
    if (file.getSize() > MAX_SIZE_BYTES) throw new BadRequestException("Ukuran berkas melebihi 20 MB");

    String ext = extensionOf(file.getOriginalFilename());
    if (!ALLOWED_EXT.contains(ext)) throw new BadRequestException("Ekstensi berkas tidak didukung: ." + ext);

    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
      throw new BadRequestException("Tipe berkas tidak didukung: " + contentType);
    }

    String storageKey = UUID.randomUUID() + "." + ext;
    try {
      Files.createDirectories(baseDir);
      Path target = baseDir.resolve(storageKey).normalize();
      if (!target.startsWith(baseDir)) throw new BadRequestException("Nama berkas tidak valid");

      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      try (InputStream in = file.getInputStream();
          DigestInputStream digestIn = new DigestInputStream(in, digest)) {
        Files.copy(digestIn, target);
      }
      return new StoredFile(
          storageKey,
          file.getOriginalFilename(),
          contentType,
          file.getSize(),
          HexFormat.of().formatHex(digest.digest()));
    } catch (IOException e) {
      throw new IllegalStateException("Gagal menyimpan berkas", e);
    } catch (java.security.NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 tidak tersedia", e);
    }
  }

  public Path resolve(String key) {
    if (!key.matches("[a-fA-F0-9-]{36}\\.[A-Za-z0-9]{2,5}")) {
      throw new ResourceNotFoundException("Berkas tidak ditemukan");
    }
    Path file = baseDir.resolve(key).normalize();
    if (!file.startsWith(baseDir) || !Files.exists(file)) {
      throw new ResourceNotFoundException("Berkas tidak ditemukan");
    }
    return file;
  }

  public String contentType(Path file) {
    try {
      String type = Files.probeContentType(file);
      return type == null ? "application/octet-stream" : type;
    } catch (IOException e) {
      return "application/octet-stream";
    }
  }

  private String extensionOf(String filename) {
    if (filename == null) return "";
    int dot = filename.lastIndexOf('.');
    return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "";
  }
}
