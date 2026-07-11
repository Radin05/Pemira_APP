package id.kppoltekkesbdg.pemira.report;

import id.kppoltekkesbdg.pemira.report.dto.ReportSubmitRequest;
import id.kppoltekkesbdg.pemira.report.dto.ReportSubmitResponse;
import id.kppoltekkesbdg.pemira.report.dto.ReportTrackResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;

public interface ReportService {

  ReportSubmitResponse submit(ReportSubmitRequest request, List<MultipartFile> evidence);

  /** Empty bila tiket tidak ada ATAU NPM tidak cocok (tidak membedakan, cegah probing). */
  Optional<ReportTrackResponse> track(String ticketCode, String npm);
}
