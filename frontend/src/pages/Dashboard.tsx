import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardActionHeader } from '../components/dashboard/DashboardActionHeader';
import { SidebarRooms } from '../components/dashboard/SidebarRooms';
import { ChatHeader } from '../components/dashboard/ChatHeader';
import { MessageInput } from '../components/dashboard/MessageInput';
import { MessageArea, type MessagePayload } from '../components/dashboard/MessageArea';
import { CreateRoomModal } from '../components/dashboard/CreateRoomModal';

// Esquema de RoomResponse del backend
interface Member {
    id: string;
    username: string;
}

interface Room {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    owner_username: string;
    current_users_count: number;
    is_member: boolean;
    members: Member[];
    created_at: string;
}

interface ActiveRoomExtended extends Room {
    owner_username: string;
}

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    //SERVICES ENDPOINTS
    const BACKEND_PROFILE_URL = "http://localhost:8000/auth/me";
    const BACKEND_MY_ROOMS_URL = "http://localhost:8000/rooms/me";
    const BACKEND_ROOMS_BASE_URL = "http://localhost:8000/rooms";
    const BACKEND_MESSAGES_URL = "http://localhost:8000/messages/";
    const BACKEND_FILES_UPLOAD_URL = "http://localhost:8000/files/upload";
    const WS_BASE_URL = "ws://localhost:8000/messages/ws";

    // --- ESTADOS DE CONTROL TEMPORALES ---
    const [wsConnected, setWsConnected] = useState<boolean>(true);
    const [username, setUsername] = useState<string>("Loading...");
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    // --- ESTADOS PARA EL ROOM_SERVICE ---
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
    const [activeRoomData, setActiveRoomData] = useState<ActiveRoomExtended | null>(null);

    const [messages, setMessages] = useState<MessagePayload[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    /**
     * OBTENER USUARIO LOGUEADO
     */
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if(!token){
                navigate('/login');
                return;
            }

            try{
                const response = await fetch(BACKEND_PROFILE_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Session expired or invalid token.");
                }

                const data = await response.json();
                if (data && data.username) {
                    setUsername(data.username);
                } else {
                    setUsername("Unknown User");
                }
            } catch (err: any) {
                console.error("Auth fetch error:", err);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchUserProfile();
    }, [navigate]);

    /**
     * ─── OBTENER SALAS DEL USUARIO (REFACTORIZADO FUERA DEL EFFECT) ───
     * Lo envolvemos en useCallback para poder invocarlo desde el modal sin loops infinitos
     */
    const fetchMyRooms = useCallback(async () => {
        const token = localStorage.getItem('token');
        if(!token){
            navigate('/login');
            return;
        }

        try{
            const response = await fetch(BACKEND_MY_ROOMS_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if(!response.ok){
                throw new Error("Session expired.");
            }

            const data = await response.json();
            setRooms(data);

            // Si hay salas y no hay ninguna activa, agarramos la primera
            if (data.length > 0 && !currentRoomId) {
                setCurrentRoomId(data[0].id);
            }
        } catch (err){
            console.error("Rooms fetch error: ", err);
        } finally {
            setLoadingRooms(false);
        }
    }, [navigate, currentRoomId]);

    // Disparador inicial para cargar las salas al montar el componente
    useEffect(() => {
        fetchMyRooms();
    }, [fetchMyRooms]);


    /*
    * OBTENCION DE DATOS DE LA ROOM SELECCIONADA
    */
    useEffect(() => {
        if(!currentRoomId || rooms.length === 0){
            setActiveRoomData(null);
            return;
        }

        const currentRoom = rooms.find(r => r.id === currentRoomId);
        if (currentRoom){
            setActiveRoomData(currentRoom);
        }
    }, [currentRoomId, rooms]);


    /**
     * TRANSMITIR MENSAJE Y SUBIR ARCHIVO
     */
    const handleSendMessage = async(text: string, file: File | null) => {
        //Si no hay room seleccionada se cancela operacion
        if(!currentRoomId){
            return;
        }

        //Verificar que aun sigue autenticado
        const token = localStorage.getItem('token');
        if(!token){
            return;
        }

        try{
            //Si el usuario adjunto archivo sin mensaje, se adjunta un mensaje en automatico, si si escribio texto, se conserva lo que se escribio
            const contentText = text.trim() === "" && file ? `Shared a file: ${file.name}` : text;
            console.log("Step 1: Emitting message base metadata to messages_service...");
            
            //Peticion para guardar el mensaje en la db
            const messageResponse = await fetch(BACKEND_MESSAGES_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    room_id: currentRoomId,
                    message_type: file ? "FILE" : "TEXT",
                    content: contentText
                })
            });

            
            if (!messageResponse.ok) {
                const errData = await messageResponse.json();
                throw new Error(errData.detail || "Failed to deliver message.");
            }

            //Deserializamos
            const messageData = await messageResponse.json();
            const createdMessageId = messageData.message_id;
            
            console.log(`Step 1 Success. Message assigned ID: ${createdMessageId}`);
            
            //Si el usuario cargo archivo y tenemos id mensaje, procedemos a cargar el archivo en la db
            if (file && createdMessageId) {
                console.log("Step 2: File detected. Packing FormData for files_service...");
                //Instanciamos el FormData, para empaquetar el archivo en binario y el ID de relacion con el mensaje
                const formData = new FormData();
                formData.append("file", file);
                formData.append("message_id", createdMessageId);
                
                //Peticion para guardar el archivo
                const fileResponse = await fetch(BACKEND_FILES_UPLOAD_URL, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                if (!fileResponse.ok) {
                    const fileErrData = await fileResponse.json();
                    throw new Error(fileErrData.detail || "File structure transmission failed.");
                }
                console.log("Step 2 Success.");
            }
        } catch (err: any) {
            console.error("Transmission aborted:", err.message);
            alert(`Error transmitting chunk: ${err.message}`);
        }
    };


    /**
     * CICLO DE VIDA DE CONEXION: HISTORIAL & WEBSOCKET EN TIEMPO REAL 
     */
    useEffect(() => {
        if (!currentRoomId) {
            return;
        }

        const token = localStorage.getItem('token');

        //Variable para almacenar la instancia del socket
        let ws: WebSocket | null = null;

        //Duncion para realizar una Peticion para obtener historial de mensajes
        const fetchHistoryAndConnect = async () => {
            try {
                
                const response = await fetch(`${BACKEND_ROOMS_BASE_URL}/${currentRoomId}/messages?page=1&limit=40`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
                });

                if (response.ok) {
                    const history = await response.json();
                    setMessages(history);
                }
            } catch (err) {
                console.error("Failed to load transmission history:", err);
                setMessages([]);
            }

            console.log(`[WS] Initializing connection to room node: ${currentRoomId}`);
            
            //Apertura del canal en tiempo real utilizando el protocolo ws://
            ws = new WebSocket(`${WS_BASE_URL}/${currentRoomId}`);

            //Evento onopen. Se ejecuta cuando el backend acepta el saludo del websocket, cambia el estado visual a verde para indicar que se conecto
            ws.onopen = () => {
                console.log("[WS] Secure socket tunnel established successfully.");
                setWsConnected(true);
            };

            // Evento on message, se ejecuta cada vez que el servidor envia un mensaje al canal
            ws.onmessage = (event) => {
                try {
                    //parsea lo recibido a MessagePayload
                    const incomingMessage: MessagePayload = JSON.parse(event.data);
                    
                    //actualizar mensage
                    setMessages((prev) => {
                        const exists = prev.some(m => m.id === incomingMessage.id);
                        //Si el mensaje recibido ya existia, remplaza el mensaje viejo por el nuevo
                        if (exists) {
                            return prev.map(m => m.id === incomingMessage.id ? incomingMessage : m);
                        }
                        //Si es un mensaje completamente nuevo, se concatena al final de la pantalla
                        return [...prev, incomingMessage];
                    });
                } catch (err) {
                    console.error("[WS] Error parsing incoming transmission chunk:", err);
                }
            };

            //eventos que apagan el socket
            ws.onerror = () => setWsConnected(false);
            ws.onclose = () => setWsConnected(false);
        };

        fetchHistoryAndConnect();
        
        //funcion de limpiezaa, cierra el socket cuando se cambia la id
        return () => {
            if (ws) {
                console.log(`[WS] Tearing down connection for node: ${currentRoomId}`);
                ws.close();
            }
        };
    }, [currentRoomId]);


    // ─── CALLBACKS PARA SIDEBAR_ROOMS ───
    const handleSelectRoom = (roomId: string) => {
        setCurrentRoomId(roomId);
    };

    const handleOpenExplore = () => {
        navigate('/dashboard/explore');
    };

    // ─── CORRECCIÓN DEL CALLBACK DE CONTROL ───
    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        window.location.reload();
    };

    return (
        <div className="h-screen w-full bg-[#050505] text-zinc-100 flex flex-col overflow-hidden select-none">
            
            <DashboardActionHeader 
                username={username}
                wsConnected={wsConnected}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                onLogout={handleLogout}
            />

            <div className="flex-grow w-full flex overflow-hidden relative">
                
                <SidebarRooms 
                    rooms={rooms}
                    currentRoomId={currentRoomId}
                    isSidebarOpen={isSidebarOpen}
                    onSelectRoom={handleSelectRoom}
                    onOpenExplore={handleOpenExplore}
                    onOpenCreateModal={handleOpenCreateModal} // Ya abre el modal real
                />

                <section className="flex-grow h-full flex flex-col bg-[#050505] overflow-hidden">
                    <ChatHeader room={activeRoomData} />
                    <MessageArea messages={messages} />
                    <MessageInput 
                        currentRoomName={activeRoomData ? activeRoomData.name : null} 
                        onSendMessage={handleSendMessage}
                    />
                </section>

            </div>

            {/* ─── MODAL ACTUALIZADO CON LA FUNCIÓN REAL ─── */}
            <CreateRoomModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onRoomCreated={fetchMyRooms} // <--- Invoca directamente la recarga de tu Sidebar!
                baseRoomsUrl={BACKEND_ROOMS_BASE_URL}
            />

        </div>
    );
};