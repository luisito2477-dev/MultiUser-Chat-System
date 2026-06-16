import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-[#050505] border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 mt-auto">
            <div className="max-w-[1400px] mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <p>© 2026 Práctica 5 - Aplicaciones Para Comunicaciones en Red.</p>

                <p className="font-mono">
                    Developed with ❤️ by{' '}
                    <span className="
                        text-[#FF1744]
                        font-semibold
                        hover:text-[#FF4569]
                        transition-colors
                    ">
                        Luis & Diego
                    </span>
                </p>
            </div>
        </footer>
    );
};