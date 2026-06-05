"""Add marital status to clients

Revision ID: 005_marital_status
Revises: 004_clear_invalid_ssn
Create Date: 2026-06-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005_marital_status"
down_revision: Union[str, Sequence[str], None] = "004_clear_invalid_ssn"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "clients",
        sa.Column("is_married", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.execute(
        """
        UPDATE clients
        SET is_married = true
        WHERE spouse_name IS NOT NULL
           OR spouse_date_of_birth IS NOT NULL
           OR spouse_ssn IS NOT NULL
        """
    )
    op.alter_column("clients", "is_married", server_default=None)


def downgrade() -> None:
    op.drop_column("clients", "is_married")
