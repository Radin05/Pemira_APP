package id.kppoltekkesbdg.pemira.investigation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Laporan resmi investigator ke Ketua (US-505). */
public record SubmitToChiefRequest(
    @NotBlank @Size(min = 50, max = 8000, message = "Temuan minimal 50 karakter") String findings,
    @NotBlank(message = "Rekomendasi sanksi wajib dipilih") String recommendedSanction) {}
