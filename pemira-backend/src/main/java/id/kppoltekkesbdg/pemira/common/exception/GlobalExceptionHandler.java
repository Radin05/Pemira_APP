package id.kppoltekkesbdg.pemira.common.exception;

import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Satu-satunya tempat penanganan error. Tidak ada try-catch tersebar di
 * controller (ARSITEKTUR-PEMIRA.md §6). Setiap response membawa requestId
 * dari MDC (diisi oleh RequestIdFilter) supaya error di log bisa dikorelasikan.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final String REQUEST_ID_KEY = "requestId";

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
    // Level warn: ini error yang diantisipasi (validasi, 404, 409), bukan bug.
    log.warn("[{}] {}: {}", ex.getCode(), ex.getStatus(), ex.getMessage());
    return build(ex.getStatus(), ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
    List<ApiResponse.FieldError> errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> new ApiResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
            .toList();
    return build(HttpStatus.BAD_REQUEST, ApiResponse.error("Validasi gagal", errors));
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ApiResponse<Void>> handleAuth(AuthenticationException ex) {
    return build(HttpStatus.UNAUTHORIZED, ApiResponse.error("Autentikasi diperlukan"));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
    return build(HttpStatus.FORBIDDEN, ApiResponse.error("Anda tidak berwenang mengakses sumber daya ini"));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
    // Pelanggaran unique/FK di DB (mis. nomor urut kandidat duplikat, email ganda).
    log.warn("Pelanggaran integritas data: {}", ex.getMostSpecificCause().getMessage());
    return build(
        HttpStatus.CONFLICT,
        ApiResponse.error("Data melanggar aturan keunikan atau relasi (mungkin duplikat)."));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex, HttpServletRequest req) {
    // Bug tak terduga: log lengkap dengan stacktrace, tapi klien hanya menerima
    // pesan generik supaya detail internal tidak bocor.
    log.error("Kesalahan tak terduga pada {} {}", req.getMethod(), req.getRequestURI(), ex);
    return build(HttpStatus.INTERNAL_SERVER_ERROR, ApiResponse.error("Terjadi kesalahan pada server"));
  }

  private ResponseEntity<ApiResponse<Void>> build(HttpStatus status, ApiResponse<Void> body) {
    ApiResponse<Void> withRequestId =
        new ApiResponse<>(
            body.success(), body.message(), body.data(), body.errors(), MDC.get(REQUEST_ID_KEY));
    return ResponseEntity.status(status).body(withRequestId);
  }
}
