import React from 'react';

// Tipado estricto para las salas que vienen del room_service
interface Room{
    id: string;
    name: string;
    description: string;
    owner_id: string;
    created_at: string;
}

interface SidebarRoomsProps {
    rooms: Room[];
    currentRoomId: string | null;
    isSidebarOpen: boolean;
    onSelectRoom: (roomId: string) => void;
    onOpenExplore: () => void;
    onOpenCreateModal: () => void;
}

export const SidebarRooms: React.FC<SidebarRoomsProps> = ({
    rooms,
    currentRoomId,
    isSidebarOpen,
    onSelectRoom,
    onOpenExplore,
    onOpenCreateModal
}) => {
    return (
        <aside className={`
            ${isSidebarOpen ? 'flex' : 'hidden'} 
            sm:flex w-72 h-full bg-zinc-950 border-r border-zinc-900 flex-col flex-shrink-0 absolute sm:relative z-10 sm:z-0
        `}>
            
            {/* ENCABEZADO DE LA SIDEBAR */}
            <div className="p-4 border-b border-zinc-900 flex-shrink-0 flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-red-500">
                    Available Rooms
                </h3>
                <span className="text-[10px] bg-zinc-900 text-zinc-500 font-mono px-2 py-0.5 rounded border border-zinc-800">
                    {rooms.length} CH
                </span>
            </div>

            {/* LISTA DINÁMICA DE SALAS (Scroll independiente) */}
            <div className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {rooms.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 text-xs font-mono">
                        No rooms found.<br />Join or create one.
                    </div>
                ) : (
                    rooms.map((room) => {
                        const isActive = room.id === currentRoomId;
                        return (
                            <div
                                key={room.id}
                                onClick={() => onSelectRoom(room.id)}
                                className={`w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                                    isActive
                                        ? 'bg-zinc-900 border border-red-500/20 text-zinc-100 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
                                        : 'text-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-300 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 overflow-hidden truncate">
                                    <span className={`font-mono text-xs ${isActive ? 'text-red-500 font-bold' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                                        #
                                    </span>
                                    <span className="truncate tracking-tight">
                                        {room.name}
                                    </span>
                                </div>

                                {/* Un indicador sutil de flecha que se ilumina al pasar el mouse */}
                                <span className={`text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-red-400' : 'text-zinc-600'}`}>
                                    &gt;&gt;
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* BOTONES DE CONTROL INFERIORES */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 flex gap-2 flex-shrink-0">
                {/* Botón para explorar salas globales */}
                <button 
                    onClick={onOpenExplore}
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono text-xs font-bold rounded-xl transition-all uppercase tracking-wider active:scale-[0.97]"
                >
                    Explore
                </button>
                
                {/* Botón para detonar el modal de creación de sala */}
                <button 
                    onClick={onOpenCreateModal}
                    className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-white font-mono text-xs font-bold rounded-xl transition-all uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.05)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-[0.97]"
                >
                    + Create
                </button>
            </div>

        </aside>
    );
};