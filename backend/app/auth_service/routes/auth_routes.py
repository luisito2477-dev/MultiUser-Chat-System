from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db

from app.auth_service.dependencies.auth_dependencies import authenticate_user, get_user, get_current_user
from app.auth_service.models.token import Token
from app.auth_service.models.users import User
from app.auth_service.utils.security import create_access_token, get_password_hash
from app.auth_service.schemas.users_schemas import UserResponse, UserCreate
from app.rooms_service.repository.rooms_repository import get_room_by_id, join_a_room


router: APIRouter = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> None:
    """
    Endpoint para iniciar sesion
    """
    user: User | None = authenticate_user(
        db, 
        form_data.username, 
        form_data.password
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={ "WWW-Authenticate": "Bearer" }
        )
    
    data = {
        "sub": user.username,
        "user_id": user.id
    }

    access_token: str = create_access_token(data=data)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para registrar usuario por primera vez
    """
    db_user: User | None = get_user(db, username=user.username)

    # Si ya existe el usuario devolvemos error
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    hashed_password: str = get_password_hash(user.password)

    db_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    MAIN_ROOM_ID: str = "b74dfe9c-3267-4d5a-a463-9ed6e0d44921"

    print("userId: "+ db_user.id)
    # anadir el usuario a la sala principal de forma automatica
    general_room = get_room_by_id(db, MAIN_ROOM_ID)
    
    if general_room:
        print("Ejecutando join_a_room")
        join_a_room(user=db_user, room_id=MAIN_ROOM_ID, db=db)

    return db_user


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user