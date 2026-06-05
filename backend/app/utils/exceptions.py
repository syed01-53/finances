from uuid import UUID

from fastapi import HTTPException, status


def not_found(entity: str, entity_id: UUID | str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{entity} with id '{entity_id}' not found",
    )


def bad_request(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message,
    )
