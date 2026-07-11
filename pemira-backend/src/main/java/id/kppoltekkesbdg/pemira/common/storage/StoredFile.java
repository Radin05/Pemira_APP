package id.kppoltekkesbdg.pemira.common.storage;

/** Metadata hasil penyimpanan satu berkas. */
public record StoredFile(
    String storageKey,
    String originalFilename,
    String mimeType,
    long sizeBytes,
    String checksumSha256) {}
