from sqlalchemy.orm import Session
from sqlalchemy import select, Select, Result, delete
from typing import Any, Optional, Sequence

from app.database.connection import get_db
from app.rooms_service.models.rooms import Room
from app.rooms_service.models.room_members import RoomMember
from app.rooms_service.schemas.rooms_schemas import RoomCreate
from app.auth_service.models.users import User


def get_all_rooms(db: Session, page: int, limit: int) -> Sequence[Room]:
    """
    Obtiene todas las salas que hay en el sistema
    """

    # Paginacion
    offset: int = (page - 1) * limit

    statement: Select = (
        select(Room)
        .order_by(Room.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    result: Result[Any] = db.execute(statement)

    # scalars().all() devuelve una Sequence de objetos Room
    return result.scalars().all()
    


def get_rooms_by_userid(user: User, db: Session, page: int, limit: int) -> Sequence[Room]:
    """
    Obtiene unicamente las salas que pertenece el usuario actual
    """
    offset: int = (page - 1) * limit

    statement: Select = (
        select(Room)
        .join(RoomMember, Room.id == RoomMember.room_id)
        .where(RoomMember.user_id == user.id)
        .order_by(Room.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    result: Result[Any] = db.execute(statement)

    return result.scalars().all()


def get_room_by_id(db: Session, room_id: str) -> Optional[Room]:
    """
    Obtiene una sala por su id
    """
    statement: Select = (
        select(Room)
        .where(Room.id == room_id)
    )

    result: Result[Any] = db.execute(statement)
    
    # .scalar_one_or_none() extrae el primer registro o regresa None si está vacío
    return result.scalar_one_or_none()


def get_members(db: Session, room_id: str, page: int, limit: int) -> Sequence[User]:
    """
    Obtiene los Usuarios que pertenecen a una sala especifica
    """

    offset: int = (page - 1) * limit

    statement: Select = (
        select(User)
        .join(RoomMember, User.id == RoomMember.user_id)
        .where(room_id == RoomMember.room_id)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    result: Result[Any] = db.execute(statement)

    return result.scalars().all()


def get_room_member(user: User, room_id: str, db: Session) -> Optional[RoomMember]:
    """
    Verifica que el usuario pertenezca a la sala
    """
    statement: Select = (
        select(RoomMember)
        .where(RoomMember.room_id == room_id, RoomMember.user_id == user.id)
    )

    result: Result[Any] = db.execute(statement)

    return result.scalar_one_or_none()


def create_new_room(user: User, room_data: RoomCreate, db: Session) -> Room:
    """
    Crea una sala nueva, usando el id de usuario como owner de la sala
    """
    # Creando la instancia del modelo ORM 
    db_room: Room = Room(
        name=room_data.name,
        description=room_data.description,
        owner_id=user.id 
    )

    # Anadiendo el objeto a la sesion actual
    db.add(db_room)

    # Hacemos commit para que se guarde en el mySQL
    db.commit()

    # Refrescamos la instancia
    # Esto obliga a SQLAlchemy a volver a leer el registro desde MySQL 
    # para traer los campos que se generaron alla de forma automática (id, created_at)
    db.refresh(db_room)

    # Retornamos el objeto Room tipado, listo para que el router lo escupa como JSON
    return db_room

def join_a_room(user: User, room_id: str, db: Session) -> None:
    """
    Permite al usuario actual unirse a una sala
    """
    db_room_member: RoomMember = RoomMember(
        room_id=room_id,
        user_id=user.id
    )

    db.add(db_room_member)

    db.commit()

    db.refresh(db_room_member)



def leave_a_room(user: User, room_id: str, db: Session) -> None:
    """
    Permite que el usuario actual abandone una sala usando una sentencia explicita.
    """
    # Armamos la sentencia DELETE de SQLAlchemy 2.0
    statement = (
        delete(RoomMember)
        .where(RoomMember.room_id == room_id, RoomMember.user_id == user.id)
    )
    
    # La ejecutamos directamente en la sesion
    db.execute(statement)
    
    # Guardamos los cambios en MySQL
    db.commit()



def leave_a_room_by_object(room_member: RoomMember, db: Session) -> None:
    """
    Elimina un registro de RoomMember directamente usando su instancia ORM.
    """
    # Le decimos a la sesion que elimine este objeto de la BD
    db.delete(room_member)
    
    # 2. Confirmamos los cambios en MySQL 
    db.commit()




