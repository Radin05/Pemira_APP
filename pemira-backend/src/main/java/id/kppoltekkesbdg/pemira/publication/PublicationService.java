package id.kppoltekkesbdg.pemira.publication;

import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.common.exception.BadRequestException;
import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import id.kppoltekkesbdg.pemira.investigation.Investigation;
import id.kppoltekkesbdg.pemira.investigation.InvestigationRepository;
import id.kppoltekkesbdg.pemira.publication.Publication.Status;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.AdminItem;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.CreateRequest;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.PublicDetail;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.PublicItem;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.ReadyReport;
import id.kppoltekkesbdg.pemira.publication.dto.PublicationDtos.Stats;
import id.kppoltekkesbdg.pemira.report.Report;
import id.kppoltekkesbdg.pemira.report.ReportRepository;
import id.kppoltekkesbdg.pemira.report.ReportStatus;
import id.kppoltekkesbdg.pemira.report.ReportStatusService;
import java.time.OffsetDateTime;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Alur PDD: susun publikasi dari laporan DISETUJUI, terbitkan, tarik. */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublicationService {

  private final PublicationRepository publicationRepository;
  private final ReportRepository reportRepository;
  private final InvestigationRepository investigationRepository;
  private final ReportStatusService reportStatusService;

  // ── PDD ─────────────────────────────────────────────────────────────────
  @Transactional(readOnly = true)
  public List<ReadyReport> listReady() {
    return reportRepository.findByStatusOrderBySubmittedAtDesc(ReportStatus.DISETUJUI).stream()
        .map(this::toReadyReport)
        .toList();
  }

  @Transactional(readOnly = true)
  public ReadyReport getReady(Long reportId) {
    Report report =
        reportRepository
            .findById(reportId)
            .orElseThrow(() -> ResourceNotFoundException.of("Laporan", reportId));
    if (report.getStatus() != ReportStatus.DISETUJUI
        && publicationRepository.findByReportId(reportId).isEmpty()) {
      throw new BadRequestException("Laporan belum disetujui atau belum siap dipublikasikan.");
    }
    return toReadyReport(report);
  }

  @Transactional(readOnly = true)
  public List<AdminItem> listAll() {
    return publicationRepository.findAll().stream()
        .map(
            p ->
                new AdminItem(
                    p.getId(),
                    p.getReportId(),
                    p.getTitle(),
                    p.getSlug(),
                    p.getStatus().name(),
                    p.getPublishedAt()))
        .toList();
  }

  /** Buat atau perbarui publikasi untuk sebuah laporan; opsional langsung terbitkan. */
  @Transactional
  public Long save(Long reportId, Long pddUserId, CreateRequest req) {
    Report report =
        reportRepository
            .findById(reportId)
            .orElseThrow(() -> ResourceNotFoundException.of("Laporan", reportId));

    Publication pub = publicationRepository.findByReportId(reportId).orElse(null);
    boolean isNew = pub == null;
    if (isNew) {
      pub = new Publication();
      pub.setReportId(reportId);
      pub.setSlug(uniqueSlug(req.title()));
    }
    pub.setTitle(req.title());
    pub.setSummary(req.summary());
    pub.setContent(req.content());
    pub.setInstagramUrl(emptyToNull(req.instagramUrl()));
    pub.setPublishedBy(pddUserId);

    if (req.publish()) {
      publish(pub, report, pddUserId);
    } else if (isNew) {
      pub.setStatus(Status.DRAFT);
    }
    return publicationRepository.save(pub).getId();
  }

  @Transactional
  public void publish(Long publicationId, Long pddUserId) {
    Publication pub = requirePublication(publicationId);
    Report report =
        reportRepository
            .findById(pub.getReportId())
            .orElseThrow(() -> ResourceNotFoundException.of("Laporan", pub.getReportId()));
    publish(pub, report, pddUserId);
    publicationRepository.save(pub);
  }

  @Transactional
  public void withdraw(Long publicationId, Long pddUserId, String reason) {
    Publication pub = requirePublication(publicationId);
    if (pub.getStatus() != Status.PUBLISHED) {
      throw new BadRequestException("Hanya publikasi yang sudah terbit yang dapat ditarik.");
    }
    reportStatusService.transition(
        pub.getReportId(),
        ReportStatus.DIPUBLIKASI,
        ReportStatus.DITARIK,
        RoleName.PDD,
        pddUserId,
        "Publikasi ditarik: " + reason);
    pub.setStatus(Status.WITHDRAWN);
    pub.setWithdrawnReason(reason);
    publicationRepository.save(pub);
  }

  // ── Publik ──────────────────────────────────────────────────────────────
  @Transactional(readOnly = true)
  public List<PublicItem> listPublic() {
    return publicationRepository.findByStatusOrderByPublishedAtDesc(Status.PUBLISHED).stream()
        .map(this::toPublicItem)
        .toList();
  }

  @Transactional(readOnly = true)
  public PublicDetail getPublicBySlug(String slug) {
    Publication pub =
        publicationRepository
            .findBySlug(slug)
            .filter(p -> p.getStatus() == Status.PUBLISHED)
            .orElseThrow(() -> new ResourceNotFoundException("Publikasi tidak ditemukan"));
    Report report = reportRepository.findById(pub.getReportId()).orElse(null);
    Investigation inv = investigationRepository.findByReportId(pub.getReportId()).orElse(null);
    return new PublicDetail(
        pub.getSlug(),
        pub.getTitle(),
        pub.getSummary(),
        pub.getContent(),
        report == null ? null : report.getCategory().name(),
        inv == null || inv.getVerdict() == null ? null : inv.getVerdict().name(),
        inv == null ? null : inv.getRecommendedSanction(),
        report == null ? null : report.getReportedCandidateText(),
        pub.getInstagramUrl(),
        pub.getPublishedAt());
  }

  @Transactional(readOnly = true)
  public Stats stats() {
    long masuk = reportRepository.count();
    long diinvestigasi =
        reportRepository.countByStatus(ReportStatus.DIVERIFIKASI)
            + reportRepository.countByStatus(ReportStatus.MENUNGGU_PERSETUJUAN_KETUA);
    long dipublikasi = reportRepository.countByStatus(ReportStatus.DIPUBLIKASI);
    long ditolak = reportRepository.countByStatus(ReportStatus.DITOLAK);
    return new Stats(masuk, diinvestigasi, dipublikasi, ditolak);
  }

  // ── Helper ──────────────────────────────────────────────────────────────
  private void publish(Publication pub, Report report, Long pddUserId) {
    if (pub.getStatus() == Status.PUBLISHED) return;
    // DISETUJUI → DIPUBLIKASI (ber-guard). Bila publikasi yang ditarik diterbitkan
    // ulang, laporannya berstatus DITARIK → DIPUBLIKASI.
    ReportStatus from =
        report.getStatus() == ReportStatus.DITARIK
            ? ReportStatus.DITARIK
            : ReportStatus.DISETUJUI;
    reportStatusService.transition(
        report.getId(),
        from,
        ReportStatus.DIPUBLIKASI,
        RoleName.PDD,
        pddUserId,
        "Laporan dipublikasikan");
    pub.setStatus(Status.PUBLISHED);
    pub.setPublishedAt(OffsetDateTime.now());
  }

  private ReadyReport toReadyReport(Report report) {
    Investigation inv = investigationRepository.findByReportId(report.getId()).orElse(null);
    boolean hasDraft = publicationRepository.findByReportId(report.getId()).isPresent();
    return new ReadyReport(
        report.getId(),
        report.getTicketCode(),
        report.getTitle(),
        report.getCategory().name(),
        inv == null || inv.getVerdict() == null ? null : inv.getVerdict().name(),
        inv == null ? null : inv.getRecommendedSanction(),
        inv == null ? null : inv.getFindings(),
        report.getReportedCandidateText(),
        hasDraft);
  }

  private PublicItem toPublicItem(Publication pub) {
    Report report = reportRepository.findById(pub.getReportId()).orElse(null);
    Investigation inv = investigationRepository.findByReportId(pub.getReportId()).orElse(null);
    return new PublicItem(
        pub.getSlug(),
        pub.getTitle(),
        pub.getSummary(),
        report == null ? null : report.getCategory().name(),
        inv == null || inv.getVerdict() == null ? null : inv.getVerdict().name(),
        inv == null ? null : inv.getRecommendedSanction(),
        report == null ? null : report.getReportedCandidateText(),
        pub.getInstagramUrl(),
        pub.getPublishedAt());
  }

  private Publication requirePublication(Long id) {
    return publicationRepository
        .findById(id)
        .orElseThrow(() -> ResourceNotFoundException.of("Publikasi", id));
  }

  private String uniqueSlug(String title) {
    String base = slugify(title);
    String slug = base;
    int n = 2;
    while (publicationRepository.existsBySlug(slug)) {
      slug = base + "-" + n++;
    }
    return slug;
  }

  private String slugify(String input) {
    String normalized =
        Normalizer.normalize(input, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    String slug =
        normalized
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
    if (slug.length() > 180) slug = slug.substring(0, 180).replaceAll("-$", "");
    return slug.isBlank() ? "publikasi" : slug;
  }

  private String emptyToNull(String s) {
    return (s == null || s.isBlank()) ? null : s.trim();
  }
}
