import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { RoomDetails } from './pages/RoomDetails';
import { ExploreRooms } from './pages/ExploreRooms';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>

      <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans antialiased selection:bg-[#FF1744] selection:text-white flex flex-col">
        
        <Routes>
          {/* VISTAS PÚBLICAS */}
          <Route 
            path="/*" 
            element={
              <>
                <Header />
                <main className="flex-grow p-6">
                  <div className="max-w-[1400px] mx-auto w-full">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      {/* Redirección por si meten una ruta rota en lo público */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </main>
                <Footer />
              </>
            } 
          />

          {/* VISTAS PRIVADAS DEL CHAT (Se comen toda la pantalla para el multichat responsivo) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/rooms/:id/details" element={<RoomDetails />} />
            <Route path="/dashboard/explore" element={<ExploreRooms />} />
          </Route>
        </Routes>

      </div>
    </Router>
  );
}

export default App;