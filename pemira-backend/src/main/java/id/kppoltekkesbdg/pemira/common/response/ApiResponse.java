package id.kppoltekkesbdg.pemira.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * Wrapper response standar untuk semua endpoint. Bentuknya seragam supaya
 * frontend menangani sukses dan error dengan pola yang sama
 * (ARSITEKTUR-PEMIRA.md §6).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    List<FieldError> errors,
    String requestId) {

  public record FieldError(String field, String message) {}

  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(true, "OK", data, null, null);
  }

  public static <T> ApiResponse<T> success(String message, T data) {
    return new ApiResponse<>(true, message, data, null, null);
  }

  public static ApiResponse<Void> error(String message) {
    return new ApiResponse<>(false, message, null, null, null);
  }

  public static ApiResponse<Void> error(String message, List<FieldError> errors) {
    return new ApiResponse<>(false, message, null, errors, null);
  }
}
