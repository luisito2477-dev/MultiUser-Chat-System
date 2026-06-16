import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header className="
            sticky
            top-0
            z-50
            bg-[#050505]/90
            backdrop-blur-md
            border-b
            border-[#FF1744]/20
            px-6
            py-4
            flex
            items-center
            justify-between
            max-w-[1400px]
            mx-auto
            w-full
        ">
            <Link
                to="/"
                className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
            >
                <div
                    className="
                        bg-[#FF1744]
                        px-2.5
                        py-1
                        rounded-lg
                        text-white
                        font-black
                        text-lg
                        tracking-wider
                        shadow-[0_0_20px_rgba(255,23,68,0.45)]
                    "
                >
                    MCS
                </div>

                <span
                    className="
                        text-sm
                        sm:text-lg
                        font-black
                        bg-gradient-to-r
                        from-[#FF1744]
                        via-[#FF4569]
                        to-[#FF003C]
                        bg-clip-text
                        text-transparent
                        tracking-wide
                    "
                >
                    Multi-User Chat System
                </span>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                    onClick={() => navigate('/login')}
                    className="
                        px-3
                        py-2
                        text-xs
                        sm:text-sm
                        font-semibold
                        text-zinc-400
                        hover:text-[#FF1744]
                        transition-colors
                    "
                >
                    Sign In
                </button>

                <button
                    onClick={() => navigate('/register')}
                    className="
                        px-3
                        sm:px-4
                        py-1.5
                        sm:py-2
                        text-xs
                        sm:text-sm
                        font-bold
                        bg-[#FF1744]
                        hover:bg-[#FF003C]
                        text-white
                        rounded-xl
                        transition-all
                        duration-300
                        shadow-[0_0_15px_rgba(255,23,68,0.35)]
                        hover:shadow-[0_0_25px_rgba(255,23,68,0.6)]
                        active:scale-[0.98]
                    "
                >
                    Sign Up
                </button>
            </div>
        </header>
    );
};