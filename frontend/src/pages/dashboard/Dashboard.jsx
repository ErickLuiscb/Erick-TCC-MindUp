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
  ChevronRight,
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

const FOCO =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]";

// ============================
// CARD DE MÓDULO (bloqueado enquanto o psicólogo não é aprovado)
//
// Usa aria-disabled em vez de disabled: o botão "disabled" sai da ordem do
// teclado, então quem usa leitor de tela nunca descobriria por que está
// bloqueado. Com aria-disabled ele continua focável e anuncia o motivo.
// ============================
function CardModulo({ modulo, bloqueado, onAbrir }) {
  const { rota, titulo, descricao, Icone, cor } = modulo;

  return (
    <button
      type="button"
      onClick={() => onAbrir(rota)}
      aria-disabled={bloqueado}
      title={bloqueado ? TEXTO_BLOQUEADO : undefined}
      className={`group relative bg-linear-to-br ${cor.gradiente}
                  p-3 sm:p-6 rounded-2xl shadow-xl text-left border ${cor.borda}
                  transition-all duration-300 ${FOCO}
                  ${
                    bloqueado
                      ? "opacity-50 grayscale cursor-not-allowed"
                      : `hover:scale-105 motion-reduce:hover:scale-100 ${cor.sombra} cursor-pointer`
                  }`}
    >
      {bloqueado && (
        <Lock
          size={16}
          aria-hidden="true"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80"
        />
      )}

      <Icone
        size={36}
        aria-hidden="true"
        className={`w-7 h-7 sm:w-9 sm:h-9 text-[#ffb300] mb-2 sm:mb-4 transition-transform ${
          bloqueado ? "" : "group-hover:scale-110 motion-reduce:transform-none"
        }`}
      />
      <h2 className="text-base sm:text-xl font-black text-white tracking-wide sm:mb-2">
        {titulo}
      </h2>

      {/* No celular a descrição some da tela (como na tela inicial), mas
          continua disponível para leitores de tela. */}
      <p
        className={`sr-only sm:not-sr-only text-xs ${cor.texto} leading-relaxed opacity-90`}
      >
        {descricao}
      </p>

      {bloqueado && <span className="sr-only">{TEXTO_BLOQUEADO}.</span>}
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
        className="mb-6 sm:mb-8 bg-green-500/10 border border-green-400/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <CheckCircle2
          size={28}
          aria-hidden="true"
          className="text-green-300 shrink-0"
        />
        <div className="flex-1">
          <h2 className="font-black text-green-200">
            Seu cadastro foi aprovado!
          </h2>
          <p className="text-sm text-gray-200 mt-1 leading-relaxed">
            Para liberar a publicação, saia e entre novamente na sua conta.
          </p>
        </div>
        <button
          type="button"
          onClick={onEntrarNovamente}
          className={`w-full sm:w-auto shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 sm:py-2 rounded-xl text-sm transition cursor-pointer ${FOCO}`}
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
        className="mb-6 sm:mb-8 bg-red-500/10 border border-red-400/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
      >
        <AlertTriangle
          size={28}
          aria-hidden="true"
          className="text-red-300 shrink-0"
        />
        <div className="min-w-0">
          <h2 className="font-black text-red-200">
            Seu cadastro profissional não foi aprovado
          </h2>
          {usuario.crp_motivo && (
            <p className="text-sm text-gray-100 mt-1 leading-relaxed wrap-break-words">
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
      className="mb-6 sm:mb-8 bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
    >
      <Clock size={28} aria-hidden="true" className="text-amber-300 shrink-0" />
      <div className="min-w-0">
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
      <div className="flex items-center justify-center py-10 text-white">
        <div
          role="alert"
          className="bg-red-900/80 border border-red-500 p-5 sm:p-6 rounded-2xl shadow-xl text-center max-w-sm"
        >
          <p className="text-lg font-bold">
            <span aria-hidden="true">⚠️ </span>Acesso restrito.
          </p>
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
    // O Layout já cuida da altura mínima e do padding da página
    // (p-4 sm:p-6 lg:p-8), então aqui não repetimos min-h-screen nem px.
    <div className="flex items-center justify-center w-full animate-fadeIn text-white pb-2 sm:pb-6">
      {/* Caixa fosca central (Glassmorphism) */}
      <div className="bg-black/60 backdrop-blur-md p-4 sm:p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-5xl border border-white/5">
        {/* TÍTULO E SAUDAÇÃO PROFISSIONAL */}
        <header className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wide text-white drop-shadow-md">
            Painel do Profissional <span aria-hidden="true">📊</span>
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

        {/* Grade: no celular, 2 colunas (2 cards em cima e 2 embaixo) e sem
            a descrição visível. A partir de lg (1024px), os 4 em linha. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
          type="button"
          onClick={() => abrir("/dashboard/categorias")}
          aria-disabled={bloqueado}
          title={bloqueado ? TEXTO_BLOQUEADO : undefined}
          className={`group mt-4 sm:mt-6 w-full bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 transition-all ${FOCO} ${
            bloqueado
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-white/10 cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Tags
              size={22}
              aria-hidden="true"
              className="text-purple-300 shrink-0"
            />
            <div className="text-left min-w-0">
              <h3 className="text-sm font-black text-white tracking-wide">
                Categorias do Sistema
              </h3>
              <p className="text-[11px] text-gray-400">
                Consulte as categorias disponíveis para classificar seus
                conteúdos.
              </p>
              {bloqueado && <span className="sr-only">{TEXTO_BLOQUEADO}.</span>}
            </div>
          </div>

          {bloqueado ? (
            <Lock
              size={14}
              aria-hidden="true"
              className="text-white/70 shrink-0"
            />
          ) : (
            <>
              {/* Celular: só a seta. sm em diante: o texto completo. */}
              <ChevronRight
                size={18}
                aria-hidden="true"
                className="sm:hidden text-purple-300 shrink-0"
              />
              <span
                aria-hidden="true"
                className="hidden sm:inline shrink-0 text-[10px] font-black uppercase tracking-widest text-purple-300 group-hover:text-white transition"
              >
                Ver todas →
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
