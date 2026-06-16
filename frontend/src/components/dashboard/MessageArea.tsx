import React, { useEffect, useRef } from 'react';

// Estructuras de datos acopladas a tus esquemas de Pydantic
interface FileInfo {
    id: string;
    filename: string;
    content_type: string;
    file_size: number;
}

export interface MessagePayload {
    id: string;
    room_id: string;
    user_id: string;
    username: string;
    message_type: 'TEXT' | 'FILE' | 'SYSTEM';
    content: string;
    created_at: string;
    file_info?: FileInfo | null;
}

interface MessageAreaProps {
    messages: MessagePayload[];
    currentUserId?: string; // Opcional, por si luego quieres pintar tus mensajes del lado derecho
}

export const MessageArea: React.FC<MessageAreaProps> = ({ messages }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const BACKEND_DOWNLOAD_BASE = "http://localhost:8000/files/download";

    // Auto-scroll al fondo cada vez que el arreglo de mensajes mute
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Formateador de bytes para las tarjetas de archivos adjuntos
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // Manejador de descarga directa pidiéndole el binario al backend
    const handleDownload = (fileId: string, filename: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Disparamos la descarga metiendo el token en la URL o mediante una redirección controlada
        // Dado que es un GET, si tu endpoint acepta el token por query parameter o si es público lo abres directo.
        // Si requiere Bearer estricto, la forma limpia es abrir el link con el token adjunto:
        window.open(`${BACKEND_DOWNLOAD_BASE}/${fileId}?token=${token}`, '_blank');
    };

    // Formateador de tiempo rápido (HH:MM)
    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return "00:00";
        }
    };

    return (
        <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#050505]/20"
        >
            {messages.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center text-zinc-600 font-mono text-xs select-none gap-2 animate-pulse">
                    <span>[ SYSTEM STATUS: NO TRANSMISSIONS DETECTED ]</span>
                    <span className="text-[10px] text-zinc-700">Channel is silent. Begin typing below...</span>
                </div>
            ) : (
                messages.map((msg) => {
                    // ─── CASO 1: MENSAJES DE SISTEMA (LOGS) ───
                    if (msg.message_type === 'SYSTEM') {
                        return (
                            <div 
                                key={msg.id} 
                                className="flex justify-center items-center py-1.5 animate-fade-in"
                            >
                                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-950 px-3 py-1 border border-zinc-900/60 rounded-full tracking-tight">
                                    ⚙️ <span className="text-zinc-400 font-bold">{msg.content}</span>
                                </span>
                            </div>
                        );
                    }

                    // ─── CASO 2 & 3: TEXTO Y ARCHIVOS DE USUARIOS ───
                    return (
                        <div 
                            key={msg.id} 
                            className="flex flex-col max-w-2xl bg-zinc-900/20 border border-zinc-900/60 p-3.5 rounded-xl hover:border-zinc-800 transition-colors animate-fade-in"
                        >
                            {/* Meta del Mensaje */}
                            <div className="flex items-center gap-2 mb-1.5 select-none">
                                <span className="text-xs font-mono font-bold text-red-500 tracking-wide">
                                    {msg.username}
                                </span>
                                <span className="text-[9px] text-zinc-600 font-mono bg-zinc-950 border border-zinc-900 px-1.5 py-0.5 rounded">
                                    {formatTime(msg.created_at)}
                                </span>
                            </div>

                            {/* Contenido de Texto */}
                            {msg.content && (
                                <p className="text-sm text-zinc-300 leading-relaxed font-sans select-text break-words">
                                    {msg.content}
                                </p>
                            )}

                            {/* Caja de Archivo Adjunto (Renderizado si el message_type es FILE y trae metadata) */}
                            {msg.message_type === 'FILE' && msg.file_info && (
                                <div className="mt-3 flex items-center justify-between bg-black/60 border border-zinc-900 p-3 rounded-xl gap-4 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-2xl select-none filter drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]">📁</span>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs font-bold text-zinc-200 font-mono truncate select-text">
                                                {msg.file_info.filename}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                                                {formatBytes(msg.file_info.file_size)} • {msg.file_info.content_type.split('/')[1] || 'DATA'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Botón Industrial de Descarga */}
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(msg.file_info!.id, msg.file_info!.filename)}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-red-500 hover:text-white border border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold rounded-lg transition-all active:scale-95 uppercase tracking-wider shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Pull
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};