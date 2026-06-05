from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.account import AccountCreate, AccountResponse, AccountUpdate
from app.services.account_service import AccountService

router = APIRouter(prefix="/clients/{client_id}/accounts")


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    client_id: UUID,
    payload: AccountCreate,
    db: Session = Depends(get_db),
) -> AccountResponse:
    return AccountService(db).create_account(client_id, payload)


@router.get("", response_model=list[AccountResponse])
def get_accounts(
    client_id: UUID,
    db: Session = Depends(get_db),
) -> list[AccountResponse]:
    return AccountService(db).get_accounts_by_client(client_id)


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    client_id: UUID,
    account_id: UUID,
    payload: AccountUpdate,
    db: Session = Depends(get_db),
) -> AccountResponse:
    return AccountService(db).update_account(client_id, account_id, payload)
