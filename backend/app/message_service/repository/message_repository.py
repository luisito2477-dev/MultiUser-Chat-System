from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, Select, Result
from typing import Sequence, Any

from app.message_service.models.messages import Message
from app.message_service.schemas.message_schemas import MessageCreate
from app.auth_service.models.users import User


def create_new_message(user: User, message_data: MessageCreate, db: Session) -> Message:
    """
    Funcion para crear un nuevo mensaje en la base de datos
    """

    db_message: Message = Message(
        room_id=message_data.room_id,
        user_id=user.id,
        message_type=message_data.message_type,
        content=message_data.content
    )

    db.add(db_message)

    db.commit()

    db.refresh(db_message)

    return db_message





def get_messages_from_room(room_id: str, db: Session, page: int, limit: int) -> Sequence[Message]:
    """
    Funcion para obtener todos los mensajes de una sala
    """
    offset: int = (page - 1) * limit
    statement: Select = (
        select(Message)
        .options(joinedload(Message.user)) #  Carga los datos del usuario 
        .where(Message.room_id == room_id)
        .order_by(Message.created_at.desc()) 
        .offset(offset)
        .limit(limit)
    )

    

    result: Result[Any] = db.execute(statement)

    return result.scalars().all()




def delete_message():
    """
    Funcion para borrar un mensaje
    """