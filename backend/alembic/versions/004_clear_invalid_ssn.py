"""Clear legacy 4-digit SSN values

Revision ID: 004_clear_invalid_ssn
Revises: 003_ssn_fields
Create Date: 2026-06-05

"""
from typing import Sequence, Union

from alembic import op

revision: str = "004_clear_invalid_ssn"
down_revision: Union[str, Sequence[str], None] = "003_ssn_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE clients
        SET ssn = NULL
        WHERE ssn IS NOT NULL
          AND length(regexp_replace(ssn, '[^0-9]', '', 'g')) <> 9
        """
    )
    op.execute(
        """
        UPDATE clients
        SET spouse_ssn = NULL
        WHERE spouse_ssn IS NOT NULL
          AND length(regexp_replace(spouse_ssn, '[^0-9]', '', 'g')) <> 9
        """
    )


def downgrade() -> None:
    pass
