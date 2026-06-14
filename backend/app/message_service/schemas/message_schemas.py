from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

from app.message_service.models.messages import MessageType


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

    

    class Config:

        from_attributes = True


class CreateMessageResponse(BaseModel):

    status: str
    message: str
    message_id: str