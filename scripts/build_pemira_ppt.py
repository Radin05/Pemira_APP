from __future__ import annotations

import html
import os
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ppt" / "Pemira_APP_Presentation.pptx"
LOGO = ROOT / "pemira-frontend" / "public" / "logo-kp.png"
LANDING = sorted((ROOT / "docs" / "ppt" / "landing page").glob("*.png"))
STAFF = sorted((ROOT / "docs" / "ppt" / "KP Staff").glob("*.png"))

# 16:9 widescreen, PowerPoint EMU units
SLIDE_W = 12192000
SLIDE_H = 6858000

NAVY_DARK = "0B162C"
NAVY = "132447"
NAVY_SOFT = "1B2F57"
GOLD = "E4AD22"
GOLD_LIGHT = "F4C64E"
WHITE = "FFFFFF"
INK_MUTED = "B8C3D9"
SUCCESS = "22C55E"


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def emu(inch: float) -> int:
    return int(inch * 914400)


def pos(x: float, y: float, w: float, h: float) -> tuple[int, int, int, int]:
    return emu(x), emu(y), emu(w), emu(h)


def fit_box(img_w: int, img_h: int, box_x: float, box_y: float, box_w: float, box_h: float):
    ratio = img_w / img_h
    box_ratio = box_w / box_h
    if ratio > box_ratio:
        w = box_w
        h = box_w / ratio
        x = box_x
        y = box_y + (box_h - h) / 2
    else:
        h = box_h
        w = box_h * ratio
        x = box_x + (box_w - w) / 2
        y = box_y
    return pos(x, y, w, h)


