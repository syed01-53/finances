import logging
import os
from io import BytesIO
from pathlib import Path
from uuid import UUID

from fastapi import HTTPException, status
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session

from app.services.report_service import ReportService
from app.utils.ssn import mask_ssn

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
logger = logging.getLogger(__name__)


def _currency_filter(value) -> str:
    return f"${float(value):,.2f}"


def _currency_compact_filter(value) -> str:
    return f"${float(value):,.0f}"


def _owner_label_filter(owner: str, client) -> str:
    labels = {
        "client_1": client.name if getattr(client, "name", None) else "Client 1",
        "client_2": client.spouse_name if getattr(client, "spouse_name", None) else "Client 2",
        "joint": "Joint",
    }
    return labels.get(owner, owner)

_DEFAULT_MSYS2_DLL_DIR = Path("C:/msys64/mingw64/bin")


def _configure_weasyprint_dll_directories() -> None:
    if os.environ.get("WEASYPRINT_DLL_DIRECTORIES"):
        return

    if _DEFAULT_MSYS2_DLL_DIR.is_dir():
        os.environ["WEASYPRINT_DLL_DIRECTORIES"] = str(_DEFAULT_MSYS2_DLL_DIR)


def _html_to_pdf_with_weasyprint(html: str) -> bytes:
    _configure_weasyprint_dll_directories()
    from weasyprint import HTML

    return HTML(string=html, base_url=str(TEMPLATES_DIR)).write_pdf()


def _html_to_pdf_with_xhtml2pdf(html: str) -> bytes:
    from xhtml2pdf import pisa

    buffer = BytesIO()
    result = pisa.CreatePDF(html, dest=buffer, encoding="utf-8")
    if result.err:
        raise RuntimeError(f"xhtml2pdf reported {result.err} error(s)")
    return buffer.getvalue()


def _html_to_pdf(html: str) -> bytes:
    try:
        return _html_to_pdf_with_weasyprint(html)
    except OSError as exc:
        logger.warning("WeasyPrint unavailable, falling back to xhtml2pdf: %s", exc)
        try:
            return _html_to_pdf_with_xhtml2pdf(html)
        except Exception as fallback_exc:
            logger.error("PDF generation failed: %s", fallback_exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "PDF generation is unavailable. Install MSYS2 Pango for WeasyPrint "
                    "(pacman -S mingw-w64-x86_64-pango) or ensure xhtml2pdf is installed."
                ),
            ) from fallback_exc
    except Exception as exc:
        logger.error("WeasyPrint PDF generation failed: %s", exc)
        try:
            return _html_to_pdf_with_xhtml2pdf(html)
        except Exception as fallback_exc:
            logger.error("PDF generation failed: %s", fallback_exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="PDF generation failed.",
            ) from fallback_exc


class PDFService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.report_service = ReportService(db)
        self.env = Environment(
            loader=FileSystemLoader(TEMPLATES_DIR),
            autoescape=select_autoescape(["html", "xml"]),
        )
        self.env.filters["currency"] = _currency_filter
        self.env.filters["currency_compact"] = _currency_compact_filter
        self.env.filters["mask_ssn"] = mask_ssn
        self.env.filters["owner_label"] = _owner_label_filter

    def generate_sacs_pdf(self, report_id: UUID) -> bytes:
        report = self.report_service.get_report(report_id)
        sacs, _ = self.report_service.get_calculations(report_id)
        template = self.env.get_template("sacs.html")
        html = template.render(
            client=report.client,
            report=report,
            sacs=sacs,
        )
        pdf_bytes = _html_to_pdf(html)
        logger.info("Generated SACS PDF for report_id=%s size=%s bytes", report_id, len(pdf_bytes))
        return pdf_bytes

    def generate_tcc_pdf(self, report_id: UUID) -> bytes:
        report = self.report_service.get_report(report_id)
        _, tcc = self.report_service.get_calculations(report_id)
        template = self.env.get_template("tcc.html")
        html = template.render(
            client=report.client,
            report=report,
            tcc=tcc,
            balances=report.balances,
        )
        pdf_bytes = _html_to_pdf(html)
        logger.info("Generated TCC PDF for report_id=%s size=%s bytes", report_id, len(pdf_bytes))
        return pdf_bytes
