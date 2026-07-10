package id.kppoltekkesbdg.pemira.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Basis semua exception domain. Membawa HTTP status dan kode error internal,
 * sehingga GlobalExceptionHandler cukup satu jalur untuk memetakannya ke response.
 * Peta kode error ada di docs/03-ARCHITECTURE.md §3.8.
 */
@Getter
public abstract class ApiException extends RuntimeException {

  private final HttpStatus status;
  private final String code;

  protected ApiException(HttpStatus status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
