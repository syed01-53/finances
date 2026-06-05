import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.balance import Balance
from app.models.report import Report
from app.schemas.calculation import SACSCalculation, TCCCalculation
from app.schemas.report import ReportCreate, ReportDetailResponse, ReportUpdate
from app.services.account_service import AccountService
from app.services.calculation_service import CalculationService
from app.services.client_service import ClientService
from app.utils.exceptions import bad_request, not_found

logger = logging.getLogger(__name__)


class ReportService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.client_service = ClientService(db)
        self.account_service = AccountService(db)
        self.calculation_service = CalculationService()

    def create_report(self, client_id: UUID, payload: ReportCreate) -> Report:
        self.client_service.get_client(client_id)

        existing = self.db.scalar(
            select(Report).where(
                Report.client_id == client_id,
                Report.year == payload.year,
                Report.quarter == payload.quarter,
            )
        )
        if existing:
            logger.warning(
                "Duplicate report for client_id=%s period=%s Q%s",
                client_id,
                payload.year,
                payload.quarter,
            )
            raise bad_request(
                f"Report already exists for {payload.year} Q{payload.quarter}"
            )

        report = Report(
            client_id=client_id,
            year=payload.year,
            quarter=payload.quarter,
            title=f"{payload.year} Q{payload.quarter}",
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        logger.info(
            "Created report id=%s client_id=%s title=%s",
            report.id,
            client_id,
            report.title,
        )
        return report

    def get_reports_by_client(self, client_id: UUID) -> list[Report]:
        self.client_service.get_client(client_id)
        reports = list(
            self.db.scalars(
                select(Report)
                .where(Report.client_id == client_id)
                .order_by(Report.year.desc(), Report.quarter.desc())
            )
        )
        logger.debug("Fetched %s reports for client_id=%s", len(reports), client_id)
        return reports

    def get_report(self, report_id: UUID) -> Report:
        report = self.db.scalar(
            select(Report)
            .options(
                joinedload(Report.client),
                joinedload(Report.balances).joinedload(Balance.account),
            )
            .where(Report.id == report_id)
        )
        if not report:
            logger.warning("Report not found id=%s", report_id)
            raise not_found("Report", report_id)
        return report

    def get_report_detail(self, report_id: UUID) -> ReportDetailResponse:
        report = self.get_report(report_id)
        sacs = self.calculation_service.calculate_sacs(report.client, report.balances)
        tcc = self.calculation_service.calculate_tcc(report.balances)
        accounts = self.account_service.get_accounts_by_client(report.client_id)
        balance_account_ids = {balance.account_id for balance in report.balances}
        missing = max(len(accounts) - len(balance_account_ids), 0)

        logger.info(
            "Calculated report detail id=%s excess=%s grand_total=%s",
            report_id,
            sacs.excess,
            tcc.grand_total,
        )
        return ReportDetailResponse(
            id=report.id,
            client_id=report.client_id,
            year=report.year,
            quarter=report.quarter,
            title=report.title,
            created_at=report.created_at,
            sacs=sacs,
            tcc=tcc,
            is_complete=missing == 0 and len(accounts) > 0,
            missing_accounts=missing,
        )

    def get_calculations(self, report_id: UUID) -> tuple[SACSCalculation, TCCCalculation]:
        report = self.get_report(report_id)
        sacs = self.calculation_service.calculate_sacs(report.client, report.balances)
        tcc = self.calculation_service.calculate_tcc(report.balances)
        return sacs, tcc

    def update_report(self, report_id: UUID, payload: ReportUpdate) -> Report:
        report = self.db.get(Report, report_id)
        if not report:
            logger.warning("Report not found id=%s", report_id)
            raise not_found("Report", report_id)

        existing = self.db.scalar(
            select(Report).where(
                Report.client_id == report.client_id,
                Report.year == payload.year,
                Report.quarter == payload.quarter,
                Report.id != report_id,
            )
        )
        if existing:
            logger.warning(
                "Duplicate report for client_id=%s period=%s Q%s",
                report.client_id,
                payload.year,
                payload.quarter,
            )
            raise bad_request(
                f"Report already exists for {payload.year} Q{payload.quarter}"
            )

        report.year = payload.year
        report.quarter = payload.quarter
        report.title = f"{payload.year} Q{payload.quarter}"
        self.db.commit()
        self.db.refresh(report)
        logger.info("Updated report id=%s title=%s", report_id, report.title)
        return report

    def delete_report(self, report_id: UUID) -> None:
        report = self.db.get(Report, report_id)
        if not report:
            logger.warning("Report not found id=%s", report_id)
            raise not_found("Report", report_id)
        self.db.delete(report)
        self.db.commit()
        logger.info("Deleted report id=%s", report_id)
