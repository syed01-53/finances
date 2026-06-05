import logging
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.client import Client
from app.models.report import Report
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate
from app.utils.exceptions import not_found

logger = logging.getLogger(__name__)


class ClientService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_response(self, client: Client) -> ClientResponse:
        last_report_date = self.db.scalar(
            select(func.max(Report.created_at)).where(Report.client_id == client.id)
        )
        return ClientResponse.from_client(client, last_report_date=last_report_date)

    def create_client(self, payload: ClientCreate) -> ClientResponse:
        client = Client(**payload.model_dump())
        self.db.add(client)
        self.db.commit()
        self.db.refresh(client)
        logger.info("Created client id=%s email=%s", client.id, client.email)
        return self._to_response(client)

    def update_client(self, client_id: UUID, payload: ClientUpdate) -> ClientResponse:
        client = self.db.get(Client, client_id)
        if not client:
            logger.warning("Client not found id=%s", client_id)
            raise not_found("Client", client_id)
        for field, value in payload.model_dump().items():
            setattr(client, field, value)
        self.db.commit()
        self.db.refresh(client)
        logger.info("Updated client id=%s", client_id)
        return self._to_response(client)

    def get_clients(self) -> list[ClientResponse]:
        clients = list(self.db.scalars(select(Client).order_by(Client.created_at.desc())))
        logger.debug("Fetched %s clients", len(clients))
        return [self._to_response(client) for client in clients]

    def get_client(self, client_id: UUID) -> ClientResponse:
        client = self.db.get(Client, client_id)
        if not client:
            logger.warning("Client not found id=%s", client_id)
            raise not_found("Client", client_id)
        return self._to_response(client)

    def get_client_model(self, client_id: UUID) -> Client:
        client = self.db.get(Client, client_id)
        if not client:
            raise not_found("Client", client_id)
        return client

    def delete_client(self, client_id: UUID) -> None:
        client = self.db.get(Client, client_id)
        if not client:
            logger.warning("Client not found id=%s", client_id)
            raise not_found("Client", client_id)
        self.db.delete(client)
        self.db.commit()
        logger.info("Deleted client id=%s", client_id)
