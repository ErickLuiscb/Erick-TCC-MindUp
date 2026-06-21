import { useNavigate } from "react-router";
import { Home, User, Map, LogOut, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { logout, abilities } = useAuth(); // Usando abilities do novo contexto para segurança
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Verifica se o token tem permissão de publicador ou admin para renderizar o painel
  const eProfissional =
    abilities.includes("publicador") || abilities.includes("admin");

  return (
    <header className="flex flex-wrap gap-4 justify-between items-center bg-[#3a0b6d] px-8 py-4 shadow-lg relative">
      <div className="text-2xl font-bold text-[#ff7300] tracking-wide">
        MindUp
      </div>

      <div className="flex flex-wrap items-center gap-4 relative">
        {/* INÍCIO (CÁSA) */}
        <button
          onClick={() => navigate("/inicial")}
          className="bg-[#7a00c1] px-4 py-2 rounded-lg shadow-md 
                     hover:bg-[#8c00db] hover:text-[#ff7300] transition flex items-center gap-2 font-semibold text-sm"
        >
          <Home size={18} className="text-[#ff7300]" />
          <span>Início</span>
        </button>

        {/* DASHBOARD (Apenas profissionais - Injetando as abilities do Sanctum) */}
        {eProfissional && (
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#ff3d00] px-4 py-2 rounded-lg shadow-md 
                       hover:bg-[#ff5722] transition 
                       text-sm font-bold flex items-center gap-2"
          >
            📊 <span>Meu Painel</span>
          </button>
        )}

        {/* ANOTAÇÕES */}
        <button
          onClick={() => navigate("/anotacoes")}
          className="bg-[#7a00c1] px-4 py-2 rounded-lg shadow-md 
                     hover:bg-[#8c00db] hover:text-[#ff7300] transition flex items-center gap-2 font-semibold text-sm"
        >
          <BookOpen size={18} className="text-[#ff7300]" />
          <span>Anotações</span>
        </button>

        {/* MAPAS */}
        <button
          onClick={() => navigate("/mapa")}
          className="bg-[#7a00c1] px-4 py-2 rounded-lg shadow-md 
                     hover:bg-[#8c00db] hover:text-[#ff7300] transition flex items-center gap-2 font-semibold text-sm"
        >
          <Map size={18} className="text-[#ff7300]" />
          <span>Mapas</span>
        </button>

        {/* PERFIL */}
        <button
          onClick={() => navigate("/perfil")}
          className="bg-[#7a00c1] px-4 py-2 rounded-lg shadow-md 
                     hover:bg-[#8c00db] hover:text-[#ff7300] transition flex items-center gap-2 font-semibold text-sm"
        >
          <User size={18} className="text-[#ff7300]" />
          <span>Perfil</span>
        </button>

        {/* SAIR */}
        <button
          onClick={handleLogout}
          className="bg-[#7a00c1] px-4 py-2 rounded-lg shadow-md 
                     hover:bg-red-700 hover:text-white transition flex items-center gap-2 font-semibold text-sm"
        >
          <LogOut size={18} className="text-[#ff7300] hover:text-white" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}
