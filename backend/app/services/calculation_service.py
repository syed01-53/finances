import logging
from decimal import Decimal

from app.models.account import AccountOwner, AccountType, SacsRole
from app.models.balance import Balance
from app.models.client import Client
from app.schemas.calculation import SACSCalculation, TCCCalculation

RETIREMENT_TYPES = frozenset(
    {AccountType.IRA, AccountType.ROTH_IRA, AccountType.K401, AccountType.PENSION}
)
LIABILITY_TYPES = frozenset({AccountType.MORTGAGE, AccountType.AUTO_LOAN})
INVESTMENT_TYPES = frozenset(
    {AccountType.BROKERAGE, AccountType.IRA, AccountType.ROTH_IRA, AccountType.K401}
)
FLOOR_AMOUNT = Decimal("1000")

logger = logging.getLogger(__name__)


class CalculationService:
    @staticmethod
    def calculate_sacs(client: Client, balances: list[Balance] | None = None) -> SACSCalculation:
        inflow = Decimal(client.salary)
        outflow = Decimal(client.expense_budget)
        excess = inflow - outflow
        private_reserve_target = (Decimal("6") * outflow) + Decimal(
            client.insurance_deductibles
        )

        private_reserve_balance = Decimal("0")
        investment_balance = Decimal("0")
        has_marked_investment = False

        for balance in balances or []:
            amount = Decimal(balance.amount)
            account = balance.account
            if account.sacs_role == SacsRole.PRIVATE_RESERVE:
                private_reserve_balance += amount
            if account.sacs_role == SacsRole.INVESTMENT:
                investment_balance += amount
                has_marked_investment = True

        if not has_marked_investment:
            for balance in balances or []:
                if balance.account.account_type == AccountType.BROKERAGE:
                    investment_balance += Decimal(balance.amount)

        logger.debug(
            "SACS calculated inflow=%s outflow=%s excess=%s target=%s reserve=%s investment=%s",
            inflow,
            outflow,
            excess,
            private_reserve_target,
            private_reserve_balance,
            investment_balance,
        )
        return SACSCalculation(
            inflow=inflow,
            outflow=outflow,
            excess=excess,
            private_reserve_target=private_reserve_target,
            private_reserve_balance=private_reserve_balance,
            investment_balance=investment_balance,
            floor_amount=FLOOR_AMOUNT,
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

    @staticmethod
    def account_needs_cash_balance(account_type: AccountType) -> bool:
        return account_type in INVESTMENT_TYPES
