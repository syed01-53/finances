from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.balance import BalanceResponse, BalanceUpsertRequest, BalanceWithAccountResponse
from app.services.balance_service import BalanceService

router = APIRouter(prefix="/reports/{report_id}/balances")


@router.post("", response_model=list[BalanceResponse], status_code=status.HTTP_200_OK)
def upsert_balances(
    report_id: UUID,
    payload: BalanceUpsertRequest,
    db: Session = Depends(get_db),
) -> list[BalanceResponse]:
    return BalanceService(db).upsert_balances(report_id, payload)


@router.get("", response_model=list[BalanceWithAccountResponse])
def get_balances(
    report_id: UUID,
    db: Session = Depends(get_db),
) -> list[BalanceWithAccountResponse]:
    return BalanceService(db).get_balances(report_id)


@router.get("/previous", response_model=list[BalanceWithAccountResponse])
def get_previous_balances(
    report_id: UUID,
    db: Session = Depends(get_db),
) -> list[BalanceWithAccountResponse]:
    return BalanceService(db).get_previous_balances(report_id)
