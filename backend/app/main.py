from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth_service.routes.auth_routes import router as auth_router
from app.rooms_service.routes.rooms_routes import router as room_router
from app.message_service.routes.message_routes import router as message_router
from app.files_service.routes.file_routes import router as file_router
from app.database.connection import Base, engine

#Crear tablas automaticamente
Base.metadata.create_all(bind=engine)

app: FastAPI = FastAPI()

# Origenes permitidos
origins = [
    "http://localhost:3000",     
    "http://localhost:5173",   
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Permite solo los origenes de la lista
    allow_credentials=True,          # Permite el envío de cookies/auth headers si se ocupa
    allow_methods=["*"],             # Permite todos los metodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],             # Permite todos los headers (Content-Type, Authorization, etc.)
)

# registrar rutas
app.include_router(auth_router)
app.include_router(room_router)
app.include_router(message_router)
app.include_router(file_router)


@app.get("/")
def home():
    return { "message": "Server working correctly at port 8000" }