import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Video, BookOpen, Lightbulb, HeartPulse, Tags } from "lucide-react";

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
            className="group bg-linear-to-br from-orange-700 to-orange-900
                       p-6 rounded-2xl shadow-xl text-left border border-orange-500/20
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

          {/* GERENCIAR SUGESTÕES (ATIVADO) */}
          <button
            onClick={() => navigate("/dashboard/sugestoes")}
            className="group bg-linear-to-br from-teal-700 to-teal-900
                       p-6 rounded-2xl shadow-xl text-left border border-teal-500/20
                       hover:scale-105 hover:shadow-teal-500/30 cursor-pointer
                       transition-all duration-300"
          >
            <Lightbulb
              size={36}
              className="text-[#ffb300] mb-4 group-hover:scale-110 transition-transform"
            />
            <h2 className="text-xl font-black text-white tracking-wide mb-2">
              Sugestões
            </h2>
            <p className="text-xs text-teal-100 leading-relaxed opacity-90">
              Indique livros, filmes, séries, músicas e podcasts para
              enriquecimento terapêutico.
            </p>
          </button>

          {/* GERENCIAR AUTOAJUDA (ATIVADO) */}
          <button
            onClick={() => navigate("/dashboard/autoajuda")}
            className="group bg-linear-to-br from-sky-700 to-sky-900
                       p-6 rounded-2xl shadow-xl text-left border border-sky-500/20
                       hover:scale-105 hover:shadow-sky-500/30 cursor-pointer
                       transition-all duration-300"
          >
            <HeartPulse
              size={36}
              className="text-[#ffb300] mb-4 group-hover:scale-110 transition-transform"
            />
            <h2 className="text-xl font-black text-white tracking-wide mb-2">
              Autoajuda
            </h2>
            <p className="text-xs text-sky-100 leading-relaxed opacity-90">
              Publique imagens e vídeos curtos de apoio rápido para momentos
              difíceis e para vida diária.
            </p>
          </button>
        </div>

        {/* AÇÃO SECUNDÁRIA: CONSULTA DE CATEGORIAS (não é um CRUD, é referência) */}
        <button
          onClick={() => navigate("/dashboard/categorias")}
          className="group mt-6 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Tags size={22} className="text-purple-300" />
            <div className="text-left">
              <h3 className="text-sm font-black text-white tracking-wide">
                Categorias do Sistema
              </h3>
              <p className="text-[11px] text-gray-400">
                Consulte as categorias disponíveis para classificar seus
                conteúdos.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 group-hover:text-white transition">
            Ver todas →
          </span>
        </button>
      </div>
    </div>
  );
}
