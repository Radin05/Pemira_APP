package id.kppoltekkesbdg.pemira.report;

import id.kppoltekkesbdg.pemira.common.exception.BadRequestException;
import id.kppoltekkesbdg.pemira.common.security.EncryptionService;
import id.kppoltekkesbdg.pemira.common.storage.FileStorageService;
import id.kppoltekkesbdg.pemira.common.storage.StoredFile;
import id.kppoltekkesbdg.pemira.common.util.HashUtil;
import id.kppoltekkesbdg.pemira.report.dto.ReportSubmitRequest;
import id.kppoltekkesbdg.pemira.report.dto.ReportSubmitResponse;
import id.kppoltekkesbdg.pemira.report.dto.ReportTrackResponse;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

  private static final int MAX_EVIDENCE = 5;

  private final ReportRepository reportRepository;
  private final ReportStatusHistoryRepository historyRepository;
  private final ReportEvidenceRepository evidenceRepository;
  private final TicketCodeGenerator ticketCodeGenerator;
  private final EncryptionService encryptionService;
  private final FileStorageService fileStorageService;

  @Override
  @Transactional
  public ReportSubmitResponse submit(ReportSubmitRequest req, List<MultipartFile> evidence) {
    List<MultipartFile> files = evidence == null ? List.of() : evidence;
    if (files.size() > MAX_EVIDENCE) {
      throw new BadRequestException("Maksimal " + MAX_EVIDENCE + " berkas bukti");
    }

    Report report = new Report();
    report.setTicketCode(ticketCodeGenerator.generate());
    report.setCategory(req.category());
    report.setTitle(req.title());
    report.setDescription(req.description());
    report.setIncidentDate(req.incidentDate());
    report.setIncidentLocation(req.incidentLocation());
    report.setReportedCandidateText(emptyToNull(req.reportedCandidate()));
    report.setAnonymous(req.anonymous());

    // Identitas selalu disimpan terenkripsi (ADR-006). Nama hanya bila diberikan.
    if (req.reporterName() != null && !req.reporterName().isBlank()) {
      report.setReporterNameEnc(encryptionService.encrypt(req.reporterName().trim()));
    }
    report.setReporterNpmEnc(encryptionService.encrypt(req.reporterNpm()));
    report.setReporterEmailEnc(encryptionService.encrypt(req.reporterEmail()));
    report.setReporterNpmHash(HashUtil.sha256Hex(req.reporterNpm()));

    report.setStatus(ReportStatus.DITERIMA);
    report.setSubmittedAt(OffsetDateTime.now());

    Report saved = reportRepository.save(report);

    // Invarian PRD #2: pembuatan laporan menulis baris riwayat pertama (null → DITERIMA)
    // dalam transaksi yang sama. Kalau salah satu gagal, keduanya rollback.
    historyRepository.save(
        ReportStatusHistory.of(
            saved.getId(), null, ReportStatus.DITERIMA, null, "Laporan diterima sistem"));

    for (MultipartFile file : files) {
      StoredFile stored = fileStorageService.store(file);
      ReportEvidence ev = new ReportEvidence();
      ev.setReportId(saved.getId());
      ev.setStorageKey(stored.storageKey());
      ev.setOriginalFilename(stored.originalFilename());
      ev.setMimeType(stored.mimeType());
      ev.setSizeBytes(stored.sizeBytes());
      ev.setChecksumSha256(stored.checksumSha256());
      evidenceRepository.save(ev);
    }

    log.info("Laporan baru {} status DITERIMA, {} bukti", saved.getTicketCode(), files.size());
    // TODO(T-09-02): notifikasi ke divisi HUKUM_SEKRETARIAT.
    return new ReportSubmitResponse(saved.getTicketCode(), saved.getSubmittedAt());
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<ReportTrackResponse> track(String ticketCode, String npm) {
    Report report = reportRepository.findByTicketCode(ticketCode.trim()).orElse(null);
    // Verifikasi kepemilikan lewat hash NPM. Tiket tidak ada ATAU NPM salah →
    // hasil sama (empty), supaya keberadaan laporan tidak bisa diprobing (ADR-007).
    if (report == null || !report.getReporterNpmHash().equals(HashUtil.sha256Hex(npm.trim()))) {
      return Optional.empty();
    }

    List<ReportTrackResponse.TimelineEntry> timeline =
        historyRepository.findByReportIdOrderByCreatedAtAsc(report.getId()).stream()
            .map(
                h ->
                    new ReportTrackResponse.TimelineEntry(
                        h.getToStatus(), h.getCreatedAt(), h.getNote()))
            .toList();

    return Optional.of(
        new ReportTrackResponse(report.getTicketCode(), report.getStatus(), timeline));
  }

  private String emptyToNull(String s) {
    return (s == null || s.isBlank()) ? null : s.trim();
  }
}
