from pydantic import BaseModel, Field
from datetime import datetime
from typing import List
class RoomCreate(BaseModel):
    
    name: str = Field(
        min_length=1,
        max_length=20
    )
    description: str = Field(
        min_length=1,
        max_length=100
    )

class MemberInRoom(BaseModel):
    id: str
    username: str

    class Config:
        from_attributes = True


class RoomResponse(BaseModel):

    id: str

    name: str

    description: str

    owner_id: str

    created_at: datetime

    class Config:
        from_attributes = True

class ExtendedRoomResponse(BaseModel):
    id: str
    name: str
    description: str
    owner_id: str
    owner_username: str  
    is_member: bool     
    current_users_count: int   
    members: List[MemberInRoom] 
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
    