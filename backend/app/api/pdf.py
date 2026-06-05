from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.pdf_service import PDFService
from app.services.report_service import ReportService
from app.utils.exceptions import bad_request

router = APIRouter(prefix="/reports/{report_id}/pdf")


def _ensure_report_complete(report_id: UUID, db: Session) -> None:
    detail = ReportService(db).get_report_detail(report_id)
    if not detail.is_complete:
        raise bad_request(
            f"Report is incomplete: {detail.missing_accounts} account balance(s) still missing."
        )


@router.get("/sacs")
def download_sacs_pdf(report_id: UUID, db: Session = Depends(get_db)) -> Response:
    _ensure_report_complete(report_id, db)
    pdf_bytes = PDFService(db).generate_sacs_pdf(report_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="report-{report_id}-sacs.pdf"'
        },
    )


@router.get("/tcc")
def download_tcc_pdf(report_id: UUID, db: Session = Depends(get_db)) -> Response:
    _ensure_report_complete(report_id, db)
    pdf_bytes = PDFService(db).generate_tcc_pdf(report_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="report-{report_id}-tcc.pdf"'
        },
    )
