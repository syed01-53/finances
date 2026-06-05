from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.pdf_service import PDFService

router = APIRouter(prefix="/reports/{report_id}/pdf")


@router.get("/sacs")
def download_sacs_pdf(report_id: UUID, db: Session = Depends(get_db)) -> Response:
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
    pdf_bytes = PDFService(db).generate_tcc_pdf(report_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="report-{report_id}-tcc.pdf"'
        },
    )
