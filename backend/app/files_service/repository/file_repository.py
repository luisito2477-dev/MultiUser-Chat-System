from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, Select, Result
from typing import Any, Optional

from app.files_service.models.files import FileModel
from app.message_service.models.messages import Message


def save_file_metadata(metadata: dict, message_id: str, db: Session) -> FileModel:
    db_file = FileModel(
        message_id=message_id,
        filename=metadata["filename"],
        secure_filename=metadata["secure_filename"],
        filepath=metadata["filepath"],
        file_mime_type=metadata["file_mime_type"],
        filesize=metadata["filesize"]
    )

    db.add(db_file)

    db.commit()
    
    db.refresh(db_file)

    return db_file

def get_file_metadata(file_id: str, db: Session) -> Optional[FileModel]:
    statement = select(FileModel).where(FileModel.id == file_id)
    
    result = db.execute(statement)

    return result.scalar_one_or_none()