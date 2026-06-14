from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    
    def __init__(self):

        # Diccionario que mapea: { room_id: [websocket1, websocket2, ...] }
        self.active_connections: Dict[str, List[WebSocket]] = {}


    async def connect(self, websocket: WebSocket, room_id: str):
        """
        Acepta la conexion y une al usuario a una sala especifica
        """
        await websocket.accept()

        # Si la sala no existe en el diccionario, la creamos vacia
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []

        # anadimos el socket a la lista de esa sala
        self.active_connections[room_id].append(websocket)

        
    def disconnect(self, websocket: WebSocket, room_id: str):
        """
        Quita el socket de la sala cuando el cliente se desconecta
        """

        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)

            # Si la sala esta vacia, la borramos para liberar espacio
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]


    async def broadcast_to_room(self, room_id: str, message_data: dict):
        """
        Envia un mensaje en JSON a todos los usuarios conectados a una
        sala especifica de forma asincrona (no bloqueante)
        """
        if room_id in self.active_connections:

            for connection in self.active_connections[room_id]:
                try:
                    # Enviando el message_data convertido a json
                    await connection.send_text(json.dumps(message_data))
                except Exception:
                    # Si un socket murio de repente, evitamos que rompa el for loop
                    # y continue con los demas
                    pass



manager: ConnectionManager = ConnectionManager()
