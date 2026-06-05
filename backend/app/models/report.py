import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        UniqueConstraint("client_id", "year", "quarter", name="uq_client_year_quarter"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    quarter: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    client: Mapped["Client"] = relationship("Client", back_populates="reports")
    balances: Mapped[list["Balance"]] = relationship(
        "Balance", back_populates="report", cascade="all, delete-orphan"
    )
