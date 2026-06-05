import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate
from app.services.client_service import ClientService
from app.utils.exceptions import bad_request, not_found

logger = logging.getLogger(__name__)


class AccountService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.client_service = ClientService(db)

    def create_account(self, client_id: UUID, payload: AccountCreate) -> Account:
        self.client_service.get_client(client_id)
        account = Account(client_id=client_id, **payload.model_dump())
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        logger.info(
            "Created account id=%s client_id=%s type=%s owner=%s",
            account.id,
            client_id,
            account.account_type.value,
            account.owner.value,
        )
        return account

    def get_accounts_by_client(self, client_id: UUID) -> list[Account]:
        self.client_service.get_client(client_id)
        accounts = list(
            self.db.scalars(
                select(Account)
                .where(Account.client_id == client_id)
                .order_by(Account.created_at.desc())
            )
        )
        logger.debug("Fetched %s accounts for client_id=%s", len(accounts), client_id)
        return accounts

    def update_account(
        self, client_id: UUID, account_id: UUID, payload: AccountUpdate
    ) -> Account:
        account = self.get_account_for_client(client_id, account_id)
        for field, value in payload.model_dump().items():
            setattr(account, field, value)
        self.db.commit()
        self.db.refresh(account)
        logger.info("Updated account id=%s client_id=%s", account_id, client_id)
        return account

    def get_account_for_client(self, client_id: UUID, account_id: UUID) -> Account:
        account = self.db.scalar(
            select(Account).where(
                Account.id == account_id,
                Account.client_id == client_id,
            )
        )
        if not account:
            raise not_found("Account", account_id)
        return account

    def validate_accounts_belong_to_client(
        self, client_id: UUID, account_ids: list[UUID]
    ) -> None:
        accounts = self.get_accounts_by_client(client_id)
        valid_ids = {account.id for account in accounts}
        invalid_ids = [account_id for account_id in account_ids if account_id not in valid_ids]
        if invalid_ids:
            logger.warning(
                "Invalid accounts for client_id=%s: %s",
                client_id,
                invalid_ids,
            )
            raise bad_request(
                f"Accounts {invalid_ids} do not belong to client '{client_id}'"
            )
