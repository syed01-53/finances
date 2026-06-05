"""PRD completion: SACS roles and cash balances

Revision ID: 006_prd_completion
Revises: 005_marital_status
Create Date: 2026-06-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006_prd_completion"
down_revision: Union[str, Sequence[str], None] = "005_marital_status"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

sacs_role_enum = sa.Enum(
    "none",
    "private_reserve",
    "investment",
    name="sacs_role_enum",
)


def upgrade() -> None:
    sacs_role_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "accounts",
        sa.Column(
            "sacs_role",
            sacs_role_enum,
            nullable=False,
            server_default="none",
        ),
    )
    op.alter_column("accounts", "sacs_role", server_default=None)
    op.add_column(
        "balances",
        sa.Column("cash_amount", sa.Numeric(14, 2), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("balances", "cash_amount")
    op.drop_column("accounts", "sacs_role")
    sacs_role_enum.drop(op.get_bind(), checkfirst=True)
