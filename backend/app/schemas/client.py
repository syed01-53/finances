from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.utils.age import calculate_age
from app.utils.ssn import normalize_ssn


class ClientFields(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    date_of_birth: date | None = None
    ssn: str | None = Field(default=None, max_length=11)
    is_married: bool = False
    spouse_name: str | None = Field(default=None, max_length=255)
    spouse_date_of_birth: date | None = None
    spouse_ssn: str | None = Field(default=None, max_length=11)
    salary: Decimal = Field(ge=0, max_digits=14, decimal_places=2)
    expense_budget: Decimal = Field(ge=0, max_digits=14, decimal_places=2)
    insurance_deductibles: Decimal = Field(default=Decimal("0"), ge=0, max_digits=14, decimal_places=2)


class ClientWrite(ClientFields):
    @field_validator("ssn", "spouse_ssn")
    @classmethod
    def validate_ssn(cls, value: str | None) -> str | None:
        return normalize_ssn(value)

    @model_validator(mode="after")
    def clear_spouse_when_not_married(self) -> "ClientWrite":
        if not self.is_married:
            self.spouse_name = None
            self.spouse_date_of_birth = None
            self.spouse_ssn = None
        return self


class ClientCreate(ClientWrite):
    pass


class ClientUpdate(ClientWrite):
    pass


class ClientResponse(ClientFields):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    age: int | None = None
    spouse_age: int | None = None
    last_report_date: datetime | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_client(cls, client, last_report_date: datetime | None = None) -> "ClientResponse":
        return cls(
            id=client.id,
            name=client.name,
            email=client.email,
            phone=client.phone,
            date_of_birth=client.date_of_birth,
            ssn=client.ssn,
            is_married=client.is_married,
            spouse_name=client.spouse_name,
            spouse_date_of_birth=client.spouse_date_of_birth,
            spouse_ssn=client.spouse_ssn,
            salary=client.salary,
            expense_budget=client.expense_budget,
            insurance_deductibles=client.insurance_deductibles,
            age=calculate_age(client.date_of_birth),
            spouse_age=calculate_age(client.spouse_date_of_birth),
            last_report_date=last_report_date,
            created_at=client.created_at,
            updated_at=client.updated_at,
        )
