"""Rename SSN last four columns to full SSN

Revision ID: 003_ssn_fields
Revises: 002_prd_fields
Create Date: 2026-06-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003_ssn_fields"
down_revision: Union[str, Sequence[str], None] = "002_prd_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("clients", "ssn_last_four", new_column_name="ssn")
    op.alter_column("clients", "spouse_ssn_last_four", new_column_name="spouse_ssn")
    op.alter_column(
        "clients",
        "ssn",
        existing_type=sa.String(length=4),
        type_=sa.String(length=11),
        existing_nullable=True,
    )
    op.alter_column(
        "clients",
        "spouse_ssn",
        existing_type=sa.String(length=4),
        type_=sa.String(length=11),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "clients",
        "spouse_ssn",
        existing_type=sa.String(length=11),
        type_=sa.String(length=4),
        existing_nullable=True,
    )
    op.alter_column(
        "clients",
        "ssn",
        existing_type=sa.String(length=11),
        type_=sa.String(length=4),
        existing_nullable=True,
    )
    op.alter_column("clients", "spouse_ssn", new_column_name="spouse_ssn_last_four")
    op.alter_column("clients", "ssn", new_column_name="ssn_last_four")
