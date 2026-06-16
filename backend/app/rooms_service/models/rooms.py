import uuid
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

from app.database.connection import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        nullable=False,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(100)
    )

    owner_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped[List["User"]] = relationship(
        "User", 
        back_populates="rooms", 
        lazy="raise"
    )


