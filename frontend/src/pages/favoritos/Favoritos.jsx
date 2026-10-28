import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useFavoritos } from "../../context/FavoritosContext";
import { useVideos } from "../../context/VideosContext";
import { Heart, Filter, X, Play, Film, ArrowLeft } from "lucide-react";

// Configuração visual por tipo — reaproveita a cor e o rótulo que cada
// módulo já tem em sua própria tela, pra não inventar uma identidade nova.
const CONFIG_TIPO = {
  video: { label: "Vídeos", emoji: "🎬", cor: "#7a00c1", rota: "/videos" },
  artigo: { label: "Artigos", emoji: "📖", cor: "#ff7300", rota: "/artigos" },
  sugestao: {
    label: "Sugestões",
    emoji: "💡",
    cor: "#13b5a2",
    rota: "/sugestoes",
  },
  autoajuda: {
    label: "Autoajuda",
    emoji: "🌱",
    cor: "#1599cd",
    rota: "/autoajuda",
  },
};

function capaDoConteudo(tipo, conteudo) {
  if (tipo === "video") return { tipoMidia: "video", url: conteudo.arquivo };
  if (tipo === "sugestao") return { tipoMidia: "imagem", url: conteudo.capa };
  if (tipo === "autoajuda")
    return { tipoMidia: conteudo.tipo_midia, url: conteudo.midia };
  return { tipoMidia: null, url: null }; // artigo (PDF) não tem capa visual
}

// Chips de categoria (máx. 2 + "+N"). Usado em dois lugares do card:
// em cima do título (desktop) e no rodapé, ao lado do coração (celular).
function ChipsCategorias({ categorias, cor, className, chipClassName }) {
  const lista = categorias?.slice(0, 2) ?? [];
  const resto = (categorias?.length ?? 0) - 2;
  return (
    <div className={className}>
      {lista.map((c) => (
        <span
          key={c.id}
          className={chipClassName}
          style={{
            color: cor,
            backgroundColor: `${cor}0d`,
            borderColor: `${cor}33`,
          }}
        >
          {c.nome}
        </span>
      ))}
      {resto > 0 && (
        <span className="self-center text-[10px] font-bold text-gray-500">
          +{resto}
        </span>
      )}
    </div>
  );
}

