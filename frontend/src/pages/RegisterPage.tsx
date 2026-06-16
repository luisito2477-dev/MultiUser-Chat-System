import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const RegisterPage: React.FC = () => {


    const navigate = useNavigate();

    const BACKEND_SIGNUP_URL = "http://localhost:8000/auth/signup";
    // ==========================================
    // ESPACIO 1: TUS ESTADOS (USESTATE)
    // Aquí es donde tú vas a declarar tus variables para capturar los inputs
    // ==========================================
    const [ username, setUsername ] = useState<string>("");
    const [ email, setEmail ] = useState<string>("");
    const [ password, setPassword ] = useState<string>("");
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    // ==========================================
    // ESPACIO 2: TU FUNCIÓN HANDLESUBMIT
    // Aquí harás la petición a tu backend (Axios/Fetch)
    // ==========================================
 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Siempre pon el preventDefault hasta arriba, fuera del try si quieres blindarlo antes de que empiece la lógica
        setError(null);
        setLoading(true);

        const payload = {
            username,
            email,
            password
        };

        try {
            const response = await fetch(BACKEND_SIGNUP_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });


            const data = await response.json();

            if (!response.ok) {
                
                const errorMessage = data && typeof data.detail === 'string' 
                    ? data.detail 
                    : "Unexpected error in the server";
                throw new Error(errorMessage);
            }

            // Si llego aqui es un 200 OK
            navigate('/login');

        } catch (err: any) {

            if (err.message) {
                setError(err.message);
            }
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="min-h-[calc(100vh-180px)] bg-[#050505] flex items-center justify-center px-4 relative my-4">
            
            {/* Tarjeta Principal del Formulario */}
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl relative z-10">
                
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Create Account</h2>
                    <p className="text-sm text-zinc-400 mt-1">Register to start chatting on the rooms.</p>
                </div>

                {/* Mensaje de Error Dinámico de FastAPI */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-mono font-bold tracking-wide mb-5">
                        ERROR: {error}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Campo: Username */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-red-500 mb-1.5 font-mono">
                            Username
                        </label>
                        <input 
                            type="text" 
                            required 
                            placeholder="LuisFer_10"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black border border-zinc-900 focus:border-red-500 text-zinc-100 placeholder-zinc-700 px-4 py-3 rounded-xl outline-none transition-all text-sm focus:ring-1 focus:ring-red-500"
                        />
                    </div>

                    {/* Campo: Email */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-red-500 mb-1.5 font-mono">
                            Email
                        </label>
                        <input 
                            type="email" 
                            required
                            placeholder="luis@escom.ipn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-zinc-900 focus:border-red-500 text-zinc-100 placeholder-zinc-700 px-4 py-3 rounded-xl outline-none transition-all text-sm focus:ring-1 focus:ring-red-500"
                        />
                    </div>

                    {/* Campo: Password */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-red-500 mb-1.5 font-mono">
                            Password
                        </label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-zinc-900 focus:border-red-500 text-zinc-100 placeholder-zinc-700 px-4 py-3 rounded-xl outline-none transition-all text-sm focus:ring-1 focus:ring-red-500"
                        />
                    </div>

                    {/* Botón de Enviar con tu efecto Glow */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-2 bg-red-500 hover:bg-[#FF003C] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_#FF1744] hover:shadow-[0_0_20px_#FF1744] active:scale-[0.98] text-sm tracking-wide uppercase font-mono"
                    >
                        {loading ? 'Sending data...' : 'Sign Up'} 
                    </button>
                </form>

                {/* Link para ir al Login */}
                <div className="text-center mt-6 pt-5 border-t border-zinc-900 text-sm text-zinc-400">
                    ¿Do you already have an account?{' '}
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-red-500 hover:text-[#FF003C] font-semibold underline underline-offset-4 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};