import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  Video,
  BookOpen,
  Lightbulb,
  HeartPulse,
  Tags,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const MODULOS = [
  {
    rota: "/dashboard/videos",
    titulo: "Vídeos",
    Icone: Video,
    descricao:
      "Publique, edite e gerencie seus vídeos educativos de psicoeducação para as pessoas.",
    cor: {
      gradiente: "from-purple-700 to-purple-900",
      borda: "border-purple-500/20",
      sombra: "hover:shadow-purple-500/30",
      texto: "text-purple-100",
    },
  },
  {
    rota: "/dashboard/artigos",
    titulo: "Artigos",
    Icone: BookOpen,
    descricao:
      "Gerencie seus artigos científicos, textos de apoio e materiais de leitura em formato PDF.",
    cor: {
      gradiente: "from-orange-700 to-orange-900",
      borda: "border-orange-500/20",
      sombra: "hover:shadow-purple-500/30",
      texto: "text-purple-100",
    },
  },
  {
    rota: "/dashboard/sugestoes",
    titulo: "Sugestões",
    Icone: Lightbulb,
    descricao:
      "Indique livros, filmes, séries, músicas e podcasts para enriquecimento terapêutico.",
    cor: {
      gradiente: "from-teal-700 to-teal-900",
      borda: "border-teal-500/20",
      sombra: "hover:shadow-teal-500/30",
      texto: "text-teal-100",
    },
  },
  {
    rota: "/dashboard/autoajuda",
    titulo: "Autoajuda",
    Icone: HeartPulse,
    descricao:
      "Publique imagens e vídeos curtos de apoio rápido para momentos difíceis e para vida diária.",
    cor: {
      gradiente: "from-sky-700 to-sky-900",
      borda: "border-sky-500/20",
      sombra: "hover:shadow-sky-500/30",
      texto: "text-sky-100",
    },
  },
];

const TEXTO_BLOQUEADO = "Disponível após a aprovação do cadastro";

// ============================
// CARD DE MÓDULO (bloqueado enquanto o psicólogo não é aprovado)
// ============================
function CardModulo({ modulo, bloqueado, onAbrir }) {
  const { rota, titulo, descricao, Icone, cor } = modulo;

  return (
    <button
      onClick={() => onAbrir(rota)}
      disabled={bloqueado}
      title={bloqueado ? TEXTO_BLOQUEADO : undefined}
      className={`group relative bg-linear-to-br ${cor.gradiente}
                  p-6 rounded-2xl shadow-xl text-left border ${cor.borda}
                  transition-all duration-300
                  ${
                    bloqueado
                      ? "opacity-50 grayscale cursor-not-allowed"
                      : `hover:scale-105 ${cor.sombra} cursor-pointer`
                  }`}
    >
      {bloqueado && (
        <Lock size={16} className="absolute top-4 right-4 text-white/80" />
      )}

      <Icone
        size={36}
        className={`text-[#ffb300] mb-4 transition-transform ${
          bloqueado ? "" : "group-hover:scale-110"
        }`}
      />
      <h2 className="text-xl font-black text-white tracking-wide mb-2">
        {titulo}
      </h2>
      <p className={`text-xs ${cor.texto} leading-relaxed opacity-90`}>
        {descricao}
      </p>
    </button>
  );
}

// ============================
// AVISO DE STATUS DA VERIFICAÇÃO (só para psicólogo sem permissão de publicar)
// ============================
function AvisoVerificacao({ usuario, onEntrarNovamente }) {
  const status = usuario.crp_status ?? "pendente";

  const crp = usuario.crp_regiao
    ? `${String(usuario.crp_regiao).padStart(2, "0")}/${usuario.crp}`
    : usuario.crp;

  // Aprovado, mas esta sessão ainda é a de antes da aprovação
  if (status === "aprovado") {
    return (
      <div
        role="status"
        className="mb-8 bg-green-500/10 border border-green-400/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4"
      >
        <CheckCircle2 size={28} className="text-green-300 shrink-0" />
        <div className="flex-1">
          <h2 className="font-black text-green-200">
            Seu cadastro foi aprovado!
          </h2>
          <p className="text-sm text-gray-200 mt-1 leading-relaxed">
            Para liberar a publicação, saia e entre novamente na sua conta.
          </p>
        </div>
        <button
          onClick={onEntrarNovamente}
          className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition cursor-pointer"
        >
          Entrar novamente
        </button>
      </div>
    );
  }

  if (status === "rejeitado") {
    return (
      <div
        role="status"
        className="mb-8 bg-red-500/10 border border-red-400/30 rounded-2xl p-5 flex items-start gap-4"
      >
        <AlertTriangle size={28} className="text-red-300 shrink-0" />
        <div>
          <h2 className="font-black text-red-200">
            Seu cadastro profissional não foi aprovado
          </h2>
          {usuario.crp_motivo && (
            <p className="text-sm text-gray-100 mt-1 leading-relaxed">
              <span className="font-bold">Motivo:</span> {usuario.crp_motivo}
            </p>
          )}
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            Enquanto isso, você continua podendo usar o MindUp normalmente. Se
            acredita que houve um engano, entre em contato com a equipe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="mb-8 bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5 flex items-start gap-4"
    >
      <Clock size={28} className="text-amber-300 shrink-0" />
      <div>
        <h2 className="font-black text-amber-200">
          Seu cadastro está em análise
        </h2>
        <p className="text-sm text-gray-100 mt-1 leading-relaxed">
          Estamos conferindo o seu registro profissional
          {crp ? ` (CRP ${crp})` : ""}. Enquanto isso você pode usar o MindUp
          normalmente, mas só poderá publicar conteúdos depois da aprovação.
        </p>
        <p className="text-xs text-gray-300 mt-2 leading-relaxed">
          Ao final da análise, pode ser necessário entrar novamente para liberar
          a publicação.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario, abilities, logout } = useAuth();

  const podePublicar =
    abilities.includes("publicador") || abilities.includes("admin");
  const ehPsicologo = usuario?.tipo === "psicologo";

  // Quem não é profissional nem psicólogo (em análise) não vê o painel
  if (!usuario || (!podePublicar && !ehPsicologo)) {
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

  // Psicólogo ainda sem permissão de publicar (em análise ou rejeitado)
  const bloqueado = !podePublicar;

  const abrir = (rota) => {
    if (!bloqueado) navigate(rota);
  };

  const entrarNovamente = () => {
    logout();
    navigate("/login");
  };

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
            .{" "}
            {bloqueado
              ? "Seus módulos serão liberados assim que o cadastro for aprovado."
              : "Escolha um módulo abaixo para gerenciar."}
          </p>
        </header>

        {bloqueado && (
          <AvisoVerificacao
            usuario={usuario}
            onEntrarNovamente={entrarNovamente}
          />
        )}

        {/* GRID DE CARDS COM DESIGN UNIFICADO E RESPONSIVO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MODULOS.map((modulo) => (
            <CardModulo
              key={modulo.rota}
              modulo={modulo}
              bloqueado={bloqueado}
              onAbrir={abrir}
            />
          ))}
        </div>

        {/* AÇÃO SECUNDÁRIA: CONSULTA DE CATEGORIAS (não é um CRUD, é referência) */}
        <button
          onClick={() => abrir("/dashboard/categorias")}
          disabled={bloqueado}
          title={bloqueado ? TEXTO_BLOQUEADO : undefined}
          className={`group mt-6 w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between transition-all ${
            bloqueado
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-white/10 cursor-pointer"
          }`}
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
          {bloqueado ? (
            <Lock size={14} className="text-white/70" />
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 group-hover:text-white transition">
              Ver todas →
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
