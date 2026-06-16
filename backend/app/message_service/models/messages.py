from enum import Enum
import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Text, DateTime
from sqlalchemy import Enum as SQLAlchemyEnum
from datetime import datetime, timezone
from typing import List

from app.database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())


class MessageType(Enum):
    TEXT = "TEXT"
    FILE = "FILE"
    SYSTEM = "SYSTEM"
    

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=generate_uuid, 
        index=True
    )

    room_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("rooms.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # native_enum=True le dice a SQLAlchemy que use el tipo ENUM nativo de MySQL.
    message_type: Mapped[MessageType] = mapped_column(
        SQLAlchemyEnum(MessageType, native_enum=True),
        default=MessageType.TEXT,
        nullable=False
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user: Mapped[List["User"]] = relationship(
        "User", 
        back_populates="messages", 
        lazy="raise"
    )

    files: Mapped[list["FileModel"]] = relationship(
        "FileModel", 
        back_populates="message", 
        uselist=False,
        lazy="raise"
    )
