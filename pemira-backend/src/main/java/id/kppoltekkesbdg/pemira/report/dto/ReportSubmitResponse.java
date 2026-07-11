package id.kppoltekkesbdg.pemira.report.dto;

import java.time.OffsetDateTime;

public record ReportSubmitResponse(String ticketCode, OffsetDateTime submittedAt) {}
