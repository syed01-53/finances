import logging
from decimal import Decimal

from app.models.account import AccountOwner, AccountType
from app.models.balance import Balance
from app.models.client import Client
from app.schemas.calculation import SACSCalculation, TCCCalculation

RETIREMENT_TYPES = frozenset(
    {AccountType.IRA, AccountType.ROTH_IRA, AccountType.K401, AccountType.PENSION}
)
LIABILITY_TYPES = frozenset({AccountType.MORTGAGE, AccountType.AUTO_LOAN})

logger = logging.getLogger(__name__)


class CalculationService:
    @staticmethod
    def calculate_sacs(client: Client) -> SACSCalculation:
        inflow = Decimal(client.salary)
        outflow = Decimal(client.expense_budget)
        excess = inflow - outflow
        private_reserve_target = (Decimal("6") * outflow) + Decimal(
            client.insurance_deductibles
        )
        logger.debug(
            "SACS calculated inflow=%s outflow=%s excess=%s target=%s",
            inflow,
            outflow,
            excess,
            private_reserve_target,
        )
        return SACSCalculation(
            inflow=inflow,
            outflow=outflow,
            excess=excess,
            private_reserve_target=private_reserve_target,
        )

    @staticmethod
    def calculate_tcc(balances: list[Balance]) -> TCCCalculation:
        client_1_retirement = Decimal("0")
        client_2_retirement = Decimal("0")
        non_retirement = Decimal("0")
        trust = Decimal("0")
        liabilities = Decimal("0")

        for balance in balances:
            amount = Decimal(balance.amount)
            account = balance.account
            account_type = account.account_type
            owner = account.owner

            if account_type in RETIREMENT_TYPES:
                if owner == AccountOwner.CLIENT_2:
                    client_2_retirement += amount
                else:
                    client_1_retirement += amount
            elif account_type == AccountType.BROKERAGE:
                non_retirement += amount
            elif account_type == AccountType.TRUST:
                trust += amount
            elif account_type in LIABILITY_TYPES:
                liabilities += amount

        grand_total = (
            client_1_retirement + client_2_retirement + non_retirement + trust
        )
        logger.debug(
            "TCC calculated c1=%s c2=%s non_ret=%s trust=%s grand=%s liabilities=%s",
            client_1_retirement,
            client_2_retirement,
            non_retirement,
            trust,
            grand_total,
            liabilities,
        )

        return TCCCalculation(
            client_1_retirement=client_1_retirement,
            client_2_retirement=client_2_retirement,
            non_retirement=non_retirement,
            trust=trust,
            grand_total=grand_total,
            liabilities=liabilities,
        )
