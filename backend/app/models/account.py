import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AccountType(str, enum.Enum):
    IRA = "ira"
    ROTH_IRA = "roth_ira"
    K401 = "401k"
    PENSION = "pension"
    BROKERAGE = "brokerage"
    TRUST = "trust"
    MORTGAGE = "mortgage"
    AUTO_LOAN = "auto_loan"


class AccountOwner(str, enum.Enum):
    CLIENT_1 = "client_1"
    CLIENT_2 = "client_2"
    JOINT = "joint"


class SacsRole(str, enum.Enum):
    NONE = "none"
    PRIVATE_RESERVE = "private_reserve"
    INVESTMENT = "investment"


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_type: Mapped[AccountType] = mapped_column(
        Enum(
            AccountType,
            name="account_type_enum",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )
    owner: Mapped[AccountOwner] = mapped_column(
        Enum(
            AccountOwner,
            name="account_owner_enum",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=AccountOwner.CLIENT_1,
    )
    institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    account_last_four: Mapped[str | None] = mapped_column(String(4), nullable=True)
    interest_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    property_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sacs_role: Mapped[SacsRole] = mapped_column(
        Enum(
            SacsRole,
            name="sacs_role_enum",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=SacsRole.NONE,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    client: Mapped["Client"] = relationship("Client", back_populates="accounts")
    balances: Mapped[list["Balance"]] = relationship(
        "Balance", back_populates="account", cascade="all, delete-orphan"
    )
