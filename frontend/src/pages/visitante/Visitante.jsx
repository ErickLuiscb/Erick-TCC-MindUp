/**
 * MODO VISITANTE — prévia pública dos conteúdos.
 *
 * Tela independente: NÃO usa o Layout, o Header nem o BootstrapContext
 * (todos dependem de login). Busca os dados em GET /visitante/conteudos,
 * que devolve só os 3 conteúdos mais recentes de cada tipo, sem dados de
 * psicólogos. Sem favoritar e sem qualquer ação que exija conta: ao tentar
 * ver mais, o visitante recebe o aviso para fazer cadastro ou login.
 *
 * Para remover o modo visitante: apagar este arquivo, a rota /visitante
 * em App.jsx e o botão "Entrar como visitante" em Login.jsx.
 *
 * OBS: foi desenvolvido tudo em apenas um arquivo e tela devido ao tempo curto e complexidade de refatorar algumas regras
 * já existentes (como o BootstrapContext, que depende de login, e mudar as lógicas das telas públicas de cada conteúdos,
 * o que demandaria muito tempo), para trabalhos futuros, caso seja necessário,
 * pode-se refatorar para separar em mais arquivos e componentes.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Film,
  FileText,
  Lightbulb,
  Sparkles,
  Play,
  Lock,
  LogIn,
  UserPlus,
  X,
  ExternalLink,
  RotateCw,
  AlertTriangle,
} from "lucide-react";
import api from "../../service/api";
import { useAuth } from "../../context/AuthContext";
import Footer from "../../components/footer";
import { infoTipoSugestao, acaoExternaLabel } from "../../utils/sugestoes";

// ============================
// TEMAS POR TIPO DE CONTEÚDO
// (cores iguais às do cartão de cada área na tela inicial)
// As classes ficam completas aqui para o Tailwind encontrá-las.
// ============================
const TEMAS = {
  video: {
    chip: "bg-[#7a00c1]",
    borda: "border-purple-50",
    foco: "focus-visible:ring-[#ff7300]",
    sombra: "hover:shadow-purple-950/20",
    fundoMidia: "bg-purple-950",
    titulo: "group-hover:text-purple-700",
    badge: "text-purple-600 bg-purple-50 border-purple-100/50",
  },
  artigo: {
    chip: "bg-[#ff7300]",
    borda: "border-purple-50",
    foco: "focus-visible:ring-[#ff7300]",
    sombra: "hover:shadow-purple-950/20",
    fundoMidia: "bg-orange-50",
    titulo: "group-hover:text-purple-700",
    badge: "text-[#b34f00] bg-orange-50 border-orange-100",
  },
  sugestao: {
    chip: "bg-[#13b5a2]",
    borda: "border-teal-50",
    foco: "focus-visible:ring-[#13b5a2]",
    sombra: "hover:shadow-teal-950/20",
    fundoMidia: "bg-teal-950",
    titulo: "group-hover:text-teal-700",
    badge: "text-teal-700 bg-teal-50 border-teal-100",
  },
  autoajuda: {
    chip: "bg-[#1599cd]",
    borda: "border-sky-50",
    foco: "focus-visible:ring-[#1599cd]",
    sombra: "hover:shadow-sky-950/20",
    fundoMidia: "bg-sky-950",
    titulo: "group-hover:text-sky-700",
    badge: "text-sky-700 bg-sky-50 border-sky-100",
  },
};

const SECOES = [
  {
    chave: "videos",
    tipo: "video",
    titulo: "Vídeos",
    verMais: "Ver mais vídeos",
    vazio: "Ainda não há vídeos disponíveis.",
    Icone: Film,
    rotuloAbrir: "Abrir vídeo",
  },
  {
    chave: "artigos",
    tipo: "artigo",
    titulo: "Artigos",
    verMais: "Ver mais artigos",
    vazio: "Ainda não há artigos disponíveis.",
    Icone: FileText,
    rotuloAbrir: "Abrir artigo",
  },
  {
    chave: "sugestoes",
    tipo: "sugestao",
    titulo: "Sugestões",
    verMais: "Ver mais sugestões",
    vazio: "Ainda não há sugestões disponíveis.",
    Icone: Lightbulb,
    rotuloAbrir: "Abrir sugestão",
  },
  {
    chave: "autoajudas",
    tipo: "autoajuda",
    titulo: "Autoajuda",
    verMais: "Ver mais conteúdos de autoajuda",
    vazio: "Ainda não há conteúdos de autoajuda disponíveis.",
    Icone: Sparkles,
    rotuloAbrir: "Abrir conteúdo de autoajuda",
  },
];

// ============================
// MODAL BASE
// Acessível: role="dialog", Esc fecha, foco entra no modal e fica preso
// nele, volta ao elemento de origem ao fechar, e a página de trás não rola.
// ============================
const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), textarea, input, select, video[controls], [tabindex]:not([tabindex="-1"])';

function Modal({ titulo, onFechar, largura = "max-w-md", children }) {
  const dialogRef = useRef(null);
  const tituloId = useId();

  useEffect(() => {
    const origem = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    dialogRef.current?.querySelector("[data-autofocus]")?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;
      origem?.focus?.();
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onFechar();
      return;
    }

    if (e.key !== "Tab") return;

    const focaveis = dialogRef.current?.querySelectorAll(SELETOR_FOCAVEL);
    if (!focaveis || focaveis.length === 0) return;

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        onKeyDown={handleKeyDown}
        className={`bg-white text-black rounded-2xl shadow-2xl w-full ${largura} max-h-[90dvh] overflow-y-auto p-5 sm:p-6`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2
            id={tituloId}
            className="text-lg sm:text-xl font-black text-purple-950 leading-snug wrap-break-word min-w-0"
          >
            {titulo}
          </h2>
          <button
            type="button"
            data-autofocus
            onClick={onFechar}
            aria-label="Fechar"
            className="p-2 -m-2 shrink-0 text-gray-500 hover:text-red-500 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================
// AVISO: "faça cadastro ou login"
// ============================
function ModalAviso({ onFechar }) {
  const navigate = useNavigate();

  return (
    <Modal
      titulo="Para conhecer mais, faça cadastro ou login"
      onFechar={onFechar}
    >
      <p className="text-sm text-gray-600 leading-relaxed">
        Com uma conta você acessa todos os vídeos, artigos, sugestões e
        conteúdos de autoajuda, e ainda pode favoritar conteúdos e escrever suas
        anotações.
      </p>

      <div className="flex flex-col gap-3 mt-5">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full flex items-center justify-center gap-2 bg-purple-900 text-white py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
        >
          <LogIn size={18} />
          Fazer login
        </button>
        <button
          type="button"
          onClick={() => navigate("/cadastro")}
          className="w-full flex items-center justify-center gap-2 bg-white text-purple-900 border-2 border-purple-900 py-3 rounded-full font-bold hover:bg-purple-50 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
        >
          <UserPlus size={18} />
          Criar conta
        </button>
        <button
          type="button"
          onClick={onFechar}
          className="w-full py-2 text-sm font-bold text-gray-600 hover:text-purple-900 underline cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
        >
          Agora não
        </button>
      </div>
    </Modal>
  );
}

// ============================
// CONTEÚDO ABERTO (um dos 3 liberados)
// ============================
function Categorias({ categorias, badge }) {
  if (!categorias?.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5 mb-3" aria-label="Categorias">
      {categorias.map((c) => (
        <li
          key={c.id}
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${badge}`}
        >
          {c.nome}
        </li>
      ))}
    </ul>
  );
}

function ModalConteudo({ secao, item, onFechar }) {
  const tema = TEMAS[secao.tipo];

  const abrirPdf = () => {
    if (item.arquivo_pdf) {
      window.open(
        `${item.arquivo_pdf}#toolbar=0`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <Modal titulo={item.titulo} onFechar={onFechar} largura="max-w-2xl">
      <Categorias categorias={item.categorias} badge={tema.badge} />

      {/* VÍDEO */}
      {secao.tipo === "video" && item.arquivo && (
        <video
          controls
          controlsList="nodownload"
          preload="metadata"
          className="w-full max-h-[55dvh] rounded-xl bg-black"
        >
          <source src={item.arquivo} type="video/mp4" />
          Seu navegador não suporta a reprodução de vídeo.
        </video>
      )}

      {/* SUGESTÃO: capa */}
      {secao.tipo === "sugestao" && (
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-teal-700">
          <span aria-hidden="true">{infoTipoSugestao(item.tipo).emoji}</span>
          <span>{infoTipoSugestao(item.tipo).label}</span>
        </div>
      )}
      {secao.tipo === "sugestao" && item.capa && (
        <img
          src={item.capa}
          alt=""
          className="mx-auto max-h-64 rounded-xl object-contain mb-3"
        />
      )}

      {/* AUTOAJUDA: imagem ou vídeo */}
      {secao.tipo === "autoajuda" &&
        item.midia &&
        (item.tipo_midia === "imagem" ? (
          <img
            src={item.midia}
            alt={`Imagem: ${item.titulo}`}
            className="mx-auto max-h-[55dvh] rounded-xl object-contain"
          />
        ) : (
          <video
            src={item.midia}
            controls
            controlsList="nodownload"
            preload="metadata"
            className="w-full max-h-[55dvh] rounded-xl bg-black"
          />
        ))}

      {item.descricao && (
        <p className="text-sm text-gray-700 leading-relaxed mt-3 whitespace-pre-line wrap-break-word">
          {item.descricao}
        </p>
      )}

      {/* ARTIGO: abre o PDF em nova aba (mesmo comportamento da tela de artigo) */}
      {secao.tipo === "artigo" && item.arquivo_pdf && (
        <button
          type="button"
          onClick={abrirPdf}
          className="mt-5 inline-flex items-center gap-2 bg-purple-900 text-white px-5 py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
        >
          <FileText size={18} />
          Abrir artigo (PDF)
          <span className="sr-only">(abre em nova aba)</span>
        </button>
      )}

      {/* SUGESTÃO: link externo */}
      {secao.tipo === "sugestao" && item.link_externo && (
        <a
          href={item.link_externo}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 bg-teal-700 text-white px-5 py-3 rounded-full font-bold shadow-md hover:bg-teal-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
        >
          <ExternalLink size={18} />
          {acaoExternaLabel(item.tipo)}
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      )}
    </Modal>
  );
}

