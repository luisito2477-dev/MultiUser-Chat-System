import React, { useState } from 'react';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoomCreated: () => void; // Para recargar el cluster de salas al terminar
    baseRoomsUrl: string;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
    isOpen,
    onClose,
    onRoomCreated,
    baseRoomsUrl
}) => {
    // ─── ESTADOS DEL FORMULARIO BAJO EL ESQUEMA ROOMCREATE ───
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);

        // Validaciones 
        if (name.length < 1 || name.length > 20) {
            setErrorMsg("CRITICAL: Name signature must be between 1 and 20 characters.");
            setIsSubmitting(false);
            return;
        }
        if (description.length < 1 || description.length > 100) {
            setErrorMsg("CRITICAL: Description payload must be between 1 and 100 characters.");
            setIsSubmitting(false);
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(baseRoomsUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            });

            if (response.ok) {
                // Limpiamos la terminal del formulario y cerramos
                setName('');
                setDescription('');
                onRoomCreated(); // Detonamos el refresh en la página padre
                onClose();
            } else {
                const errData = await response.json();
                setErrorMsg(errData.detail || "Failed to provision the requested room node.");
            }
        } catch (error) {
            console.error("Pipeline breakdown creating room:", error);
            setErrorMsg("NET_ERROR: Infrastructure handshake failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            {/* CAJA DEL MODAL CROMO OSCURO */}
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-xl shadow-[0_0_24px_rgba(0,0,0,0.8)] overflow-hidden font-mono">
                
                {/* HEADLINE */}
                <div className="bg-zinc-900/50 px-5 py-3 border-b border-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        <h2 className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
                            PROVISION_NEW_CHANNEL
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
                    >
                        [X]
                    </button>
                </div>

                {/* CUERPO DEL PROTOCOLO */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    
                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-2.5 rounded-lg">
                            {errorMsg}
                        </div>
                    )}

                    {/* INPUT 1: NAME */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] tracking-wider text-zinc-500 font-bold">
                            <label htmlFor="room-name">CHANNEL_SIGNATURE (MAX 20)</label>
                            <span>{name.length}/20</span>
                        </div>
                        <input
                            id="room-name"
                            type="text"
                            required
                            maxLength={20}
                            placeholder="e.g., My Friends"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-red-500/50 text-zinc-200 placeholder-zinc-700 px-3 py-2 rounded-lg text-xs outline-none transition-all"
                        />
                    </div>

                    {/* INPUT 2: DESCRIPTION */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] tracking-wider text-zinc-500 font-bold">
                            <label htmlFor="room-desc">DESCRIPTION (MAX 100)</label>
                            <span>{description.length}/100</span>
                        </div>
                        <textarea
                            id="room-desc"
                            required
                            maxLength={100}
                            rows={3}
                            placeholder="Talking about life..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-red-500/50 text-zinc-200 placeholder-zinc-700 px-3 py-2 rounded-lg text-xs outline-none transition-all resize-none"
                        />
                    </div>

                    {/* BOTONES DE CONTROL DE SISTEMA */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-900 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 bg-transparent border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 text-xs rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-1.5 bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-500 text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40"
                        >
                            {isSubmitting ? "Creating..." : "Create Room"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};