import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

def generate_uuid() -> str:
    """Genera un UUID único en formato string de 36 caracteres."""
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=generate_uuid, 
        index=True
    )

    username: Mapped[str] = mapped_column(
        String(30), 
        unique=True, 
        index=True, 
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    password: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    messages: Mapped[List["Message"]] = relationship(
        "Message", 
        back_populates="user", 
        cascade="all, delete-orphan" # Si se borra un usuario, se borran sus mensajes
    )

    # Salas de las que es dueno
    owned_rooms: Mapped[List["Room"]] = relationship(
        "Room", 
        back_populates="owner", 
        cascade="all, delete-orphan" # Si se borra un usuario, se borran sus mensajes
    )

    # Salas de las que es miembro
    joined_rooms: Mapped[List["Room"]] = relationship(
        "Room",
        secondary="room_members",
        back_populates="members"
    )