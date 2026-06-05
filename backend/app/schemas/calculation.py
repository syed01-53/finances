from decimal import Decimal

from pydantic import BaseModel


class SACSCalculation(BaseModel):
    inflow: Decimal
    outflow: Decimal
    excess: Decimal
    private_reserve_target: Decimal


class TCCCalculation(BaseModel):
    client_1_retirement: Decimal
    client_2_retirement: Decimal
    non_retirement: Decimal
    trust: Decimal
    grand_total: Decimal
    liabilities: Decimal
