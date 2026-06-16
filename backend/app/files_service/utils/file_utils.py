from fastapi import UploadFile
from typing import Final
import uuid
import os

async def save_file_in_system(file: UploadFile) -> dict:
    """
    Funcion para guardar un archivo fisico en la carpeta local
    Retorna True si se guardo el archivo
    Retorna False si ocurrio algun error
    """

    UPLOAD_DIR: Final[str] = "static/uploads"

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    original_filename = file.filename
    file_extension: str = os.path.splitext(original_filename)[1]

    # Creando un nombre de archivo seguro con uuid para que no se repita
    unique_filename: str = generate_unique_filename(file_extension)

    # Path donde se va a guardar el archivo
    file_path: str = generate_filepath(UPLOAD_DIR, unique_filename)

    # Guardando el archivo en la carpeta local
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    metadata: dict = {
        "filename": original_filename,
        "secure_filename": unique_filename,
        "filepath": f"{file_path}",
        "file_mime_type": file.content_type,
        "filesize": file.size
    }
    return metadata


    





def generate_unique_filename(file_extension: str) -> str:
    """
    Genera un nombre unico para el archivo que se va aguardar
    """
    return f"{uuid.uuid4()}{file_extension}"


def generate_filepath(upload_dir: str, filename: str) -> str:
    """
    Genera el path en donde se va a guardar el archivo
    """
    return os.path.join(upload_dir, filename)


