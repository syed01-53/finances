"""PRD client and account fields

Revision ID: 002_prd_fields
Revises: 001_initial
Create Date: 2026-06-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002_prd_fields"
down_revision: Union[str, Sequence[str], None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

account_owner_enum = postgresql.ENUM(
    "client_1",
    "client_2",
    "joint",
    name="account_owner_enum",
    create_type=False,
)


def upgrade() -> None:
    op.execute("ALTER TYPE account_type_enum ADD VALUE IF NOT EXISTS 'pension'")

    account_owner_enum.create(op.get_bind(), checkfirst=True)

    op.add_column("clients", sa.Column("date_of_birth", sa.Date(), nullable=True))
    op.add_column("clients", sa.Column("ssn_last_four", sa.String(length=4), nullable=True))
    op.add_column("clients", sa.Column("spouse_name", sa.String(length=255), nullable=True))
    op.add_column("clients", sa.Column("spouse_date_of_birth", sa.Date(), nullable=True))
    op.add_column("clients", sa.Column("spouse_ssn_last_four", sa.String(length=4), nullable=True))
    op.add_column(
        "clients",
        sa.Column(
            "insurance_deductibles",
            sa.Numeric(precision=14, scale=2),
            nullable=False,
            server_default="0",
        ),
    )

    op.add_column(
        "accounts",
        sa.Column(
            "owner",
            account_owner_enum,
            nullable=False,
            server_default="client_1",
        ),
    )
    op.add_column("accounts", sa.Column("account_last_four", sa.String(length=4), nullable=True))
    op.add_column(
        "accounts",
        sa.Column("interest_rate", sa.Numeric(precision=5, scale=2), nullable=True),
    )
    op.add_column("accounts", sa.Column("property_address", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("accounts", "property_address")
    op.drop_column("accounts", "interest_rate")
    op.drop_column("accounts", "account_last_four")
    op.drop_column("accounts", "owner")
    op.drop_column("clients", "insurance_deductibles")
    op.drop_column("clients", "spouse_ssn_last_four")
    op.drop_column("clients", "spouse_date_of_birth")
    op.drop_column("clients", "spouse_name")
    op.drop_column("clients", "ssn_last_four")
    op.drop_column("clients", "date_of_birth")
    account_owner_enum.drop(op.get_bind(), checkfirst=True)
