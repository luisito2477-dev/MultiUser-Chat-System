import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const BACKEND_LOGIN_URL = "http://localhost:8000/auth/login"; // Ajusta el puerto si es necesario

    // --- ESTADOS CONTROLADOS ---
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // --- MANEJADOR DEL ENVÍO ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Al usar OAuth2PasswordRequestForm en FastAPI, se debe enviar como x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch(BACKEND_LOGIN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });

            const data = await response.json();

            if (!response.ok) {
                // Si FastAPI rechaza las credenciales (por ejemplo, un 401 Unauthorized o 400)
                const errorMessage = data && typeof data.detail === 'string'
                    ? data.detail
                    : "Credenciales incorrectas o error en el servidor.";
                throw new Error(errorMessage);
            }

            // Aquí el backend ya nos regreso el JSON con el access_token y token_type
            if (data.access_token) {
                // Almacenamos el JWT en el localStorage para usarlo en los otros 3 servicios (messages, rooms, files)
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('token_type', data.token_type || 'bearer');
                
                // Redirigimos al dashboard, chat o sala principal
                navigate('/dashboard');
            } else {
                throw new Error("No se recibió el token de acceso desde el servidor.");
            }

        } catch (err: any) {
            if (err.message === "Failed to fetch") {
                setError("No se pudo conectar con el servicio de autenticación. Verifica tu red.");
            } else {
                setError(err.message || "Ocurrió un error inesperado al iniciar sesión.");
            }
        } finally {
            setLoading(false); // Apagamos el estado de carga pase lo que pase
        }
    };

    return (
        <div className="min-h-[calc(100vh-180px)] bg-[#050505] flex items-center justify-center px-4 relative my-4">
            
            {/* Tarjeta del Formulario */}
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl relative z-10">
                
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Sign In</h2>
                    <p className="text-sm text-zinc-400 mt-1">Type in your credentials to access the chat system.</p>
                </div>

                {/* Mensaje de Error de FastAPI */}
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
                            Username / Email
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

                    {/* Botón de Enviar con efecto Glow */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-2 bg-red-500 hover:bg-[#FF003C] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_#FF1744] hover:shadow-[0_0_20px_#FF1744] active:scale-[0.98] text-sm tracking-wide uppercase font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Autenticando Nodo...' : 'Acceder'} 
                    </button>
                </form>

                {/* Link para ir al Registro */}
                <div className="text-center mt-6 pt-5 border-t border-zinc-900 text-sm text-zinc-400">
                    ¿You do not have an account?{' '}
                    <button 
                        onClick={() => navigate('/register')}
                        className="text-red-500 hover:text-[#FF003C] font-semibold underline underline-offset-4 transition-colors"
                    >
                        Register here
                    </button>
                </div>
            </div>
        </div>
    );
};