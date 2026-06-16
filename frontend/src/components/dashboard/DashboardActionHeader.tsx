import React from 'react';

// Definimos las Props con TypeScript para asegurar un flujo de datos limpio
interface DashboardActionHeaderProps {
    username: string;
    wsConnected: boolean;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    onLogout?: () => void; // Opcional por si quieres meter el botón de una vez
}

export const DashboardActionHeader: React.FC<DashboardActionHeaderProps> = ({
    username,
    wsConnected,
    isSidebarOpen,
    setIsSidebarOpen,
    onLogout
}) => {
    return (
        <header className="h-14 w-full bg-zinc-950 border-b border-zinc-900 px-4 flex items-center justify-between flex-shrink-0 z-20">
            
            {/* SECCIÓN IZQUIERDA: INDICADOR DEL WEBSOCKET (MESSAGE_SERVICE) */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 hidden xs:inline">
                    Node Status:
                </span>
                <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800">
                    {/* Ping Indicator con efecto de pulso neón si está conectado */}
                    <span className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        wsConnected 
                            ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse' 
                            : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                    }`}></span>
                    <span className="text-xs font-mono font-bold tracking-tight text-zinc-300">
                        {wsConnected ? 'WS: CONNECTED' : 'WS: DISCONNECTED'}
                    </span>
                </div>
            </div>

            {/* SECCIÓN DERECHA: INFO DEL OPERADOR (AUTH_SERVICE) Y CONTROLES MÓVILES */}
            <div className="flex items-center gap-4">
                
                {/* Datos del usuario - Se oculta en pantallas muy pequeñas para no amontonar */}
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-zinc-600 font-mono font-bold tracking-widest">OPERATOR</p>
                    <p className="text-sm font-bold text-zinc-200 tracking-tight">{username}</p>
                </div>

                {/* Botón de Logout (Opcional, pero de una vez lo dejamos con estilo cromo) */}
                {onLogout && (
                    <button 
                        onClick={onLogout}
                        className="hidden sm:block px-3 py-1 bg-zinc-900/40 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-500 text-xs font-mono rounded-lg transition-all active:scale-95"
                    >
                        Disconnect
                    </button>
                )}

                {/* Botón Toggle: Solo visible en móviles para mostrar/ocultar la Sidebar de salas */}
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="sm:hidden px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 active:border-red-500/50 rounded-xl text-xs text-red-500 font-mono font-bold uppercase tracking-wide active:scale-95 transition-all"
                >
                    {isSidebarOpen ? 'Hide Rooms' : 'Show Rooms'}
                </button>
            </div>

        </header>
    );
};