import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    ssn: Mapped[str | None] = mapped_column(String(11), nullable=True)
    is_married: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    spouse_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    spouse_date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    spouse_ssn: Mapped[str | None] = mapped_column(String(11), nullable=True)
    salary: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    expense_budget: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=0
    )
    insurance_deductibles: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=0
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    accounts: Mapped[list["Account"]] = relationship(
        "Account", back_populates="client", cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship(
        "Report", back_populates="client", cascade="all, delete-orphan"
    )
