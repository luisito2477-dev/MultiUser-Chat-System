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

    # Relacion a el dueno de la sala
    owner: Mapped["User"] = relationship(
        "User", 
        foreign_keys=[owner_id],
        lazy="raise" # Evita N+1 inesperados
    )

    # Relacion a los miembros de la sala
    members: Mapped[List["User"]] = relationship(
        "User",
        secondary="room_members",
        back_populates="joined_rooms",
        lazy="raise" # Levantara error si no se pide explícitamente en el query (buena práctica)
    )




