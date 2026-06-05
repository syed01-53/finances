from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate
from app.services.client_service import ClientService

router = APIRouter(prefix="/clients")


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)) -> ClientResponse:
    return ClientService(db).create_client(payload)


@router.get("", response_model=list[ClientResponse])
def get_clients(db: Session = Depends(get_db)) -> list[ClientResponse]:
    return ClientService(db).get_clients()


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: UUID, db: Session = Depends(get_db)) -> ClientResponse:
    return ClientService(db).get_client(client_id)


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: UUID,
    payload: ClientUpdate,
    db: Session = Depends(get_db),
) -> ClientResponse:
    return ClientService(db).update_client(client_id, payload)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: UUID, db: Session = Depends(get_db)) -> None:
    ClientService(db).delete_client(client_id)
