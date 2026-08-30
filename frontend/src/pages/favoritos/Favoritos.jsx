import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useFavoritos } from "../../context/FavoritosContext";
import { useVideos } from "../../context/VideosContext";
import { Heart, Filter, X, Play, Film } from "lucide-react";

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

  const handleAlternarCategoria = (id) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
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
      {/* CABEÇALHO */}
      <header className="mb-8 pb-4 border-b border-purple-300/30">
        <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-md flex items-center gap-3">
          <Heart size={28} className="fill-white/90" />
          Meus Favoritos
        </h1>
        <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
          Tudo que você salvou em um só lugar — vídeos, artigos, sugestões e
          conteúdos de autoajuda.
        </p>
      </header>

      {/* FILTRO POR TIPO DE CONTEÚDO */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          onClick={() => setTipoSelecionado(null)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
            tipoSelecionado === null
              ? "bg-white text-purple-950 border-white shadow-md"
              : "bg-white/10 border-white/10 text-purple-200 hover:bg-white/20"
          }`}
        >
          Todos
        </button>
        {Object.entries(CONFIG_TIPO).map(([chave, cfg]) => (
          <button
            key={chave}
            onClick={() => setTipoSelecionado(chave)}
            style={
              tipoSelecionado === chave
                ? { backgroundColor: cfg.cor, borderColor: cfg.cor }
                : {}
            }
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer flex items-center gap-1.5 ${
              tipoSelecionado === chave
                ? "text-white shadow-md"
                : "bg-white/10 border-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            <span>{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* FILTRO POR CATEGORIA */}
      <div className="flex justify-center mb-10">
        <div className="relative" ref={painelRef}>
          <button
            onClick={() => setPainelAberto((v) => !v)}
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

          {painelAberto && (
            <div className="absolute left-1/2 -translate-x-1/2 top-14 w-96 bg-white border border-purple-100 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider">
                  Filtrar por Tema
                </h3>
                <button
                  onClick={() => setPainelAberto(false)}
                  className="text-gray-400 hover:text-red-500 cursor-pointer"
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

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {filtrados.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-sm mx-auto mt-6 shadow-xl">
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

        {filtrados.map((fav) => {
          const cfg = CONFIG_TIPO[fav.tipo];
          const conteudo = fav.conteudo;
          if (!cfg || !conteudo) return null;

          const midia = capaDoConteudo(fav.tipo, conteudo);

          return (
            <div
              key={`${fav.tipo}-${conteudo.id}`}
              onClick={() => navigate(`${cfg.rota}/${conteudo.id}`)}
              className="cursor-pointer bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.03] duration-300 group border"
              style={{ borderColor: `${cfg.cor}20` }}
            >
              <div>
                {/* Capa / prévia */}
                <div
                  className="w-full aspect-video relative flex items-center justify-center overflow-hidden border-b border-gray-100"
                  style={{ backgroundColor: `${cfg.cor}` }}
                >
                  {midia.url ? (
                    midia.tipoMidia === "video" ? (
                      <>
                        <div className="absolute z-20 bg-black/40 w-11 h-11 rounded-full flex items-center justify-center">
                          <Play
                            size={18}
                            className="text-white fill-white ml-0.5"
                          />
                        </div>
                        <video
                          className="w-full h-full object-cover opacity-80 pointer-events-none"
                          muted
                          preload="metadata"
                        >
                          <source src={midia.url} type="video/mp4" />
                        </video>
                      </>
                    ) : (
                      <img
                        src={midia.url}
                        alt={conteudo.titulo}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />
                    )
                  ) : (
                    <span className="text-4xl">{cfg.emoji}</span>
                  )}

                  <div
                    className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white backdrop-blur-sm"
                    style={{ backgroundColor: `${cfg.cor}e6` }}
                  >
                    <span>{cfg.emoji}</span>
                    <span>{cfg.label.replace(/s$/, "")}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {conteudo.categorias?.slice(0, 2).map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border"
                        style={{
                          color: cfg.cor,
                          backgroundColor: `${cfg.cor}0d`,
                          borderColor: `${cfg.cor}33`,
                        }}
                      >
                        {c.nome}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-lg font-black text-purple-950 uppercase tracking-wide leading-snug line-clamp-2 transition">
                    {conteudo.titulo}
                  </h2>

                  <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-2">
                    {conteudo.descricao || "Clique para ver o conteúdo."}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    alternarFavorito(fav.tipo, conteudo.id);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center justify-center cursor-pointer border border-gray-100 shrink-0"
                  title="Remover dos favoritos"
                >
                  <Heart size={16} className="fill-red-500 text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
