from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List, Sequence, Dict, Any

from app.rooms_service.schemas.rooms_schemas import RoomCreate, RoomResponse, JoinRoomResponse, LeaveRoomResponse, ExtendedRoomResponse
from app.auth_service.schemas.users_schemas import UserResponse
from app.database.connection import get_db
from app.auth_service.dependencies.auth_dependencies import get_current_user
from app.auth_service.models.users import User
from app.rooms_service.models.rooms import Room
from app.rooms_service.models.room_members import RoomMember
from app.rooms_service.repository.rooms_repository import (
    get_all_rooms,
    get_rooms_by_userid,
    get_room_by_id,
    get_members, 
    create_new_room, 
    join_a_room,
    get_room_member,
    leave_a_room_by_object, 
    get_room_by_id_extended
)
from app.message_service.repository.message_repository import get_messages_from_room, create_new_message
from app.message_service.schemas.message_schemas import MessageResponse, MessageCreate, FileNestedResponse
from app.message_service.models.messages import MessageType, Message
from app.message_service.managers.websocket_manager import manager
router: APIRouter = APIRouter(
    prefix="/rooms", 
    tags=["rooms"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/", response_model=List[ExtendedRoomResponse])
def get_rooms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=20)
):
    """
    Endpoint para obtener todas las salas disponibles en la plataforma
    """
    

    return get_all_rooms(current_user, db, page, limit)

@router.get("/me", response_model=List[ExtendedRoomResponse])
def get_rooms_by_user(
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=10),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint para obtener todas las salas a las que pertenece el Usuario
    """
    return get_rooms_by_userid(current_user, db, page, limit)

    
    


@router.get("/{room_id}", response_model=ExtendedRoomResponse)
def get_single_room(
    room_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    
):
    """
    Endpoint para obtener una sala por su id
    """
    room: Optional[Dict[str, Any]] = get_room_by_id_extended(current_user, db, room_id)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room has not been found"
        )
    
    return room


@router.get("/{room_id}/members", response_model=List[UserResponse])
def get_room_members(
    room_id: str,
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=20)
):
    """
    Endpoint para obtener todos los miembros de una sala
    """
    room: Optional[Room] = get_room_by_id(db, room_id)
    if room is None:
        raise HTTPException(
            status_code=404, 
            detail="Room not found"
        )
    
    return get_members(db, room_id, page, limit)


@router.post("/", response_model=RoomResponse)
def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    
):
    """
    Endpoint para crear una sala
    """
    # Creando la sala
    new_room: Room = create_new_room(current_user, room_data, db)

    # Uniendo el usuario a la sala automaticamente
    join_a_room(current_user, new_room.id, db)
    return new_room


@router.post("/{room_id}/join", response_model=JoinRoomResponse)
async def join_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Endpoint para unirse a una sala"""
    # Validamos que la sala exista
    room: Optional[Room] = get_room_by_id(db, room_id)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Room not found"
        )
    
    # Validamos que el usuario aun no este en la sala
    room_member: Optional[RoomMember] = get_room_member(current_user, room_id, db) 
    if room_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this room."
        )
    
    join_a_room(current_user, room_id, db)

    # Creamos mensaje de Sistema
    message_data: MessageCreate = MessageCreate(
        room_id=room_id,
        message_type=MessageType.SYSTEM,
        content=f"{current_user.username} has joined the room {room.name}"
    )
    new_message: Message = create_new_message(current_user, message_data, db)

    # Notificar a todos por Websocket
    websocket_payload: dict = {
        "id": new_message.id,
        "room_id": new_message.room_id,
        "user_id": new_message.user_id,
        "message_type": new_message.message_type.value if hasattr(new_message.message_type, 'value') else str(new_message.message_type),
        "content": new_message.content,
        "created_at": new_message.created_at.isoformat(),
        "username": current_user.username
    }

    # Disparando el broadcast asincrono
    await manager.broadcast_to_room(
        room_id=new_message.room_id,
        message_data=websocket_payload
    )

    return JoinRoomResponse(
        status="Success",
        message="User has joined the room successfully",
        room_id=room_id
    )
    


@router.delete("/{room_id}/leave", response_model=LeaveRoomResponse)
async def leave_room(
    room_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para abandonar una sala
    """

    # Validamos que la sala exista
    room: Optional[Room] = get_room_by_id(db, room_id)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Room not found"
        )
    
    print("Se paso validacion de que existe la sala")
    
    # Validamos que el usuario aun este en la sala
    room_member: Optional[RoomMember] = get_room_member(current_user, room_id, db) 
    if room_member is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this room."
        )
    
    leave_a_room_by_object(room_member, db)

    # Creamos mensaje de Sistema
    message_data: MessageCreate = MessageCreate(
        room_id=room_id,
        message_type=MessageType.SYSTEM,
        content=f"{current_user.username} has left the room {room.name}"
    )

    new_message: Message = create_new_message(current_user, message_data, db)

    # Notificar a todos por Websocket
    websocket_payload: dict = {
        "id": new_message.id,
        "room_id": new_message.room_id,
        "user_id": new_message.user_id,
        "message_type": new_message.message_type.value if hasattr(new_message.message_type, 'value') else str(new_message.message_type),
        "content": new_message.content,
        "created_at": new_message.created_at.isoformat(),
        "username": current_user.username
    }

    # Disparando el broadcast asincrono
    await manager.broadcast_to_room(
        room_id=new_message.room_id,
        message_data=websocket_payload
    )

    return LeaveRoomResponse(
        status="Success",
        message="User has left the room successfully"
    )


@router.get("/{room_id}/messages", response_model=List[MessageResponse])
def get_room_messages(
    room_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=50)
):
    """
    Endpoint para obtener los mensajes de una sala
    """
    # Verificar que la sala exista
    room: Optional[Room] = get_room_by_id(db, room_id)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    # Verificar que el usuario pertenezca a esa sala
    room_member: Optional[RoomMember] = get_room_member(current_user, room_id, db)
    if room_member is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this room."
        )

    db_messages = get_messages_from_room(room_id, db, page, limit)

    
    # Mapeando manualmente al esquema 
    return [
        MessageResponse(
            id=msg.id,
            room_id=msg.room_id,
            user_id=msg.user_id,
            message_type=msg.message_type,
            content=msg.content,
            created_at=msg.created_at,
            username=msg.user.username,

            file_info=FileNestedResponse(
            id=msg.files.id,
            filename=msg.files.filename,
            content_type=msg.files.file_mime_type,
            file_size=msg.files.filesize
        ) if msg.files else None 
        )
        for msg in db_messages
    ]
    

    
    
    
