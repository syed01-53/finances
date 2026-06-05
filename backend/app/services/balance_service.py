import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.balance import Balance
from app.models.report import Report
from app.schemas.balance import BalanceUpsertRequest
from app.services.account_service import AccountService
from app.services.report_service import ReportService
from app.utils.exceptions import bad_request

logger = logging.getLogger(__name__)


class BalanceService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.report_service = ReportService(db)
        self.account_service = AccountService(db)

    def upsert_balances(
        self, report_id: UUID, payload: BalanceUpsertRequest
    ) -> list[Balance]:
        report = self.report_service.get_report(report_id)
        account_ids = [entry.account_id for entry in payload.balances]
        self.account_service.validate_accounts_belong_to_client(
            report.client_id, account_ids
        )

        existing_balances = {
            balance.account_id: balance
            for balance in self.db.scalars(
                select(Balance).where(Balance.report_id == report_id)
            )
        }

        results: list[Balance] = []
        for entry in payload.balances:
            balance = existing_balances.get(entry.account_id)
            if balance:
                balance.amount = entry.amount
            else:
                balance = Balance(
                    report_id=report_id,
                    account_id=entry.account_id,
                    amount=entry.amount,
                )
                self.db.add(balance)
            results.append(balance)

        self.db.commit()
        for balance in results:
            self.db.refresh(balance)
        logger.info(
            "Upserted %s balances for report_id=%s",
            len(results),
            report_id,
        )
        return results

    def get_balances(self, report_id: UUID) -> list[Balance]:
        self.report_service.get_report(report_id)
        balances = list(
            self.db.scalars(
                select(Balance)
                .options(joinedload(Balance.account))
                .where(Balance.report_id == report_id)
                .order_by(Balance.created_at.asc())
            )
        )
        logger.debug("Fetched %s balances for report_id=%s", len(balances), report_id)
        return balances

    def get_previous_balances(self, report_id: UUID) -> list[Balance]:
        report = self.report_service.get_report(report_id)
        previous = self.db.scalar(
            select(Report)
            .where(
                Report.client_id == report.client_id,
                (Report.year < report.year)
                | ((Report.year == report.year) & (Report.quarter < report.quarter)),
            )
            .order_by(Report.year.desc(), Report.quarter.desc())
            .limit(1)
        )
        if not previous:
            return []
        return list(
            self.db.scalars(
                select(Balance)
                .options(joinedload(Balance.account))
                .where(Balance.report_id == previous.id)
            )
        )
