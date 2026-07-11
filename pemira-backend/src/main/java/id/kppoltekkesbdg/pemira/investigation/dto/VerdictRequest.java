package id.kppoltekkesbdg.pemira.investigation.dto;

import id.kppoltekkesbdg.pemira.investigation.Investigation.Verdict;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VerdictRequest(
    @NotNull(message = "Verdict wajib dipilih") Verdict verdict,
    @NotBlank @Size(min = 50, max = 5000, message = "Catatan temuan minimal 50 karakter")
        String crossCheckNote) {}
