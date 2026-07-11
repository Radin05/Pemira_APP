package id.kppoltekkesbdg.pemira.auth.security;

import id.kppoltekkesbdg.pemira.user.User;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Adaptor User → Spring Security. Otoritas diberi prefix ROLE_ supaya cocok
 * dengan hasRole('X') di @PreAuthorize.
 */
public record UserPrincipal(Long id, String email, List<String> roles) implements UserDetails {

  public static UserPrincipal from(User user) {
    List<String> roleNames = user.getRoles().stream().map(r -> r.getName()).toList();
    return new UserPrincipal(user.getId(), user.getEmail(), roleNames);
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
  }

  @Override
  public String getPassword() {
    return null; // otentikasi lewat JWT, bukan password di context
  }

  @Override
  public String getUsername() {
    return email;
  }
}
