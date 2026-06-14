from pydantic import BaseModel, Field
from datetime import datetime

class RoomCreate(BaseModel):
    
    name: str = Field(
        min_length=1,
        max_length=20
    )
    description: str = Field(
        min_length=1,
        max_length=100
    )


class RoomResponse(BaseModel):

    id: str

    name: str

    description: str

    owner_id: str

    created_at: datetime

    class Config:
        from_attributes = True


class JoinRoomResponse(BaseModel):
    
    status: str

    message: str
    
    room_id: str


class LeaveRoomResponse(BaseModel):

    status: str

    message: str
    