from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.auth_service.dependencies.auth_dependencies import get_current_user
from app.auth_service.models.users import User
from app.message_service.schemas.message_schemas import MessageCreate, MessageResponse, CreateMessageResponse
from app.rooms_service.models.rooms import Room
from app.rooms_service.models.room_members import RoomMember
from app.rooms_service.repository.rooms_repository import get_room_by_id, get_room_member
from app.message_service.repository.message_repository import create_new_message
from app.message_service.models.messages import Message
from app.message_service.managers.websocket_manager import manager
from app.database.connection import get_db


router: APIRouter = APIRouter(
    prefix="/messages", 
    tags=["messages"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/", response_model=CreateMessageResponse)
def create_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para Crear un nuevo mensaje escrito por el usuario actual
    """

    # verificar que el room exista
    room: Optional[Room] = get_room_by_id(db, message_data.room_id)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room not found"
        )

    # verificar que el usuario este en la sala
    room_member: Optional[RoomMember] = get_room_member(current_user, message_data.room_id, db)
    
    if room_member is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this room"
        )
    
    # Guardar en la DB
    new_message: Message = create_new_message(current_user, message_data, db)

    # Notificar a todos por Websocket
    websocket_payload: dict = {
        "id": new_message.id,
        "room_id": new_message.room_id,
        "user_id": new_message.user_id,
        "message_type": new_message.message_type,
        "content": new_message.content,
        "created_at": new_message.created_at.isoformat(),
        "username": current_user.username
    }

    # Disparando el broadcast asincrono
    await manager.

    return CreateMessageResponse(
        status="Success",
        message="Message received succesfully",
        message_id=new_message.id
    )


    


@router.delete("/{message_id}")
def delete_message():
    """
    Endpoint para eliminar un mensaje del usuario
    """