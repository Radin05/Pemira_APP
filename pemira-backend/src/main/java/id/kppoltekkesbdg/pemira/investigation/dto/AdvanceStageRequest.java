package id.kppoltekkesbdg.pemira.investigation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdvanceStageRequest(
    @NotBlank @Size(min = 20, max = 5000, message = "Catatan tahap minimal 20 karakter")
        String note) {}
