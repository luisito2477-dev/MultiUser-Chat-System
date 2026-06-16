import React from 'react';
import { useNavigate } from 'react-router-dom';

// Interfaz extendida que incluye los datos de SQLAlchemy + la metadata calculada por el Dashboard
interface ActiveRoomData {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    created_at: string;
    owner_username: string; // <-- Inyección del username real obtenida del room_service
}

interface ChatHeaderProps {
    room: ActiveRoomData | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ room }) => {
    const navigate = useNavigate();

    // Si no hay ninguna sala seleccionada (estado inicial del dashboard)
    if (!room) {
        return (
            <div className="h-14 w-full border-b border-zinc-900 px-6 flex items-center flex-shrink-0 bg-zinc-950/20">
                <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
                    No channel selected
                </p>
            </div>
        );
    }

    const handleGoToDetails = () => {
        navigate(`/dashboard/rooms/${room.id}/details`);
    };

    return (
        /* CAMBIO CLAVE: Bajamos a z-0 para que al abrirse la Sidebar móvil (que tiene z-10), 
          esta pase de forma implacable por encima del encabezado sin que se encimen los textos.
        */
        <div className="h-14 w-full border-b border-zinc-900 px-6 flex items-center justify-between flex-shrink-0 bg-zinc-950/20 z-0">
            
            {/* SECCIÓN IZQUIERDA: METADATA COMPLETA DE LA SALA */}
            <div 
                onClick={handleGoToDetails}
                className="flex flex-col justify-center cursor-pointer group max-w-[75%] sm:max-w-[85%]"
            >
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-black tracking-tight text-zinc-200 group-hover:text-red-500 transition-colors truncate">
                        # {room.name}
                    </h1>
                    <span className="text-[9px] font-mono bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity hidden xs:inline uppercase tracking-wider">
                        View Details
                    </span>
                </div>
                
                {/* Contenedor adaptativo en línea para la descripción y el operador creador */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 truncate tracking-tight mt-0.5">
                    {room.description && (
                        <span className="truncate">{room.description}</span>
                    )}
                    {room.description && <span className="text-zinc-800 font-bold">|</span>}
                    <span className="text-zinc-600 flex-shrink-0">
                        Owner: <strong className="text-red-500/80 font-bold group-hover:text-red-400 transition-colors">@{room.owner_username}</strong>
                    </span>
                </div>
            </div>

            {/* SECCIÓN DERECHA: BOTÓN DE CONFIGURACIÓN */}
            <div>
                <button 
                    onClick={handleGoToDetails}
                    title="Room Settings & Members"
                    className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950/40 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all active:scale-95 group"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-4 h-4 transition-transform group-hover:rotate-45"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.242-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827a1.125 1.125 0 0 1 .26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" 
                        />
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
                        />
                    </svg>
                </button>
            </div>

        </div>
    );
};