export default function Favoritos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { favoritos, carregando, carregarFavoritos, alternarFavorito } =
    useFavoritos();
  const { categorias } = useVideos();

  const [tipoSelecionado, setTipoSelecionado] = useState(
    searchParams.get("tipo") || null,
  );
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [painelAberto, setPainelAberto] = useState(false);
  const painelRef = useRef(null);
  const botaoTemasRef = useRef(null);

  // Sempre busca de novo ao entrar na tela — garante que a lista reflete
  // o que foi favoritado/desfavoritado em qualquer outra tela do app.
  useEffect(() => {
    carregarFavoritos();
  }, []);

  useEffect(() => {
    function handleClickFora(e) {
      if (painelRef.current && !painelRef.current.contains(e.target)) {
        setPainelAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // Esc fecha o painel e devolve o foco ao botão "Temas"
  // (só escuta o teclado enquanto o painel estiver aberto)
  useEffect(() => {
    if (!painelAberto) return;
    function handleEsc(e) {
      if (e.key === "Escape") {
        setPainelAberto(false);
        botaoTemasRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [painelAberto]);

  const handleAlternarCategoria = (id) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  if (carregando) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center pt-20 animate-pulse"
      >
        <div className="text-xl font-bold text-white tracking-wide">
          Reunindo seus favoritos...
        </div>
      </div>
    );
  }

  const filtrados = favoritos.filter((f) => {
    const bateTipo = !tipoSelecionado || f.tipo === tipoSelecionado;
    const bateCategoria =
      categoriasSelecionadas.length === 0 ||
      f.conteudo?.categorias?.some((cat) =>
        categoriasSelecionadas.includes(cat.id),
      );
    return bateTipo && bateCategoria;
  });

  return (
    <div className="max-w-6xl mx-auto p-2 animate-fadeIn text-black">
      {/* Botão de voltar à tela inicial */}
      <button
        type="button"
        onClick={() => navigate("/inicial")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-4 sm:mb-6 group transition-colors cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar ao Início</span>
      </button>

      {/* CABEÇALHO */}
      <header className="mb-6 sm:mb-8 pb-4 border-b border-purple-300/30">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-md flex items-center gap-3">
          <Heart size={28} className="fill-white/90" />
          Meus Favoritos
        </h1>
        <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
          Tudo que você salvou em um só lugar — vídeos, artigos, sugestões e
          conteúdos de autoajuda.
        </p>
      </header>

      {/* FILTRO POR TIPO DE CONTEÚDO */}
      <div
        role="group"
        aria-label="Filtrar por tipo de conteúdo"
        className="flex flex-wrap gap-2 mb-6 justify-center"
      >
        <button
          type="button"
          aria-pressed={tipoSelecionado === null}
          onClick={() => setTipoSelecionado(null)}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
            tipoSelecionado === null
              ? "bg-white text-purple-950 border-white shadow-md"
              : "bg-white/10 border-white/10 text-purple-200 hover:bg-white/20"
          }`}
        >
          Todos
        </button>
        {Object.entries(CONFIG_TIPO).map(([chave, cfg]) => (
          <button
            type="button"
            key={chave}
            aria-pressed={tipoSelecionado === chave}
            onClick={() => setTipoSelecionado(chave)}
            style={
              tipoSelecionado === chave
                ? { backgroundColor: cfg.cor, borderColor: cfg.cor }
                : {}
            }
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer flex items-center gap-1.5 ${
              tipoSelecionado === chave
                ? "text-white shadow-md"
                : "bg-white/10 border-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            <span aria-hidden="true">{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* FILTRO POR CATEGORIA */}
      <div className="flex justify-center mb-6 sm:mb-10">
        <div className="relative" ref={painelRef}>
          <button
            type="button"
            ref={botaoTemasRef}
            onClick={() => setPainelAberto((v) => !v)}
            aria-expanded={painelAberto}
            aria-controls="painel-filtros-favoritos"
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer border ${
              categoriasSelecionadas.length > 0
                ? "bg-[#ffb300] border-amber-400 text-purple-950"
                : "bg-white text-purple-950 border-purple-100 hover:bg-purple-50"
            }`}
          >
            <Filter size={16} />
            <span>
              Temas{" "}
              {categoriasSelecionadas.length > 0 &&
                `(${categoriasSelecionadas.length})`}
            </span>
          </button>

          {/* PAINEL FLUTUANTE
              Largura = tela inteira menos as margens (2rem), limitada a 24rem
              (o w-96 antigo). Assim o painel nunca passa da borda no celular. */}
          {painelAberto && (
            <div
              id="painel-filtros-favoritos"
              className="absolute left-1/2 -translate-x-1/2 top-14 w-[calc(100vw-2rem)] max-w-96 bg-white border border-purple-100 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn"
            >
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <h2 className="text-xs font-black uppercase text-purple-800 tracking-wider">
                  Filtrar por Tema
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setPainelAberto(false);
                    botaoTemasRef.current?.focus();
                  }}
                  aria-label="Fechar filtros"
                  className="p-3 -m-3 text-gray-500 hover:text-red-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {categorias.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer select-none transition ${
                      categoriasSelecionadas.includes(cat.id)
                        ? "bg-purple-50 border-purple-300 text-purple-900"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={categoriasSelecionadas.includes(cat.id)}
                      onChange={() => handleAlternarCategoria(cat.id)}
                      className="rounded text-purple-700 focus:ring-purple-600"
                    />
                    <span>{cat.nome}</span>
                  </label>
                ))}
              </div>

              {categoriasSelecionadas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCategoriasSelecionadas([])}
                  className="mt-3 pt-2 border-t border-gray-100 w-full text-[11px] font-bold text-red-500 hover:underline cursor-pointer text-left"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quantidade de resultados, lida por leitores de tela quando o filtro muda */}
      <p role="status" className="sr-only">
        {filtrados.length} {filtrados.length === 1 ? "favorito" : "favoritos"}
      </p>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 items-stretch">
        {filtrados.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-sm mx-auto mt-6 shadow-xl">
            <p className="text-xl font-bold text-white">
              🤍 Nenhum favorito por aqui
            </p>
            <p className="text-purple-200 text-xs mt-1">
              {favoritos.length === 0
                ? "Explore os conteúdos e clique no coração para salvar aqui."
                : "Modifique os filtros selecionados para ver outros itens."}
            </p>
          </div>
        )}

        {/* CARD DE FAVORITO
            Celular (< sm): layout HORIZONTAL compacto — capa à esquerda, texto à
            direita; as categorias vão para o rodapé, ao lado do coração.
            sm em diante: layout VERTICAL de sempre. */}
        {filtrados.map((fav) => {
          const cfg = CONFIG_TIPO[fav.tipo];
          const conteudo = fav.conteudo;
          if (!cfg || !conteudo) return null;

          const midia = capaDoConteudo(fav.tipo, conteudo);
          const rotuloTipo = cfg.label.replace(/s$/, "");

          return (
            <div
              key={`${fav.tipo}-${conteudo.id}`}
              role="link"
              tabIndex={0}
              aria-label={`Abrir ${rotuloTipo.toLowerCase()}: ${conteudo.titulo}`}
              onClick={() => navigate(`${cfg.rota}/${conteudo.id}`)}
              onKeyDown={(e) => {
                // Enter abre o conteúdo, mas só se o foco estiver no próprio card
                // (não quando estiver no botão de remover, que fica dentro dele)
                if (e.key === "Enter" && e.target === e.currentTarget) {
                  navigate(`${cfg.rota}/${conteudo.id}`);
                }
              }}
              className="cursor-pointer bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-row sm:flex-col sm:justify-between transition-all hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100 duration-300 group border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
              style={{ borderColor: `${cfg.cor}20` }}
            >
              {/* Capa / prévia: coluna de 7rem no celular; largura total + 16:9 a partir de sm */}
              <div
                className="relative shrink-0 w-28 sm:w-full sm:aspect-video flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-gray-100"
                style={{ backgroundColor: `${cfg.cor}` }}
              >
                {midia.url ? (
                  midia.tipoMidia === "video" ? (
                    <>
                      <div className="absolute z-20 bg-black/40 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center">
                        <Play
                          size={18}
                          className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white fill-white ml-0.5"
                        />
                      </div>
                      <video
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
                        muted
                        preload="metadata"
                      >
                        <source src={midia.url} type="video/mp4" />
                      </video>
                    </>
                  ) : (
                    <img
                      src={midia.url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />
                  )
                ) : (
                  <span aria-hidden="true" className="text-3xl sm:text-4xl">
                    {cfg.emoji}
                  </span>
                )}

                {/* Selo do tipo: no celular só o emoji (o texto fica para leitores de tela) */}
                <div
                  className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-20 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white backdrop-blur-sm"
                  style={{ backgroundColor: `${cfg.cor}e6` }}
                >
                  <span aria-hidden="true">{cfg.emoji}</span>
                  <span className="sr-only sm:not-sr-only">{rotuloTipo}</span>
                </div>
              </div>

              {/* Coluna de texto */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="p-3 sm:p-5">
                  {/* Categorias sobre o título: só a partir de sm */}
                  <ChipsCategorias
                    categorias={conteudo.categorias}
                    cor={cfg.cor}
                    className="hidden sm:flex flex-wrap gap-1 mb-3"
                    chipClassName="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border"
                  />

                  <h2 className="text-sm sm:text-lg font-black text-purple-950 uppercase tracking-wide leading-snug line-clamp-2 transition">
                    {conteudo.titulo}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1 sm:mt-3 line-clamp-2">
                    {conteudo.descricao || "Clique para ver o conteúdo."}
                  </p>
                </div>

                <div className="px-3 pb-3 pt-1 sm:px-5 sm:pb-5 sm:pt-2 border-t-0 sm:border-t border-gray-50 flex items-center justify-between sm:justify-end gap-2">
                  {/* Categorias no rodapé: só no celular */}
                  <ChipsCategorias
                    categorias={conteudo.categorias}
                    cor={cfg.cor}
                    className="flex sm:hidden flex-wrap gap-1 min-w-0 flex-1"
                    chipClassName="max-w-full truncate text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      alternarFavorito(fav.tipo, conteudo.id);
                    }}
                    className="p-2.5 sm:p-2 hover:bg-gray-100 rounded-xl transition flex items-center justify-center cursor-pointer border border-gray-100 shrink-0"
                    title="Remover dos favoritos"
                    aria-label={`Remover dos favoritos: ${conteudo.titulo}`}
                  >
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
