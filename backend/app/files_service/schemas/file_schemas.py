from pydantic import BaseModel
from datetime import datetime

class FileResponse(BaseModel):
    id: str
    message_id: str
    filename: str
    filepath: str
    file_mime_type: str
    filesize: int
    created_at: datetime



    class Config:
        from_attributes = True


class FileResponse2(BaseModel):
    path: str
    filename: str
    media_type: str



    class Config:
        from_attributes = True