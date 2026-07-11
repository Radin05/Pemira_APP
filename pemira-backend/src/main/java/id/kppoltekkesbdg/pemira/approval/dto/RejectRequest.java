package id.kppoltekkesbdg.pemira.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectRequest(
    @NotBlank @Size(min = 30, max = 2000, message = "Alasan penolakan minimal 30 karakter")
        String reason) {}
