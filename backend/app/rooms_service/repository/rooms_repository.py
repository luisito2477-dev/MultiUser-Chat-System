from sqlalchemy.orm import Session, aliased, joinedload, selectinload
from sqlalchemy.orm._orm_constructors import AliasedType
from sqlalchemy import select, case, Select, Result, delete, func, exists
from typing import Any, Optional, Sequence, Dict, List

from app.database.connection import get_db
from app.rooms_service.models.rooms import Room
from app.rooms_service.models.room_members import RoomMember
from app.rooms_service.schemas.rooms_schemas import RoomCreate
from app.auth_service.models.users import User


def get_all_rooms(current_user: User, db: Session, page: int, limit: int) -> List[Dict[str, Any]]:
    """
    Obtiene todas las salas que hay en el sistema con metadatos extendidos:
    Username del owner, Lista de Miembros y Conteo Total
    """

    # Paginacion
    offset: int = (page - 1) * limit

    
    # Subquery para contar miembros
    member_count_subquery: Select = (
        select(
            RoomMember.room_id,
            func.count(RoomMember.user_id).label("total_members")
        )
        .group_by(RoomMember.room_id)
        .subquery()
    )

    # Verifica si el usuario actual es miembro de LA sala evaluada
    is_member_condition = exists().where(
        RoomMember.room_id == Room.id,
        RoomMember.user_id == current_user.id
    )

    # Construccion del query principal
    statement: Select = (
        select(
            Room,
            # Si no hay miembros guardados, coalesce forza 0 en vez de null
            func.coalesce(member_count_subquery.c.total_members, 0).label("current_users_count"),
            # Aplicando la condicional para verificar que es miembro
            case(
                (is_member_condition, True),
                else_=False
            ).label("is_member")
        )
        # Traemos al dueno
        .options(joinedload(Room.owner))
        .outerjoin(member_count_subquery, Room.id == member_count_subquery.c.room_id)
        .order_by(Room.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    result: Result[Any] = db.execute(statement)

    extended_rooms = []

    for row in result.all():
        room_obj: Room = row.Room
        current_users_count: int = row.current_users_count
        is_member: bool = row.is_member

        # obtener los datos de los miembros
        members_statement: Select = (
            select(User)
            .join(RoomMember, RoomMember.user_id == User.id)
            .where(RoomMember.room_id == room_obj.id)
        )
        all_members: Sequence[User] = db.execute(members_statement).scalars().all()

        # obtener el numero total de salas

        extended_rooms.append({
            "id": room_obj.id,
            "name": room_obj.name,
            "description": room_obj.description,
            "owner_id": room_obj.owner_id,
            "owner_username": room_obj.owner.username,
            "is_member": is_member,
            "current_users_count": current_users_count, 
            "members": list(all_members),               
            "created_at": room_obj.created_at
        })

    return extended_rooms
    


def get_rooms_by_userid(current_user: User, db: Session, page: int, limit: int) -> List[Dict[str, Any]]:
    """
    Obtiene unicamente las salas que pertenece el usuario actual
    """
    # Paginacion
    offset: int = (page - 1) * limit

    
    # Subquery para contar miembros
    member_count_subquery: Select = (
        select(
            RoomMember.room_id,
            func.count(RoomMember.user_id).label("total_members")
        )
        .group_by(RoomMember.room_id)
        .subquery()
    )

    # Construccion del query principal
    statement: Select = (
        select(
            Room,
            # Si no hay miembros guardados, coalesce forza 0 en vez de null
            func.coalesce(member_count_subquery.c.total_members, 0).label("current_users_count"),
        )
        # Traemos al dueno
        .options(joinedload(Room.owner))
        .join(RoomMember, Room.id == RoomMember.room_id)
        .outerjoin(member_count_subquery, Room.id == member_count_subquery.c.room_id)
        .where(RoomMember.user_id == current_user.id)
        .order_by(Room.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    result: Result[Any] = db.execute(statement)

    extended_rooms = []

    for row in result.all():
        room_obj: Room = row.Room
        current_users_count: int = row.current_users_count

        members_statement: Select = (
            select(User)
            .join(RoomMember, RoomMember.user_id == User.id)
            .where(RoomMember.room_id == room_obj.id)
        )
        all_members: Sequence[User] = db.execute(members_statement).scalars().all()

        extended_rooms.append({
            "id": room_obj.id,
            "name": room_obj.name,
            "description": room_obj.description,
            "owner_id": room_obj.owner_id,
            "owner_username": room_obj.owner.username,
            "is_member": True,
            "current_users_count": current_users_count, 
            "members": list(all_members),               
            "created_at": room_obj.created_at
        })

    return extended_rooms


def get_room_by_id(db: Session, room_id) -> Optional[Room]:

    statement: Select = (
        select(Room)
        .where(Room.id == room_id)
    )

    result: Result[Any] = db.execute(statement)

    return result.scalar_one_or_none()


def get_room_by_id_extended(current_user: User, db: Session, room_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene una sala por su id
    """
    # 1. Subquery para contar miembros de esta sala
    member_count_subquery = (
        select(
            RoomMember.room_id,
            func.count(RoomMember.user_id).label("total_members")
        )
        .where(RoomMember.room_id == room_id) # Filtro rápido por ID de sala
        .group_by(RoomMember.room_id)
        .subquery()
    )

    # 2. Condición para saber si el usuario actual es miembro
    is_member_condition = exists().where(
        RoomMember.room_id == Room.id,
        RoomMember.user_id == current_user.id
    )

    # 3. Query Maestro para la sala específica
    statement = (
        select(
            Room,
            func.coalesce(member_count_subquery.c.total_members, 0).label("current_users_count"),
            case(
                (is_member_condition, True),
                else_=False
            ).label("is_member")
        )
        .options(joinedload(Room.owner))        
        .outerjoin(member_count_subquery, Room.id == member_count_subquery.c.room_id)
        .where(Room.id == room_id)             
    )

    result: Result[Any] = db.execute(statement)
    
    # .one_or_none() devuelve la fila (Room, count, is_member) o None si el ID no existe
    row = result.one_or_none()
    
    if not row:
        return None

    room_obj: Room = row.Room
    current_users_count: int = row.current_users_count
    is_member: bool = row.is_member

    members_statement: Select = (
            select(User)
            .join(RoomMember, RoomMember.user_id == User.id)
            .where(RoomMember.room_id == room_obj.id)
        )
    all_members: Sequence[User] = db.execute(members_statement).scalars().all()

    # Mapeamos al diccionario plano que Pydantic devorará felizmente
    return {
        "id": room_obj.id,
        "name": room_obj.name,
        "description": room_obj.description,
        "owner_id": room_obj.owner_id,
        "owner_username": room_obj.owner.username,
        "current_users_count": current_users_count,
        "is_member": is_member,
        "members": list(all_members),
        "created_at": room_obj.created_at
    }


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




