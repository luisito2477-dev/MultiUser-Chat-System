import os
from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base

# cargar variables del archivo .env
load_dotenv()

# Construccion de la URL con las variables de entorno
DB_USER : str = os.getenv("DB_USER", "root")
DB_PASSWORD : str = os.getenv("DB_PASSWORD", "")
DB_HOST : str = os.getenv("DB_HOST", "localhost")
DB_PORT : str = os.getenv("DB_PORT", "3306")
DB_NAME : str = os.getenv("DB_NAME", "test_db")

# URL de conexion MySQL
SQLALCHEMY_DATABASE_URL: str = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# crea la conexion entre el codigo y el servidor MySQL
engine : Engine = create_engine(SQLALCHEMY_DATABASE_URL) 

# crea fabrica de sesiones para hacer consultas
# autocommit = False : evita que los cambios se guarden solos
# autoflush = False : Evita que SQLAlchemy envie cambios a la base de datos
SessionLocal : sessionmaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base. todos los modelos heredaran de esta clase para que SQLAlchemy los reconozca
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Crea y cierra una sesion de base de datos por peticion
    """
    db: Session = SessionLocal()
    try:
        yield db # entrega la sesion a la ruta que se pidio
    finally:
        db.close()

