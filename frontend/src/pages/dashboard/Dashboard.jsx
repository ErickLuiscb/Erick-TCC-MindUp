import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Video, BookOpen, Lightbulb, HeartPulse } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario, abilities } = useAuth();

  const eProfissional =
    abilities.includes("publicador") || abilities.includes("admin");

  if (!usuario || !eProfissional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#3a0b6d] text-white">
        <div className="bg-red-900/80 border border-red-500 p-6 rounded-2xl shadow-xl text-center max-w-sm">
          <p className="text-lg font-bold">⚠️ Acesso restrito.</p>
          <p className="text-sm opacity-80 mt-1">
            Este painel é exclusivo para profissionais cadastrados com CRP
            ativo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 text-white animate-fadeIn"
      style={{
        backgroundImage: "url('/tela_fundo_adm.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Caixa fosca central (Glassmorphism expandido para Desktop/Web) */}
      <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-5xl border border-white/5">
        {/* TÍTULO E SAUDAÇÃO PROFISSIONAL */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-wide text-white drop-shadow-md">
            Painel do Profissional 📊
          </h1>
          <p className="text-gray-300 text-sm md:text-base mt-2">
            Bem-vindo(a),{" "}
            <span className="font-bold text-[#ffb300] tracking-wide">
              {usuario.nome}
            </span>
            . Escolha um módulo abaixo para gerenciar.
          </p>
        </header>

        {/* GRID DE CARDS COM DESIGN UNIFICADO E RESPONSIVO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* GERENCIAR VÍDEOS (ATIVO) */}
          <button
            onClick={() => navigate("/dashboard/videos")}
            className="group bg-linear-to-br from-purple-700 to-purple-900
                       p-6 rounded-2xl shadow-xl text-left border border-purple-500/20
                       hover:scale-105 hover:shadow-purple-500/30 cursor-pointer
                       transition-all duration-300"
          >
            <Video
              size={36}
              className="text-[#ffb300] mb-4 group-hover:scale-110 transition-transform"
            />
            <h2 className="text-xl font-black text-white tracking-wide mb-2">
              Vídeos
            </h2>
            <p className="text-xs text-purple-100 leading-relaxed opacity-90">
              Publique, edite e gerencie seus vídeos educativos de psicoeducação
              para os pacientes.
            </p>
          </button>

          {/* GERENCIAR ARTIGOS (ATIVADO - CONFORME APP.JSX) */}
          <button
            onClick={() => navigate("/dashboard/artigos")}
            className="group bg-linear-to-br from-purple-700 to-purple-900
                       p-6 rounded-2xl shadow-xl text-left border border-purple-500/20
                       hover:scale-105 hover:shadow-purple-500/30 cursor-pointer
                       transition-all duration-300"
          >
            <BookOpen
              size={36}
              className="text-[#ffb300] mb-4 group-hover:scale-110 transition-transform"
            />
            <h2 className="text-xl font-black text-white tracking-wide mb-2">
              Artigos
            </h2>
            <p className="text-xs text-purple-100 leading-relaxed opacity-90">
              Gerencie seus artigos científicos, textos de apoio e materiais de
              leitura em formato PDF.
            </p>
          </button>

          {/* SUGESTÕES CULTURAIS (Módulo adiado conforme o plano) */}
          <div className="bg-gray-800/40 p-6 rounded-2xl border border-white/5 opacity-40 select-none flex flex-col justify-between cursor-not-allowed">
            <div>
              <Lightbulb size={36} className="text-gray-400 mb-4" />
              <h2 className="text-xl font-black text-gray-300 tracking-wide mb-2">
                Sugestões
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Módulo de indicações de mídias, livros e filmes para
                enriquecimento terapêutico.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-4 bg-gray-900/50 px-2 py-0.5 rounded-md w-fit">
              Em breve
            </span>
          </div>

          {/* GUIDES DE AUTOAJUDA (Módulo adiado conforme o plano) */}
          <div className="bg-gray-800/40 p-6 rounded-2xl border border-white/5 opacity-40 select-none flex flex-col justify-between cursor-not-allowed">
            <div>
              <HeartPulse size={36} className="text-gray-400 mb-4" />
              <h2 className="text-xl font-black text-gray-300 tracking-wide mb-2">
                Autoajuda
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Módulo para criação de guias práticos de exercícios de
                respiração e meditação.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-4 bg-gray-900/50 px-2 py-0.5 rounded-md w-fit">
              Em breve
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
