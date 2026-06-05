from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.calculation import SACSCalculation, TCCCalculation


class ReportCreate(BaseModel):
    year: int = Field(ge=2000, le=2100)
    quarter: int = Field(ge=1, le=4)


class ReportUpdate(ReportCreate):
    pass


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    client_id: UUID
    year: int
    quarter: int
    title: str
    created_at: datetime


class ReportDetailResponse(ReportResponse):
    sacs: SACSCalculation
    tcc: TCCCalculation
    is_complete: bool = False
    missing_accounts: int = 0
