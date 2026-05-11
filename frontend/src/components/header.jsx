import { useState } from "react";
import { useNavigate } from "react-router";
import { Home, Menu, User, Map, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { logout, usuario } = useAuth(); // 👈 pegamos o usuário
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center bg-[#3a0b6d] px-8 py-4 shadow-lg relative">
      <div className="text-2xl font-bold text-[#ffb300] tracking-wide">
        MindUp
      </div>

      <div className="flex items-center gap-5 relative">
        {/* HOME */}
        <Home
          size={26}
          className="text-[#ffb300] cursor-pointer transition-transform hover:scale-110 hover:text-[#ff8c00]"
          onClick={() => navigate("/inicial")}
        />

        {/* DASHBOARD (apenas admin / psicólogo) */}
        {(usuario?.tipo === "admin" || usuario?.tipo === "psicologo") && (
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#ff3d00] px-6 py-3 rounded-lg shadow-md 
                       hover:bg-[#ff5722] transition 
                       text-base font-bold flex items-center gap-2"
          >
            📊 <span>Minha Dashboard</span>
          </button>
        )}

        {/* ANOTAÇÕES */}
        <button
          onClick={() => navigate("/anotacoes")}
          className="bg-[#7a00c1] px-4 py-2 rounded-lg shadow-md 
                     hover:bg-[#8c00db] transition flex items-center gap-2"
        >
          📒 <span>Anotações</span>
        </button>

        {/* MENU */}
        <Menu
          size={26}
          className="text-white cursor-pointer transition hover:text-[#ffb300]"
          onClick={() => setMenuAberto((prev) => !prev)}
        />

        {menuAberto && (
          <div className="absolute right-0 top-14 bg-white text-[#3a0b6d] rounded-xl shadow-xl flex flex-col w-44 p-2 animate-fadeIn z-50">
            <button
              onClick={() => navigate("/perfil")}
              className="flex items-center gap-2 px-3 py-2 font-semibold rounded-lg hover:bg-purple-100 hover:text-[#ff7300] transition"
            >
              <User size={18} /> Perfil
            </button>

            <button
              onClick={() => navigate("/maps")}
              className="flex items-center gap-2 px-3 py-2 font-semibold rounded-lg hover:bg-purple-100 hover:text-[#ff7300] transition"
            >
              <Map size={18} /> Mapas
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 font-semibold rounded-lg hover:bg-purple-100 hover:text-[#ff7300] transition"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
