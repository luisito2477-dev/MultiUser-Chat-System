from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Any

import app.auth_service.utils.security as security_utils
from app.auth_service.models.token import TokenData
from app.auth_service.models.users import User
from app.database.connection import get_db

# Extraemos el bearer token
oauth2_scheme: OAuth2PasswordBearer = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_user(db: Session, username: str) -> User | None:
    """
    Funcion para buscar un usuario en la base de datos
    """
    return db.query(User).filter(User.username == username).first()


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    """
    Funcion para autenticar el usuario, si el usuario no existe o la contrasena
    es incorrecta, devolvera False, en caso contrario, devolvera el objeto Usuario
    """

    # Obtenemos usuario
    user: User | None = get_user(db, username)

    # Si no hay usuario o el password esta mal, devolvemos None
    if not user:
        return None
    if not security_utils.verify_password(password, user.password):
        return None
    
    return user

    

def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme)
) -> User:
    """
    Funcion para identificar al usuario autenticado a partir del JWT
    """
    
    credentials_exception: HTTPException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}    
    )

    try:
        # Obteniendo payload. Ex { "sub": "luisito", "user_id": 14 }
        payload: dict[str, Any] = jwt.decode(
            token,
            security_utils.SECRET_KEY,
            algorithms=[security_utils.ALGORITHM]
        )

        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception
        
        token_data: TokenData = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None: 
        raise credentials_exception
    return user