def png_size(path: Path) -> tuple[int, int]:
    with path.open("rb") as f:
        sig = f.read(24)
    if sig[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG: {path}")
    return int.from_bytes(sig[16:20], "big"), int.from_bytes(sig[20:24], "big")


def bg(color=NAVY_DARK):
    return f"""<p:bg><p:bgPr><a:solidFill><a:srgbClr val=\"{color}\"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>"""


def rect(idx, name, x, y, w, h, fill, line=None, radius=False, alpha=None):
    x, y, w, h = pos(x, y, w, h)
    geom = "roundRect" if radius else "rect"
    alpha_xml = f"<a:alpha val=\"{alpha}\"/>" if alpha else ""
    line_xml = "<a:ln><a:noFill/></a:ln>" if line is None else f"<a:ln w=\"12700\"><a:solidFill><a:srgbClr val=\"{line}\"/></a:solidFill></a:ln>"
    return f"""
      <p:sp>
        <p:nvSpPr><p:cNvPr id=\"{idx}\" name=\"{name}\"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x=\"{x}\" y=\"{y}\"/><a:ext cx=\"{w}\" cy=\"{h}\"/></a:xfrm><a:prstGeom prst=\"{geom}\"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val=\"{fill}\">{alpha_xml}</a:srgbClr></a:solidFill>{line_xml}</p:spPr>
      </p:sp>"""


def text(idx, name, body, x, y, w, h, size=28, color=WHITE, bold=False, align="l", alpha=None):
    x, y, w, h = pos(x, y, w, h)
    bold_attr = ' b="1"' if bold else ""
    alpha_xml = f"<a:alpha val=\"{alpha}\"/>" if alpha else ""
    paras = []
    for line in body.split("\n"):
        paras.append(
            f"""<a:p><a:pPr algn=\"{align}\"/><a:r><a:rPr lang=\"id-ID\" sz=\"{size*100}\"{bold_attr}><a:solidFill><a:srgbClr val=\"{color}\">{alpha_xml}</a:srgbClr></a:solidFill></a:rPr><a:t>{esc(line)}</a:t></a:r></a:p>"""
        )
    return f"""
      <p:sp>
        <p:nvSpPr><p:cNvPr id=\"{idx}\" name=\"{name}\"/><p:cNvSpPr txBox=\"1\"/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x=\"{x}\" y=\"{y}\"/><a:ext cx=\"{w}\" cy=\"{h}\"/></a:xfrm><a:prstGeom prst=\"rect\"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>
        <p:txBody><a:bodyPr wrap=\"square\" rtlCol=\"0\"><a:spAutoFit/></a:bodyPr><a:lstStyle/>{''.join(paras)}</p:txBody>
      </p:sp>"""


def image(idx, name, rid, x, y, w, h):
    return f"""
      <p:pic>
        <p:nvPicPr><p:cNvPr id=\"{idx}\" name=\"{name}\"/><p:cNvPicPr><a:picLocks noChangeAspect=\"1\"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed=\"{rid}\"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x=\"{x}\" y=\"{y}\"/><a:ext cx=\"{w}\" cy=\"{h}\"/></a:xfrm><a:prstGeom prst=\"rect\"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>"""


def slide_xml(shapes: str):
    return f"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<p:sld xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" xmlns:p=\"http://schemas.openxmlformats.org/presentationml/2006/main\"><p:cSld>{bg()}<p:spTree><p:nvGrpSpPr><p:cNvPr id=\"1\" name=\"\"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x=\"0\" y=\"0\"/><a:ext cx=\"0\" cy=\"0\"/><a:chOff x=\"0\" y=\"0\"/><a:chExt cx=\"0\" cy=\"0\"/></a:xfrm></p:grpSpPr>{shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>"""


def slide_rels(image_targets: list[tuple[str, str]]):
    rels = ["""<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout\" Target=\"../slideLayouts/slideLayout1.xml\"/>"""]
    for rid, target in image_targets:
        rels.append(f"<Relationship Id=\"{rid}\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"../media/{target}\"/>")
    return f"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">{''.join(rels)}</Relationships>"""


def header(title: str, subtitle: str | None = None):
    s = rect(10, "top bar", 0, 0, 13.333, 0.82, NAVY, None)
    s += rect(11, "gold line", 0, 0.80, 13.333, 0.04, GOLD, None)
    s += text(12, "slide title", title, 0.55, 0.22, 8.5, 0.4, 20, WHITE, True)
    if subtitle:
        s += text(13, "slide subtitle", subtitle, 9.1, 0.25, 3.6, 0.3, 10, INK_MUTED, False, "r")
    return s


slides: list[dict] = []
media: dict[Path, str] = {}

def add_media(path: Path) -> str:
    if path not in media:
        media[path] = f"image{len(media)+1}{path.suffix.lower()}"
    return media[path]

# Slide 1 - cover
logo_target = add_media(LOGO)
sh = rect(2, "accent", 0, 0, 13.333, 7.5, NAVY_DARK, None)
sh += rect(3, "left panel", 0, 0, 4.2, 7.5, NAVY, None)
sh += rect(4, "gold block", 0.5, 5.95, 2.0, 0.12, GOLD, None)
sh += image(5, "logo", "rId2", *pos(0.8, 0.85, 1.65, 1.65))
sh += text(6, "eyebrow", "KOMITE PENGAWASAN", 0.75, 2.75, 3.2, 0.35, 14, GOLD, True)
sh += text(7, "title", "PEMIRA APP\n2025", 0.72, 3.15, 3.25, 1.4, 40, WHITE, True)
sh += text(8, "main", "Sistem Pelaporan dan Pengawasan\nPelanggaran Pemilihan Raya", 4.85, 1.45, 7.3, 1.5, 34, WHITE, True)
sh += text(9, "desc", "Platform digital untuk pelaporan dugaan pelanggaran, pelacakan status, investigasi internal, dan publikasi putusan secara transparan.", 4.9, 3.2, 6.8, 1.0, 16, INK_MUTED)
sh += rect(10, "pill", 4.9, 4.55, 2.55, 0.42, GOLD, None, True)
sh += text(11, "pill text", "KM Poltekkes Bandung", 5.05, 4.67, 2.2, 0.2, 11, NAVY_DARK, True, "c")
slides.append({"xml": slide_xml(sh), "rels": [("rId2", logo_target)]})

# Slide 2 - fungsi aplikasi
sh = header("Fungsi dan Kegunaan Aplikasi", "PEMIRA APP 2025")
sh += text(
    20,
    "intro",
    "PEMIRA APP dirancang sebagai kanal digital resmi untuk memudahkan mahasiswa melapor dan membantu Komite Pengawasan mengelola proses penanganan laporan secara rapi.",
    0.9,
    1.15,
    11.4,
    0.55,
    16,
    INK_MUTED,
)
function_items = [
    ("01", "Kanal Pelaporan Mahasiswa", "Mahasiswa dapat mengirim laporan dugaan pelanggaran tanpa login, baik dengan mengisi form langsung maupun mengunggah template formulir."),
    ("02", "Pelacakan Status", "Setiap laporan mendapatkan kode tiket. Pelapor dapat memantau status menggunakan kode tiket dan NPM."),
    ("03", "Manajemen Investigasi", "Staf KP dapat meninjau antrean laporan, memeriksa bukti, mencatat proses, dan meneruskan hasil penanganan sesuai role."),
    ("04", "Transparansi Publik", "Putusan yang sudah disetujui dapat dipublikasikan agar mahasiswa mendapatkan informasi resmi dan terdokumentasi."),
]
for i, (num, title, desc) in enumerate(function_items):
    x = 0.9 + (i % 2) * 6.05
    y = 2.15 + (i // 2) * 1.75
    sh += rect(30 + i, "function card", x, y, 5.55, 1.35, NAVY_SOFT, "31496F", True)
    sh += rect(40 + i, "function num", x + 0.25, y + 0.28, 0.62, 0.62, GOLD, None, True)
    sh += text(50 + i, "function num text", num, x + 0.37, y + 0.43, 0.38, 0.14, 11, NAVY_DARK, True, "c")
    sh += text(60 + i, "function title", title, x + 1.05, y + 0.27, 4.15, 0.28, 15, WHITE, True)
    sh += text(70 + i, "function desc", desc, x + 1.05, y + 0.68, 4.1, 0.42, 10, INK_MUTED)
sh += rect(90, "bottom line", 0.9, 6.55, 11.55, 0.04, GOLD, None)
slides.append({"xml": slide_xml(sh), "rels": []})

# Slide 3 - agenda
sh = header("Ringkasan Presentasi", "PEMIRA APP 2025")
items = [
    ("01", "Halaman Publik", "Beranda, informasi PEMIRA, aturan main, pelaporan, status laporan, transparansi, dan profil KP."),
    ("02", "Alur Pelaporan", "Mahasiswa melapor tanpa login, mendapatkan kode tiket, lalu melacak status menggunakan NPM."),
    ("03", "Dashboard Staf KP", "Panel internal untuk pengelolaan laporan, investigasi, persetujuan, publikasi, kandidat, dan user."),
]
for i, (num, title, desc) in enumerate(items):
    y = 1.35 + i * 1.55
    sh += rect(20+i, "agenda card", 1.0, y, 11.3, 1.15, NAVY_SOFT, "31496F", True)
    sh += text(30+i, "num", num, 1.25, y+0.25, 0.85, 0.45, 22, GOLD, True, "c")
    sh += text(40+i, "agenda title", title, 2.25, y+0.22, 3.2, 0.35, 18, WHITE, True)
    sh += text(50+i, "agenda desc", desc, 2.25, y+0.62, 9.2, 0.35, 12, INK_MUTED)
slides.append({"xml": slide_xml(sh), "rels": []})

# Section landing
sh = rect(2, "bg", 0, 0, 13.333, 7.5, NAVY_DARK, None)
sh += image(3, "logo", "rId2", *pos(5.65, 1.15, 2.0, 2.0))
sh += text(4, "section", "HALAMAN PUBLIK", 0.8, 3.55, 11.7, 0.75, 40, WHITE, True, "c")
sh += text(5, "section desc", "Tampilan kanal informasi dan pelaporan untuk mahasiswa", 1.1, 4.45, 11.1, 0.4, 17, INK_MUTED, False, "c")
sh += rect(6, "line", 5.15, 5.1, 3.0, 0.08, GOLD, None)
slides.append({"xml": slide_xml(sh), "rels": [("rId2", logo_target)]})

landing_pages = [
    (
        "Beranda dan Identitas Aplikasi",
        "Menampilkan identitas Komite Pengawasan PEMIRA 2025, ajakan melapor, serta akses cepat menuju informasi dan kanal pelaporan.",
    ),
    (
        "Prinsip Pengawasan dan Ringkasan Sistem",
        "Menjelaskan nilai utama pengawasan seperti independensi, transparansi, akuntabilitas, dan kepastian hukum.",
    ),
    (
        "Informasi PEMIRA",
        "Berisi informasi umum, tahapan, serta konteks pelaksanaan PEMIRA agar mahasiswa memahami proses yang sedang berjalan.",
    ),
    (
        "Aturan Main",
        "Menyajikan ketentuan dan larangan selama PEMIRA sebagai dasar penilaian dugaan pelanggaran.",
    ),
    (
        "Form Lapor Pelanggaran",
        "Mahasiswa dapat melaporkan dugaan pelanggaran tanpa login dengan mengisi detail kejadian, identitas, dan bukti pendukung.",
    ),
    (
        "Upload Formulir / Lampiran Bukti",
        "Selain mengisi langsung, pelapor dapat mengunduh template formulir, mengisinya, lalu mengunggah hasilnya bersama bukti.",
    ),
    (
        "Pelacakan Status Laporan",
        "Pelapor dapat memantau perkembangan laporan menggunakan kode tiket dan NPM yang digunakan saat mengirim laporan.",
    ),
    (
        "Transparansi dan Tentang KP",
        "Menampilkan publikasi putusan, profil Komite Pengawasan, struktur divisi, dan kanal kontak resmi.",
    ),
]
for i, img_path in enumerate(LANDING):
    target = add_media(img_path)
    iw, ih = png_size(img_path)
    x, y, w, h = fit_box(iw, ih, 0.95, 1.62, 7.25, 4.08)
    title, desc = landing_pages[i] if i < len(landing_pages) else ("Halaman Publik", "Tampilan halaman publik aplikasi PEMIRA APP.")
    sh = header(title, f"Landing Page · {i+1:02d}")
    sh += rect(20, "image shadow", 0.76, 1.43, 7.63, 4.46, "050B17", None, True, 40000)
    sh += rect(21, "image frame", 0.80, 1.47, 7.55, 4.38, NAVY_SOFT, GOLD, True)
    sh += rect(22, "browser bar", 0.95, 1.62, 7.25, 0.24, "0B162C", None)
    sh += image(23, "screenshot", "rId2", x, y, w, h)
    sh += text(24, "image caption", "Cuplikan tampilan aplikasi", 0.95, 6.05, 7.2, 0.22, 10, INK_MUTED, False, "c")
    sh += rect(25, "desc card", 8.75, 1.47, 3.75, 4.38, NAVY_SOFT, "31496F", True)
    sh += text(26, "desc label", "DESKRIPSI", 9.05, 1.82, 3.0, 0.25, 10, GOLD, True)
    sh += text(27, "desc title", title, 9.05, 2.24, 3.05, 0.78, 17, WHITE, True)
    sh += text(28, "desc body", desc, 9.05, 3.23, 3.05, 1.35, 11, INK_MUTED)
    sh += rect(29, "note pill", 9.05, 5.15, 2.65, 0.42, GOLD, None, True)
    sh += text(30, "note", "Halaman Publik", 9.27, 5.28, 2.2, 0.18, 10, NAVY_DARK, True, "c")
    slides.append({"xml": slide_xml(sh), "rels": [("rId2", target)]})

# Section staff
sh = rect(2, "bg", 0, 0, 13.333, 7.5, NAVY_DARK, None)
sh += image(3, "logo", "rId2", *pos(5.65, 1.15, 2.0, 2.0))
sh += text(4, "section", "DASHBOARD STAF KP", 0.8, 3.55, 11.7, 0.75, 40, WHITE, True, "c")
sh += text(5, "section desc", "Panel kerja internal untuk pengelolaan laporan dan administrasi", 1.1, 4.45, 11.1, 0.4, 17, INK_MUTED, False, "c")
sh += rect(6, "line", 5.15, 5.1, 3.0, 0.08, GOLD, None)
slides.append({"xml": slide_xml(sh), "rels": [("rId2", logo_target)]})

staff_pages = [
    (
        "Login Staf Komite Pengawasan",
        "Akses khusus staf KP menggunakan email dan password. Mahasiswa tidak perlu login untuk melapor atau melacak status.",
    ),
    (
        "Dashboard Internal KP",
        "Beranda kerja staf untuk melihat peran akun, akses cepat, dan modul yang sesuai dengan otorisasi masing-masing divisi.",
    ),
    (
        "Manajemen Data dan Antrean Kerja",
        "Admin dan staf dapat mengelola data pendukung seperti kandidat, pengguna, serta antrean laporan yang perlu diproses.",
    ),
    (
        "Detail Laporan dan Tindak Lanjut",
        "Staf berwenang dapat membuka detail laporan, meninjau bukti, mencatat proses, dan meneruskan status penanganan.",
    ),
]
for i, img_path in enumerate(STAFF):
    target = add_media(img_path)
    iw, ih = png_size(img_path)
    x, y, w, h = fit_box(iw, ih, 0.95, 1.62, 7.25, 4.08)
    title, desc = staff_pages[i] if i < len(staff_pages) else ("Dashboard Staf", "Tampilan panel kerja internal Komite Pengawasan.")
    sh = header(title, f"KP Staff · {i+1:02d}")
    sh += rect(20, "image shadow", 0.76, 1.43, 7.63, 4.46, "050B17", None, True, 40000)
    sh += rect(21, "image frame", 0.80, 1.47, 7.55, 4.38, NAVY_SOFT, GOLD, True)
    sh += rect(22, "browser bar", 0.95, 1.62, 7.25, 0.24, "0B162C", None)
    sh += image(23, "screenshot", "rId2", x, y, w, h)
    sh += text(24, "image caption", "Cuplikan tampilan dashboard", 0.95, 6.05, 7.2, 0.22, 10, INK_MUTED, False, "c")
    sh += rect(25, "desc card", 8.75, 1.47, 3.75, 4.38, NAVY_SOFT, "31496F", True)
    sh += text(26, "desc label", "DESKRIPSI", 9.05, 1.82, 3.0, 0.25, 10, GOLD, True)
    sh += text(27, "desc title", title, 9.05, 2.24, 3.05, 0.78, 17, WHITE, True)
    sh += text(28, "desc body", desc, 9.05, 3.23, 3.05, 1.35, 11, INK_MUTED)
    sh += rect(29, "note pill", 9.05, 5.15, 2.65, 0.42, GOLD, None, True)
    sh += text(30, "note", "Dashboard Staf", 9.27, 5.28, 2.2, 0.18, 10, NAVY_DARK, True, "c")
    slides.append({"xml": slide_xml(sh), "rels": [("rId2", target)]})

# Closing
sh = rect(2, "bg", 0, 0, 13.333, 7.5, NAVY_DARK, None)
sh += rect(3, "top", 0, 0, 13.333, 1.05, NAVY, None)
sh += image(4, "logo", "rId2", *pos(0.75, 0.22, 0.65, 0.65))
sh += text(5, "brand", "Komite Pengawasan", 1.55, 0.28, 3.5, 0.3, 16, WHITE, True)
sh += text(6, "tag", "PEMIRA 2025", 1.55, 0.58, 2.2, 0.22, 9, GOLD, True)
sh += text(7, "thanks", "Terima Kasih", 1.0, 2.0, 11.2, 0.7, 44, WHITE, True, "c")
sh += text(8, "desc", "PEMIRA APP siap digunakan sebagai kanal pelaporan, pengawasan, dan transparansi proses Pemilihan Raya.", 2.0, 3.0, 9.3, 0.7, 17, INK_MUTED, False, "c")
sh += rect(9, "ig card", 4.2, 4.25, 4.95, 0.72, NAVY_SOFT, "31496F", True)
sh += text(10, "ig", "Instagram: @kppemirapoltekkesbdg2", 4.45, 4.48, 4.45, 0.25, 14, GOLD, True, "c")
sh += text(11, "email", "kp.pemira@poltekkesbandung.ac.id", 3.7, 5.35, 5.9, 0.25, 12, INK_MUTED, False, "c")
slides.append({"xml": slide_xml(sh), "rels": [("rId2", logo_target)]})

# Core PPTX package files
slide_count = len(slides)

content_types = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Default Extension="png" ContentType="image/png"/>',
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
    '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
    '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
    '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
    '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
]
for i in range(1, slide_count + 1):
    content_types.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')
content_types.append('</Types>')

rels_root = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'''

created = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
core = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>PEMIRA APP 2025</dc:title><dc:creator>Komite Pengawasan</dc:creator><cp:lastModifiedBy>Pi Coding Agent</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">{created}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">{created}</dcterms:modified></cp:coreProperties>'''

app = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft PowerPoint</Application><PresentationFormat>Widescreen</PresentationFormat><Slides>{slide_count}</Slides><Company>Komite Pengawasan PEMIRA 2025</Company></Properties>'''

sld_ids = ''.join([f'<p:sldId id="{255+i}" r:id="rId{i+1}"/>' for i in range(1, slide_count + 1)])
pres = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>{sld_ids}</p:sldIdLst><p:sldSz cx="{SLIDE_W}" cy="{SLIDE_H}" type="wide"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="id-ID"/></a:defPPr></p:defaultTextStyle></p:presentation>'''

pres_rels = ['<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>']
for i in range(1, slide_count + 1):
    pres_rels.append(f'<Relationship Id="rId{i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>')
pres_rels.append('<Relationship Id="rId999" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>')
pres_rels_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{''.join(pres_rels)}</Relationships>'''

master = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="{NAVY_DARK}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>'''
master_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>'''
layout = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'''
layout_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>'''
theme = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="PEMIRA Theme"><a:themeElements><a:clrScheme name="PEMIRA"><a:dk1><a:srgbClr val="{NAVY_DARK}"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="{NAVY}"/></a:dk2><a:lt2><a:srgbClr val="F7F9FC"/></a:lt2><a:accent1><a:srgbClr val="{GOLD}"/></a:accent1><a:accent2><a:srgbClr val="{NAVY_SOFT}"/></a:accent2><a:accent3><a:srgbClr val="{SUCCESS}"/></a:accent3><a:accent4><a:srgbClr val="{GOLD_LIGHT}"/></a:accent4><a:accent5><a:srgbClr val="7286AA"/></a:accent5><a:accent6><a:srgbClr val="B8C3D9"/></a:accent6><a:hlink><a:srgbClr val="{GOLD}"/></a:hlink><a:folHlink><a:srgbClr val="{GOLD_LIGHT}"/></a:folHlink></a:clrScheme><a:fontScheme name="Inter"><a:majorFont><a:latin typeface="Inter"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Inter"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="PEMIRA"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>'''

OUT.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", "".join(content_types))
    z.writestr("_rels/.rels", rels_root)
    z.writestr("docProps/core.xml", core)
    z.writestr("docProps/app.xml", app)
    z.writestr("ppt/presentation.xml", pres)
    z.writestr("ppt/_rels/presentation.xml.rels", pres_rels_xml)
    z.writestr("ppt/slideMasters/slideMaster1.xml", master)
    z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", master_rels)
    z.writestr("ppt/slideLayouts/slideLayout1.xml", layout)
    z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", layout_rels)
    z.writestr("ppt/theme/theme1.xml", theme)
    for i, s in enumerate(slides, 1):
        z.writestr(f"ppt/slides/slide{i}.xml", s["xml"])
        z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", slide_rels(s["rels"]))
    for path, target in media.items():
        z.write(path, f"ppt/media/{target}")

print(f"Wrote {OUT} ({slide_count} slides, {len(media)} images)")
