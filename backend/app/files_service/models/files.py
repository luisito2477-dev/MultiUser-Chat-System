from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import String, Integer, ForeignKey, DateTime
import uuid
from datetime import datetime, timezone

from app.database.connection import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())

class FileModel(Base):

    __tablename__ = "files"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        index=True
    )

    message_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    secure_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False

    )

    filepath: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # Tipo de archivo (ej: image/png, application/pdf)
    file_mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    filesize: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    message: Mapped["Message"] = relationship(
        "Message", 
        back_populates="files"
    )