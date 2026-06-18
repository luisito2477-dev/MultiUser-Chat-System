import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Para movernos entre rutas
import { DashboardActionHeader } from '../components/dashboard/DashboardActionHeader';

// ─── INTERFAZ DE DATOS DE LA SALA ───
interface Room {
    id: string;
    name: string;
    description: string;
    max_users?: number;
    current_users_count: number;
    is_member: boolean;
}

export const ExploreRooms: React.FC = () => {
    const navigate = useNavigate();


    //SERVICE ENDPOINTS
    const BACKEND_PROFILE_URL = "http://localhost:8000/auth/me";
    const BACKEND_ROOMS_BASE_URL = "http://localhost:8000/rooms/"

    // ─── ESTADOS PROPIOS DE LA PAGINA
    const [username, setUsername] = useState<string>('OPERATOR');
    const [wsConnected, setWsConnected] = useState<boolean>(true); 
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    
    // Estados de la paginacion y catalogo
    const [rooms, setRooms] = useState<Room[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    const limit = 6;

    /**
     * AUTENTICACION
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
                        // Si el token expiro o es invalido, limpiamos y mandamos al login
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
                    localStorage.removeItem('token'); // Limpiamos por seguridad
                    navigate('/login');
                }
            };
    
            fetchUserProfile();
        }, [navigate]);



    /**
     * CONSULTA DE LAS SALAS
     */
    const fetchRooms = async (page: number, query: string) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(
                `${BACKEND_ROOMS_BASE_URL}?page=${page}&limit=${limit}&search=${query}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                // Recibimos el array directo de objetos
                const rawRooms = await response.json(); 
                
                if (Array.isArray(rawRooms)) {
                    // Mapeamos los datos para inyectar valores por defecto temporalmente
                    // (ya que tu JSON actual no trae miembros ni contadores)
                    const formattedRooms: Room[] = rawRooms.map((room: any) => ({
                        id: room.id,
                        name: room.name,
                        description: room.description,
                        max_users: room.max_users || 100, 
                        current_users_count: room.current_users_count || 0, 
                        is_member: room.is_member || false 
                    }));

                    setRooms(formattedRooms);

                    //Calculamos la paginación dinAmicamente con la longitud del array
                    //const calculatedPages = Math.ceil(formattedRooms.length / limit);
                    //setTotalPages(calculatedPages > 0 ? calculatedPages : 1);
                    setTotalPages(formattedRooms.length === limit ? currentPage + 1 : currentPage);
                } else {
                    console.error("The backend response signature is not an array cluster.");
                }
            }
        } catch (error) {
            console.error("Cluster infrastructure scan failure:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    /**
     * 
     * Funcion para unirse a las salas
     */
    const handleJoinRoom = async (roomId: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BACKEND_ROOMS_BASE_URL}${roomId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setRooms(prevRooms =>
                    prevRooms.map(room =>
                        room.id === roomId 
                            ? { ...room, is_member: true, current_users_count: room.current_users_count + 1 } 
                            : room
                    )
                );
            }
        } catch (error) {
            console.error("Join pipeline crash:", error);
        }
    };

    /*
    * LOGOUT
    */
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden">
            
            {/* INYECCIÓN DEL HEADER: Pasamos los estados locales de esta página */}
            <DashboardActionHeader 
                username={username}
                wsConnected={wsConnected}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                onLogout={handleLogout}
            />

            {/* CUERPO CENTRAL */}
            <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto flex flex-col justify-between">
                
                <div>
                    {/* Panel superior */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5 mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 bg-red-500 animate-ping rounded-full"></span>
                                <h1 className="text-xl font-mono font-bold tracking-tight text-zinc-100">
                                    AVAILABLE_ROOMS_CLUSTER
                                </h1>
                            </div>
                            <p className="text-xs text-zinc-500 font-mono mt-1">
                                Scan and hook into open network rooms across the system.
                            </p>
                        </div>

                       
                    </div>

                    {/* Render de Cards */}
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center font-mono text-xs text-zinc-500 gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                            <span>Scanning decryption channels...</span>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="h-64 flex items-center justify-center border border-dashed border-zinc-900 rounded-xl font-mono text-xs text-zinc-600">
                            No channels found matching the requested criteria.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map((room) => (
                                <div 
                                    key={room.id}
                                    className="bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between transition-all"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="text-sm font-mono font-bold text-zinc-300 tracking-tight truncate">
                                                #{room.name}
                                            </h3>
                                            <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800 text-zinc-500 font-mono">
                                                U: {room.current_users_count}{room.max_users ? `/${room.max_users}` : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-400 line-clamp-2 h-8 mb-4">
                                            {room.description || "No transmission signature overview provided."}
                                        </p>
                                    </div>

                                    {room.is_member ? (
                                        <div className="w-full text-center py-1.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold uppercase tracking-wider rounded-lg select-none">
                                            ✓ Connected
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinRoom(room.id)}
                                            className="w-full py-1.5 bg-zinc-900/60 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-500 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98]"
                                        >
                                            Link Node
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CONTROLES DE PAGINACION */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-5 mt-6">
                    {/* Botón para volver al Dashboard principal de la App usando React Router */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                        ← Return to Dashboard Core
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-zinc-200 disabled:hover:border-zinc-900 rounded-lg transition-all font-mono text-xs select-none"
                        >
                            ◄ PREV
                        </button>

                        <span className="text-xs font-mono text-zinc-500">
                            PAGE <span className="text-zinc-300 font-bold">{currentPage}</span> OF <span className="text-zinc-300 font-bold">{totalPages}</span>
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isLoading}
                            className="p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-zinc-200 disabled:hover:border-zinc-900 rounded-lg transition-all font-mono text-xs select-none"
                        >
                            NEXT ►
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};