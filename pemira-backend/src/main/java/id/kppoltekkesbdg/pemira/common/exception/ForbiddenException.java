package id.kppoltekkesbdg.pemira.common.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends ApiException {

  public ForbiddenException(String message) {
    super(HttpStatus.FORBIDDEN, "FORBIDDEN_ROLE", message);
  }
}
