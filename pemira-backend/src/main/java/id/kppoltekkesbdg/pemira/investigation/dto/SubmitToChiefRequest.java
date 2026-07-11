package id.kppoltekkesbdg.pemira.investigation.dto;

import id.kppoltekkesbdg.pemira.investigation.Investigation.Verdict;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Template laporan resmi investigator ke Ketua (US-505). */
public record SubmitToChiefRequest(
    @NotBlank @Size(min = 50, max = 8000, message = "Temuan minimal 50 karakter") String findings,
    @NotNull(message = "Kesimpulan wajib dipilih") Verdict conclusion,
    @NotBlank(message = "Rekomendasi sanksi wajib dipilih") String recommendedSanction) {}
