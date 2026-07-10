package id.kppoltekkesbdg.pemira.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Dilempar saat transisi status laporan tidak sesuai state machine, atau saat
 * guard optimistic di database menemukan status sudah berubah (race condition).
 * Dipetakan ke HTTP 409 — lihat ADR-001 dan ADR-002.
 */
public class IllegalStateTransitionException extends ApiException {

  public IllegalStateTransitionException(String message) {
    super(HttpStatus.CONFLICT, "ILLEGAL_STATE_TRANSITION", message);
  }
}
