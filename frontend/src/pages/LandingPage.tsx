import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-180px)] bg-[#050505] text-zinc-100 flex flex-col items-center justify-center px-4 py-12">
            
            {/* Sección Hero (Título Principal) */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
                <span className="inline-block text-xs font-mono tracking-widest text-red-500 uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    Práctica 5 - Comunicaciones en Red
                </span>
                
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 leading-none">
                    Multi-User <br />
                    <span className="bg-gradient-to-r from-red-500 to-[#FF003C] bg-clip-text text-transparent">
                        Chat System
                    </span>
                </h1>
                
                <p className="text-base sm:text-lg text-zinc-400 font-normal max-w-lg mx-auto">
                    A web platform for managing and communicating within concurrent chat rooms. Connect to multiple nodes in real time.
                </p>

                {/* Botón Principal con Efecto Glow */}
                <div className="pt-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-3.5 bg-red-500 hover:bg-[#FF003C] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_#FF1744] hover:shadow-[0_0_25px_#FF1744] active:scale-[0.98] tracking-wide font-mono text-sm uppercase"
                    >
                        Access the system
                    </button>
                </div>
            </div>

            {/* Grid Informativo Simple (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mt-4">
                
                {/* Tarjeta 1 */}
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                        
                        <h3 className="text-lg font-bold text-zinc-100 tracking-tight">Chat Rooms</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Create, explore, and join independent communication rooms. Designed to support multiple conversation streams in an organized manner.
                        </p>
                    </div>
                </div>

                {/* Tarjeta 2 */}
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-zinc-100 tracking-tight">Real-Time Communication</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Instant message delivery and reception through persistent sockets, ensuring minimal latency and smooth concurrency.
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
};