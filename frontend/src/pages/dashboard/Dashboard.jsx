import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  Video,
  BookOpen,
  Lightbulb,
  HeartPulse,
  User,
  LogOut
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  // proteção extra
  if (!usuario || (usuario.tipo !== "psicologo" && usuario.tipo !== "admin")) {
    return (
      <p className="text-center text-white mt-10">
        Acesso restrito.
      </p>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 text-white"
      style={{
        backgroundImage: "url('/tela_fundo_adm.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-black/60 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-5xl">

        {/* TÍTULO */}
        <h1 className="text-4xl font-bold text-center mb-4">
          Dashboard
        </h1>

        <p className="text-center text-gray-300 mb-10">
          Bem-vindo, <span className="font-semibold text-yellow-400">{usuario.nome}</span>
        </p>

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          {/* GERENCIAR VÍDEOS */}
          <button
            onClick={() => navigate("/dashboard/videos")}
            className="group bg-linear-to-br from-purple-700 to-purple-900
                       p-6 rounded-2xl shadow-xl text-left
                       hover:scale-105 hover:shadow-purple-500/40
                       transition-all duration-300"
          >
            <Video size={36} className="text-yellow-400 mb-4 group-hover:scale-110 transition" />
            <h2 className="text-xl font-bold mb-2">Vídeos</h2>
            <p className="text-sm text-gray-200">
              Criar, editar e excluir seus vídeos
            </p>
          </button>

          {/* ARTIGOS */}
          <div
            className="bg-gray-700/60 p-6 rounded-2xl opacity-50 cursor-not-allowed"
          >
            <BookOpen size={36} className="mb-4" />
            <h2 className="text-xl font-bold mb-2">Artigos</h2>
            <p className="text-sm">
              Em desenvolvimento
            </p>
          </div>

          {/* SUGESTÕES */}
          <div
            className="bg-gray-700/60 p-6 rounded-2xl opacity-50 cursor-not-allowed"
          >
            <Lightbulb size={36} className="mb-4" />
            <h2 className="text-xl font-bold mb-2">Sugestões</h2>
            <p className="text-sm">
              Em desenvolvimento
            </p>
          </div>

          {/* AUTOAJUDA */}
          <div
            className="bg-gray-700/60 p-6 rounded-2xl opacity-50 cursor-not-allowed"
          >
            <HeartPulse size={36} className="mb-4" />
            <h2 className="text-xl font-bold mb-2">Autoajuda</h2>
            <p className="text-sm">
              Em desenvolvimento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