// ============================
// CARD DE PRÉVIA (mesmo visual das telas de listagem, sem favoritar)
// Celular: horizontal compacto. A partir de sm: vertical.
// ============================
function CardPrevia({ secao, item, onAbrir }) {
  const tema = TEMAS[secao.tipo];
  const rotulo = `${secao.rotuloAbrir}: ${item.titulo}`;

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // evita rolar a página com a barra de espaço
      onAbrir();
    }
  };

  // Miniatura de cada tipo (sem baixar vídeo: só ícone, o vídeo carrega ao abrir)
  let miniatura = null;
  if (secao.tipo === "video") {
    miniatura = (
      <div
        aria-hidden="true"
        className={`relative shrink-0 w-28 sm:w-full sm:aspect-video ${tema.fundoMidia} flex items-center justify-center border-r sm:border-r-0 sm:border-b border-gray-100`}
      >
        <Film
          size={32}
          className="text-purple-300/60 group-hover:scale-125 transition-transform motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
    );
  } else if (secao.tipo === "artigo") {
    miniatura = (
      <div
        aria-hidden="true"
        className="sm:hidden shrink-0 w-14 bg-orange-50 border-r border-orange-100 flex items-center justify-center"
      >
        <FileText size={24} className="text-[#ff7300]" />
      </div>
    );
  } else if (secao.tipo === "sugestao") {
    miniatura = (
      <div
        aria-hidden="true"
        className={`relative shrink-0 w-24 min-h-36 sm:min-h-0 sm:w-full sm:aspect-video ${tema.fundoMidia} flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-gray-100`}
      >
        {item.capa ? (
          <img
            src={item.capa}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <Lightbulb size={32} className="text-teal-300/60" />
        )}
      </div>
    );
  } else {
    miniatura = (
      <div
        aria-hidden="true"
        className={`relative shrink-0 w-28 sm:w-full sm:aspect-video ${tema.fundoMidia} flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-gray-100`}
      >
        {item.tipo_midia === "imagem" && item.midia ? (
          <img
            src={item.midia}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="bg-black/40 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
            <Play size={20} className="text-white fill-white ml-0.5" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={rotulo}
      onClick={onAbrir}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer bg-white text-black shadow-2xl rounded-2xl border ${tema.borda} overflow-hidden flex flex-row sm:flex-col sm:justify-between transition-all ${tema.sombra} hover:scale-[1.03] duration-300 group focus-visible:outline-none focus-visible:ring-2 ${tema.foco} motion-reduce:transition-none motion-reduce:hover:scale-100`}
    >
      {miniatura}

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="p-3 sm:p-5">
          {secao.tipo === "sugestao" && (
            <p className="text-[10px] font-black uppercase tracking-wider text-teal-700 mb-1">
              <span aria-hidden="true">
                {infoTipoSugestao(item.tipo).emoji}
              </span>{" "}
              {infoTipoSugestao(item.tipo).label}
            </p>
          )}

          <h3
            className={`text-base sm:text-lg font-black text-purple-950 tracking-wide leading-snug line-clamp-2 transition ${tema.titulo}`}
          >
            {item.titulo}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3">
            {item.descricao || "Sem descrição disponível."}
          </p>
        </div>

        {item.categorias?.length > 0 && (
          <div className="px-3 pb-3 pt-2 sm:px-5 sm:pb-5 border-t border-gray-50 flex flex-wrap gap-1 overflow-hidden">
            {item.categorias.slice(0, 2).map((c) => (
              <span
                key={c.id}
                className={`max-w-full truncate text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${tema.badge}`}
              >
                {c.nome}
              </span>
            ))}
            {item.categorias.length > 2 && (
              <span className="self-center text-[10px] font-bold text-gray-500">
                +{item.categorias.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================
// CABEÇALHO DO VISITANTE (sem menu: só entrar / cadastrar)
// ============================
const botaoBase =
  "rounded-lg shadow-md transition flex items-center gap-2 font-semibold text-sm px-3 sm:px-4 py-2 cursor-pointer " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]";

function CabecalhoVisitante() {
  const navigate = useNavigate();

  return (
    <header className="bg-[#3a0b6d] shadow-lg">
      <div className="flex justify-between items-center gap-3 px-4 sm:px-8 py-4">
        <div className="text-2xl font-bold text-[#ff7300] tracking-wide">
          MindUp
        </div>

        <nav
          aria-label="Acesso à conta"
          className="flex items-center gap-2 sm:gap-4"
        >
          <button
            type="button"
            onClick={() => navigate("/login")}
            className={`${botaoBase} bg-[#7a00c1] hover:bg-[#8c00db] text-white`}
          >
            <LogIn size={18} className="text-[#ff7300]" aria-hidden="true" />
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/cadastro")}
            className={`${botaoBase} bg-[#ffb300] hover:bg-[#ffc233] text-purple-950 font-black`}
          >
            <UserPlus size={18} aria-hidden="true" />
            <span>Cadastrar</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

// ============================
// PÁGINA
// ============================
export default function Visitante() {
  const navigate = useNavigate();
  const { autenticado, carregando: carregandoAuth } = useAuth();

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // null | { tipo: "aviso" } | { tipo: "conteudo", secao, item }
  const [modal, setModal] = useState(null);

  // Quem já está logado não precisa da prévia
  useEffect(() => {
    if (!carregandoAuth && autenticado) {
      navigate("/inicial", { replace: true });
    }
  }, [carregandoAuth, autenticado, navigate]);

  const carregar = useCallback(async (signal) => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await api.get("/visitante/conteudos", { signal });
      setDados(resp.data?.data ?? {});
    } catch (e) {
      if (e.code === "ERR_CANCELED") return;
      setErro({ foiTimeout: !!e.foiTimeout });
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (carregandoAuth || autenticado) return;
    const controller = new AbortController();
    carregar(controller.signal);
    return () => controller.abort();
  }, [carregandoAuth, autenticado, carregar]);

  const abrirAviso = () => setModal({ tipo: "aviso" });
  const fecharModal = () => setModal(null);

  return (
    <div className="flex flex-col min-h-dvh bg-linear-to-br from-[#5b1aa0] to-[#a64bf4] text-white">
      <CabecalhoVisitante />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto animate-fadeIn">
          {/* BOAS-VINDAS */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wide drop-shadow-md">
              Conheça o MindUp 💜
            </h1>
            <p className="text-purple-100 text-sm md:text-base mt-2 font-medium max-w-2xl mx-auto">
              Veja uma prévia dos conteúdos de saúde mental publicados por
              psicólogos cadastrados. Para acessar tudo, faça seu cadastro ou
              login.
            </p>
          </div>

          {/* CARREGANDO */}
          {(carregando || carregandoAuth) && !erro && (
            <div
              role="status"
              className="flex flex-col items-center justify-center py-16 animate-pulse"
            >
              <p className="text-xl font-bold tracking-wide">
                Carregando prévia dos conteúdos...
              </p>
            </div>
          )}

          {/* ERRO */}
          {erro && !carregando && (
            <div
              role="alert"
              className="bg-red-900/90 border border-red-500 rounded-2xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-center max-w-2xl mx-auto"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <AlertTriangle
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />
                {erro.foiTimeout
                  ? "O servidor demorou para responder. Ele pode estar iniciando, tente novamente em instantes."
                  : "Não conseguimos carregar a prévia agora. Tente novamente em instantes."}
              </span>
              <button
                type="button"
                onClick={() => carregar()}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
              >
                <RotateCw size={12} aria-hidden="true" />
                Tentar novamente
              </button>
            </div>
          )}

          {/* SEÇÕES */}
          {dados && !carregando && !erro && (
            <div className="flex flex-col gap-10 sm:gap-14">
              {SECOES.map((secao) => {
                const itens = dados[secao.chave] ?? [];
                const tema = TEMAS[secao.tipo];
                const Icone = secao.Icone;
                const idTitulo = `secao-${secao.chave}`;

                return (
                  <section key={secao.chave} aria-labelledby={idTitulo}>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 border-b border-purple-300/30">
                      <span
                        aria-hidden="true"
                        className={`${tema.chip} w-9 h-9 rounded-lg flex items-center justify-center ring-1 ring-white/30 shadow-md`}
                      >
                        <Icone size={20} className="text-white" />
                      </span>
                      <h2
                        id={idTitulo}
                        className="text-xl sm:text-2xl font-black tracking-wide drop-shadow-md"
                      >
                        {secao.titulo}
                      </h2>
                    </div>

                    {itens.length === 0 ? (
                      <p className="bg-white/10 border border-white/10 rounded-2xl p-6 text-center text-sm font-semibold text-purple-100">
                        {secao.vazio}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 items-stretch">
                        {itens.map((item) => (
                          <CardPrevia
                            key={item.id}
                            secao={secao}
                            item={item}
                            onAbrir={() =>
                              setModal({ tipo: "conteudo", secao, item })
                            }
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex justify-center mt-5 sm:mt-6">
                      <button
                        type="button"
                        onClick={abrirAviso}
                        aria-haspopup="dialog"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 px-5 py-3 rounded-xl text-sm font-black tracking-wide transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb300]"
                      >
                        <Lock size={16} aria-hidden="true" />
                        {secao.verMais}
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {modal?.tipo === "aviso" && <ModalAviso onFechar={fecharModal} />}
      {modal?.tipo === "conteudo" && (
        <ModalConteudo
          secao={modal.secao}
          item={modal.item}
          onFechar={fecharModal}
        />
      )}
    </div>
  );
}
