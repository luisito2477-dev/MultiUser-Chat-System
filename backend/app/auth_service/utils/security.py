from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Final, Any
import os
from dotenv import load_dotenv

# Cargamos variables de entorno
load_dotenv()

SECRET_KEY: Final[str] = os.getenv("SECRET_KEY_AUTH")
ALGORITHM: Final[str] = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: Final[int] = 120

# Objeto que administra algoritmos
pwd_context: CryptContext = CryptContext(
    schemes=["bcrypt"],  # algoritmos permitidos
    deprecated="auto"
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Hashea plain_password, compara con hashed_password, y devuelve
    true o false dependiendo de si son iguales o no
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hashea y retorna la contrasena recibida
    """

    return pwd_context.hash(password)


def create_access_token(
        data: dict[str, Any], # ejemplo: { "sub": "Luisito", "user_id": 15 }
        expires_delta: timedelta | None = None
) -> str:
    
    # copiamos diccionario/JSON original
    to_encode: dict[str, Any] = data.copy()

    expire: datetime
    # calculo de hora de expiracion
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = (
            datetime.now(timezone.utc) 
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

    #agregamos hora de expiracion
    to_encode.update({ "exp": expire })

    # obtenemos token jwt
    encoded_jwt: str = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt