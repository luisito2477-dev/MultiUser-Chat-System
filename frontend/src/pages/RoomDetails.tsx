import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Interfaces alineadas con el ExtendedRoomResponse del Backend
interface Member {
    id: string;
    username: string;
}

interface RoomDetailsData {
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

export const RoomDetails: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    // Endpoints
    const BACKEND_ROOM_BY_ID_URL = `http://localhost:8000/rooms/${roomId}`;
    const BACKEND_LEAVE_ROOM_URL = `http://localhost:8000/rooms/${roomId}/leave`; 

    // Estados
    const [room, setRoom] = useState<RoomDetailsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState<boolean>(false);

    /**
     * OBTENER DETALLES DE LA SALA DESDE EL BACKEND
     */
    useEffect(() => {
        const fetchRoomDetails = async () => {
            console.log("Ejecutando fetchRoomDetails");
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);

                const response = await fetch(BACKEND_ROOM_BY_ID_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Room not found");
                    }
                    throw new Error("Error connecting to the server.");
                }

                const data: RoomDetailsData = await response.json();
                setRoom(data);
            } catch (err: any) {
                console.error("Fetch room details error:", err);
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            fetchRoomDetails();
        }
    }, [roomId, navigate]);

    /**
     * LOGICA PARA ABANDONAR LA SALA
     */
    const handleLeaveRoom = async () => {
        if (!window.confirm(`Are you sure you want to leave the room "${room?.name}"?`)) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            setIsLeaving(true);
            const response = await fetch(BACKEND_LEAVE_ROOM_URL, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("There has been a problem processing the request");
            }

            // Exito: Redireccionamos de vuelta al dashboard principal
            // Al volver, el Dashboard recargará el Sidebar de forma automática
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Leave room error:", err);
            alert(`An error has occurred: ${err.message}`);
        } finally {
            setIsLeaving(false);
        }
    };

    // --- RENDERIZADOS DE CONTROL (LOADING / ERROR) ---
    if (loading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center text-zinc-400 font-mono">
                <span className="animate-pulse">▶ INITIALIZING NODE FETCH [{roomId}]...</span>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center font-mono gap-4">
                <div className="text-red-500 text-lg"> ERROR: {error || "Room not found"}</div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 rounded transition-all text-sm"
                >
                    Go Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        
        // Agregamos min-h-screen, py-12 para dar aire en los bordes y asegurar scroll limpio.
        <div className="min-h-screen w-full bg-[#050505] text-zinc-100 flex justify-center font-sans p-6 overflow-y-auto scrollbar-thin">
            
            {/* Añadimos h-fit (se adapta al contenido) y max-h-none para que se despliegue completo sin cortes */}
            <div className="w-full max-w-2xl h-fit bg-[#0a0a0a] border border-zinc-800 rounded-lg p-6 shadow-2xl flex flex-col gap-6 my-auto">
                
                {/* Header de la Sala */}
                <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{room.name}</h1>
                        <p className="text-xs text-zinc-500 font-mono mt-1">ID: {room.id}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-3 py-1.5 text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 rounded transition-all"
                    >
                        DASHBOARD 
                    </button>
                </div>

                {/* Metadata del Servidor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm bg-zinc-950/50 p-4 border border-zinc-900 rounded">
                    <div>
                        <span className="text-zinc-500">Room Owner:</span>
                        <p className="text-emerald-400 font-semibold">@{room.owner_username}</p>
                    </div>
                    <div>
                        <span className="text-zinc-500">Creation Date:</span>
                        <p className="text-zinc-300">{new Date(room.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-zinc-500">Active Members:</span>
                        <p className="text-zinc-300 font-semibold">{room.current_users_count} members</p>
                    </div>
                    <div>
                        <span className="text-zinc-500">Connection State:</span>
                        <p className={room.is_member ? "text-cyan-400" : "text-amber-400"}>
                            {room.is_member ? "● Subscribed" : "○ Not Affiliated"}
                        </p>
                    </div>
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 font-mono">Room Description</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed bg-[#0d0d0d] p-3 border border-zinc-900 rounded">
                        {room.description || "Este nodo de chat no cuenta con una descripción predeterminada."}
                    </p>
                </div>

                {/* Catálogo de Miembros */}
                {/* CAMBIO: Quitamos flex-grow y cambiamos max-h-[250px] por h-[220px] fijo 
                    para que la caja de miembros controle su propio scroll y no empuje toda la tarjeta hacia afuera */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                        Members ({room.members.length})
                    </h3>
                    <div className="h-[220px] overflow-y-auto border border-zinc-900 bg-[#0d0d0d] rounded divide-y divide-zinc-900 scrollbar-thin">
                        {room.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2.5 text-sm">
                                <span className="text-zinc-300 font-mono">
                                    @{member.username}
                                    {member.id === room.owner_id && (
                                        <span className="ml-2 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded font-sans">
                                            OWNER
                                        </span>
                                    )}
                                </span>
                                <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4]"></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Acciones de / Salida */}
                <div className="border-t border-zinc-800 pt-4 flex justify-end">
                    {room.is_member ? (
                        <button
                            onClick={handleLeaveRoom}
                            disabled={isLeaving}
                            className="px-4 py-2 bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-red-100 border border-red-900/50 hover:border-red-600 rounded text-sm font-mono tracking-wide transition-all disabled:opacity-50"
                        >
                            {isLeaving ? "ABANDONING ROOM..." : "[-] LEAVE ROOM"}
                        </button>
                    ) : (
                        <p className="text-xs font-mono text-zinc-500">You can not leave a room that you do not belong to first.</p>
                    )}
                </div>

            </div>
        </div>
    );
};