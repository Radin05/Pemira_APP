package id.kppoltekkesbdg.pemira.auth;

import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.AuthResponse;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.AuthUserResponse;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.LoginRequest;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.OtpRequestRequest;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.OtpVerifyRequest;

public interface AuthService {

  /** Hasil auth internal: response untuk klien + refresh token mentah untuk cookie. */
  record AuthResult(AuthResponse response, String rawRefreshToken) {}

  AuthResult login(LoginRequest request, String userAgent, String ip);

  void requestOtp(OtpRequestRequest request);

  AuthResult verifyOtp(OtpVerifyRequest request, String userAgent, String ip);

  AuthResult refresh(String rawRefreshToken, String userAgent, String ip);

  void logout(String rawRefreshToken);

  AuthUserResponse me(Long userId);
}
