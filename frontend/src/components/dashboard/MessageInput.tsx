import React, { useState, useRef } from 'react';

interface MessageInputProps {
    currentRoomName: string | null;
    onSendMessage: (text: string, file: File | null) => Promise<void>; // Lo cambiamos a Promise porque el Dashboard ahora maneja async/await
}

export const MessageInput: React.FC<MessageInputProps> = ({ currentRoomName, onSendMessage }) => {
    const [text, setText] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState<boolean>(false); // <-- Bloqueo contra doble envío catastrófico
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isDisabled = !currentRoomName || isSending;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // Envío del mensaje síncrono secuencial
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() && !selectedFile) return;
        if (isSending) return; // Rompe el flujo si ya hay una petición en tránsito

        try {
            setIsSending(true); // Congelamos el input
            
            // Esperamos a que el cerebro del Dashboard termine de subir texto y archivo
            await onSendMessage(text.trim(), selectedFile);

            // Si todo salió bien, limpiamos los buffers locales
            setText("");
            handleClearFile();
        } catch (err) {
            console.error("Input clear aborted due to transmission error", err);
        } finally {
            setIsSending(false); // Liberamos el input para el siguiente mensaje
        }
    };

    return (
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 flex-shrink-0">
            <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-2">
                
                {/* ─── FILE PREVIEW CONTAINER ─── */}
                {selectedFile && (
                    <div className="flex items-center justify-between bg-zinc-900/60 border border-red-500/20 px-3 py-2 rounded-xl animate-fade-in">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="text-xl">📁</span>
                            <div className="flex flex-col overflow-hidden truncate">
                                <span className="text-xs font-bold text-zinc-200 truncate font-mono">
                                    {selectedFile.name}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                    {formatBytes(selectedFile.size)} | Type: {selectedFile.type || "unknown"}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearFile}
                            disabled={isSending}
                            className="p-1 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all font-mono text-xs font-bold disabled:opacity-30"
                        >
                            [X] Remove
                        </button>
                    </div>
                )}

                {/* ─── FORMULARIO DEL INPUT PRINCIPAL ─── */}
                <form 
                    onSubmit={handleSubmit} 
                    className="flex items-center gap-2 bg-black border border-zinc-900 focus-within:border-red-500/50 px-4 py-2.5 rounded-xl transition-all"
                >
                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isDisabled}
                        className="hidden"
                    />

                    {/* BOTÓN DE CLIP: SVG Corregido con un icono de clip real */}
                    <button 
                        type="button"
                        disabled={isDisabled}
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach architectural artifact or file"
                        className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2} 
                            stroke="currentColor" 
                            className="w-5 h-5"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 0L12 12m0 0L6.364 6.364M12 12l5.636 5.636M12 12l-5.636-5.636" 
                                className="hidden" /* Aquí limpiamos la ruta vieja */
                            />
                            {/* Ruta del Clip Industrial minimalista */}
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.12l7.691-7.691" 
                            />
                        </svg>
                    </button>

                    {/* Campo de Texto */}
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isDisabled}
                        placeholder={isSending ? "Transmitting payload..." : isDisabled ? "Select a room first to transmit..." : `Message #${currentRoomName}...`}
                        className="flex-grow bg-transparent outline-none border-none text-sm text-zinc-200 placeholder-zinc-700 disabled:cursor-not-allowed font-mono"
                    />

                    {/* Botón de Enviar */}
                    <button 
                        type="submit"
                        disabled={isDisabled || (!text.trim() && !selectedFile)}
                        className="px-4 py-1.5 bg-red-500 hover:bg-[#FF003C] text-white font-mono text-xs font-bold rounded-lg transition-all uppercase tracking-wider active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(255,0,60,0.4)]"
                    >
                        {isSending ? "Sending..." : "Send"}
                    </button>
                </form>

            </div>
        </div>
    );
};