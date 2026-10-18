import { useNavigate } from "react-router";
import {
  Home,
  User,
  Map,
  LogOut,
  BookOpen,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBootstrap } from "../context/BootstrapContext";

export default function Header() {
  const { logout, abilities, usuario } = useAuth(); // Usando abilities do novo contexto para segurança
  const { recarregarTudo } = useBootstrap();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInicio = () => {
    recarregarTudo();
    navigate("/inicial");
  };

  // O painel aparece para quem pode publicar (publicador) e também para
  // o psicólogo ainda em análise, que vê lá o aviso do status do cadastro.
  const eProfissional =
    abilities.includes("publicador") || usuario?.tipo === "psicologo";

  // Só admin vê o painel de verificação de psicólogos
  const eAdmin = abilities.includes("admin");

  return (
    <header className="flex flex-wrap gap-4 justify-between items-center bg-[#3a0b6d] px-8 py-4 shadow-lg relative">
      <div className="text-2xl font-bold text-[#ff7300] tracking-wide">
        MindUp
      </div>

      <div className="flex flex-wrap items-center gap-4 relative">
        {/* INÍCIO (CÁSA) */}
        <button
          onClick={handleInicio}
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

        {/* ADMIN — verificação de psicólogos (apenas admin) */}
        {eAdmin && (
          <button
            onClick={() => navigate("/admin/psicologos")}
            className="bg-[#7a00c1] px-4 py-2 rounded-lg shadow-md 
                       hover:bg-[#8c00db] hover:text-[#ff7300] transition flex items-center gap-2 font-semibold text-sm"
          >
            <ShieldCheck size={18} className="text-[#ff7300]" />
            <span>Admin</span>
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

        {/* FAVORITOS */}
        <button
          onClick={() => navigate("/favoritos")}
          className="bg-[#7a00c1] px-4 py-2 rounded-lg shadow-md 
                     hover:bg-[#8c00db] hover:text-[#ff7300] transition flex items-center gap-2 font-semibold text-sm"
        >
          <Heart size={18} className="text-[#ff7300]" />
          <span>Favoritos</span>
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
