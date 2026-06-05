from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.account import AccountOwner, AccountType


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    account_type: AccountType
    owner: AccountOwner = AccountOwner.CLIENT_1
    institution: str | None = Field(default=None, max_length=255)
    account_last_four: str | None = Field(default=None, max_length=4, min_length=4)
    interest_rate: Decimal | None = Field(default=None, ge=0, max_digits=5, decimal_places=2)
    property_address: str | None = Field(default=None, max_length=500)


class AccountUpdate(AccountCreate):
    pass


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    client_id: UUID
    name: str
    account_type: AccountType
    owner: AccountOwner
    institution: str | None
    account_last_four: str | None
    interest_rate: Decimal | None
    property_address: str | None
    created_at: datetime
