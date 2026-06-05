import logging
import re
from io import BytesIO
from pathlib import Path
from uuid import UUID

from fastapi import HTTPException, status
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session

from app.services.report_service import ReportService
from app.utils.age import calculate_age
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


def _ssn_last_four_filter(value) -> str:
    if not value:
        return "—"
    digits = re.sub(r"\D", "", str(value))
    return digits[-4:] if len(digits) >= 4 else "—"


def _age_filter(birth_date) -> str:
    age = calculate_age(birth_date)
    return str(age) if age is not None else "—"


def _html_to_pdf(html: str) -> bytes:
    from xhtml2pdf import pisa

    buffer = BytesIO()
    result = pisa.CreatePDF(html, dest=buffer, encoding="utf-8")
    if result.err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PDF generation failed.",
        )
    return buffer.getvalue()


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
        self.env.filters["ssn_last_four"] = _ssn_last_four_filter
        self.env.filters["owner_label"] = _owner_label_filter
        self.env.filters["client_age"] = _age_filter

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
