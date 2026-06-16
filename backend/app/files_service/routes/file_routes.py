from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Final, Optional
from fastapi.responses import FileResponse as FileResponseFastAPI

from app.database.connection import  get_db
from app.auth_service.dependencies.auth_dependencies import get_current_user
from app.files_service.utils.file_utils import save_file_in_system
from app.files_service.repository.file_repository import save_file_metadata, get_file_metadata
from app.message_service.repository.message_repository import get_message_by_id
from app.message_service.managers.websocket_manager import manager
from app.files_service.schemas.file_schemas import FileResponse
from app.auth_service.models.users import User
from app.files_service.models.files import FileModel
from app.message_service.models.messages import Message
import os
router = APIRouter(
    prefix="/files", 
    tags=["files"],
    # dependencies=[Depends(get_current_user)]
)


@router.post("/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile = File(...),
    message_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint para subir un archivo al sistema
    """
    # Validacion del tamano del archivo

    # Limite de 10 MB para el tamano del archivo
    MAX_FILE_SIZE: Final[int] = 10 * 1024 * 1024

    # Leyendo el tamano del archivo real del objeto que llego al server
    file_size: int = file.size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds the max limit of 10 MB."
        )
    
    # Validacion del tipo de archivo
    allowed_types: Final[list[str]] = ["image/jpeg", "image/png", "application/pdf", "text/plain"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed."
        )
    
    # Guardar el archivo en el sistema. Si funciono, recibimos metadatos
    file_metadata: dict = await save_file_in_system(file)

    new_file: FileModel = save_file_metadata(file_metadata, message_id, db)

    msg: Optional[Message] = get_message_by_id(message_id, db)
    
    if msg:
        # 3. Mandar la actualización del payload por WebSocket con los datos reales del archivo
        websocket_payload = {
            "id": msg.id,
            "room_id": msg.room_id,
            "user_id": msg.user_id,
            "message_type": "FILE",
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
            "username": current_user.username,
            "file_info": {
                "id": new_file.id,
                "filename": new_file.filename,
                "content_type": new_file.file_mime_type,
                "file_size": new_file.filesize
            }
        }
        
        # Le avisamos a la sala que el payload del archivo ya está completo en el storage
        await manager.broadcast_to_room(room_id=msg.room_id, message_data=websocket_payload)

    return new_file


@router.get("/download/{file_id}")
def download_file(file_id: str, db: Session = Depends(get_db)):
    # 1. Buscamos los metadatos en la base de datos
    file_metadata = get_file_metadata(file_id, db) # Tu función que ya jala
    
    if not file_metadata:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File node not found in database")

    # 2. Obtenemos la ruta fisica del archivo en el servidor
    # Ojo: Tu JSON dice: "static/uploads\\ddbe98d4-788c-4f69-91b2-c2a6c279347b.txt"
    file_path = file_metadata.filepath 

    #  Verificamos que el archivo de verdad exista físicamente en el disco
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file missing on server storage")

    #  LE ESCUPIMOS EL BINARIO REAL AL NAVEGADOR
    return FileResponseFastAPI(
        path=file_path, 
        filename=file_metadata.filename, # El nombre original que verá el usuario al guardar (test1.txt)
        media_type=file_metadata.file_mime_type # El tipo de contenido (text/plain)
    )




