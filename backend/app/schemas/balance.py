from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.account import AccountResponse


class BalanceEntry(BaseModel):
    account_id: UUID
    amount: Decimal = Field(max_digits=14, decimal_places=2)


class BalanceUpsertRequest(BaseModel):
    balances: list[BalanceEntry] = Field(min_length=1)


class BalanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    report_id: UUID
    account_id: UUID
    amount: Decimal
    created_at: datetime
    updated_at: datetime


class BalanceWithAccountResponse(BalanceResponse):
    account: AccountResponse
