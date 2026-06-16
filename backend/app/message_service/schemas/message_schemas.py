from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

from app.message_service.models.messages import MessageType


class FileNestedResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    file_size: int

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):

    room_id: str
    
    message_type: MessageType = Field(
        default=MessageType.TEXT, 
        description="Tipo de mensaje: TEXT, FILE o SYSTEM"
        )
    
    content: str = Field(
        min_length=1
    )
   


class MessageResponse(BaseModel):

    id: str
    user_id: str
    username: Optional[str]
    room_id: str
    message_type: MessageType
    content: str
    created_at: datetime


    file_info: Optional[FileNestedResponse] = None

    

    class Config:

        from_attributes = True


class CreateMessageResponse(BaseModel):

    status: str
    message: str
    message_id: str