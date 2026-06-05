from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.report import (
    ReportCreate,
    ReportDetailResponse,
    ReportResponse,
    ReportUpdate,
)
from app.services.report_service import ReportService

router = APIRouter()


@router.post(
    "/clients/{client_id}/reports",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Reports"],
)
def create_report(
    client_id: UUID,
    payload: ReportCreate,
    db: Session = Depends(get_db),
) -> ReportResponse:
    return ReportService(db).create_report(client_id, payload)


@router.get(
    "/clients/{client_id}/reports",
    response_model=list[ReportResponse],
    tags=["Reports"],
)
def get_client_reports(
    client_id: UUID,
    db: Session = Depends(get_db),
) -> list[ReportResponse]:
    return ReportService(db).get_reports_by_client(client_id)


@router.get(
    "/reports/{report_id}",
    response_model=ReportDetailResponse,
    tags=["Reports"],
)
def get_report(report_id: UUID, db: Session = Depends(get_db)) -> ReportDetailResponse:
    return ReportService(db).get_report_detail(report_id)


@router.put(
    "/reports/{report_id}",
    response_model=ReportResponse,
    tags=["Reports"],
)
def update_report(
    report_id: UUID,
    payload: ReportUpdate,
    db: Session = Depends(get_db),
) -> ReportResponse:
    return ReportService(db).update_report(report_id, payload)


@router.delete(
    "/reports/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Reports"],
)
def delete_report(report_id: UUID, db: Session = Depends(get_db)) -> None:
    ReportService(db).delete_report(report_id)
