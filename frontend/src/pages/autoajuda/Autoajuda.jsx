import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAutoajuda } from "../../context/AutoajudaContext";
import { useVideos } from "../../context/VideosContext";
import { TIPOS_MIDIA_AUTOAJUDA } from "../../utils/autoajuda";
import { Search, Heart, Filter, X, Play } from "lucide-react";

export default function Autoajuda() {
  const navigate = useNavigate();
  const { autoajudas, carregando, alternarFavoritoAutoajuda } = useAutoajuda();
  const { categorias } = useVideos();

  const [busca, setBusca] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [painelAberto, setPainelAberto] = useState(false);
  const painelRef = useRef(null);

  useEffect(() => {
    function handleClickFora(e) {
      if (painelRef.current && !painelRef.current.contains(e.target)) {
        setPainelAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
        <div className="text-xl font-bold text-white tracking-wide">
          Reunindo conteúdos de apoio...
        </div>
      </div>
    );
  }

  const handleAlternarCategoria = (id) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const filtrados = autoajudas.filter((a) => {
    const bateBusca = a.titulo.toLowerCase().includes(busca.toLowerCase());
    const bateTipo = !tipoSelecionado || a.tipo_midia === tipoSelecionado;
    const bateCategoria =
      categoriasSelecionadas.length === 0 ||
      a.categorias?.some((cat) => categoriasSelecionadas.includes(cat.id));
    return bateBusca && bateTipo && bateCategoria;
  });

  return (
    <div className="max-w-6xl mx-auto p-2 animate-fadeIn text-black">
      {/* CABEÇALHO */}
      <header className="mb-8 pb-4 border-b border-purple-300/30">
        <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-md">
          Autoajuda 🌱
        </h1>
        <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
          Imagens e vídeos rápidos para te acompanhar em momentos difíceis do
          dia a dia.
        </p>
      </header>

      {/* FILTRO POR TIPO DE MÍDIA */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          onClick={() => setTipoSelecionado(null)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
            tipoSelecionado === null
              ? "bg-[#1599cd] border-sky-400 text-white shadow-md"
              : "bg-white/10 border-white/10 text-purple-200 hover:bg-white/20"
          }`}
        >
          Todos
        </button>
        {TIPOS_MIDIA_AUTOAJUDA.map((t) => (
          <button
            key={t.valor}
            onClick={() => setTipoSelecionado(t.valor)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer flex items-center gap-1.5 ${
              tipoSelecionado === t.valor
                ? "bg-[#1599cd] border-sky-400 text-white shadow-md"
                : "bg-white/10 border-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.label}s</span>
          </button>
        ))}
      </div>

      {/* BARRA DE BUSCA + BOTÃO DE FILTROS DE CATEGORIA */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-xl flex gap-3 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por título..."
              className="w-full pl-5 pr-12 py-3.5 bg-white border border-purple-100 rounded-2xl shadow-xl text-sm font-semibold text-black focus:outline-3 focus:outline-[#ffb300] placeholder-gray-400 transition"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <div className="absolute right-4 top-3.5 text-purple-700">
              <Search size={20} />
            </div>
          </div>

          <div className="relative" ref={painelRef}>
            <button
              onClick={() => setPainelAberto((v) => !v)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer border ${
                categoriasSelecionadas.length > 0
                  ? "bg-[#1599cd] border-sky-400 text-white"
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
              <div className="absolute right-0 top-14 w-96 bg-white border border-purple-100 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-black uppercase text-sky-700 tracking-wider">
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
                          ? "bg-sky-50 border-sky-300 text-sky-900"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={categoriasSelecionadas.includes(cat.id)}
                        onChange={() => handleAlternarCategoria(cat.id)}
                        className="rounded text-sky-700 focus:ring-sky-600"
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
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {filtrados.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-sm mx-auto mt-6 shadow-xl">
            <p className="text-xl font-bold text-white">
              🌱 Nenhum conteúdo encontrado
            </p>
            <p className="text-purple-200 text-xs mt-1">
              Modifique os termos da busca ou os filtros selecionados.
            </p>
          </div>
        )}

        {filtrados.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/autoajuda/${item.id}`)}
            className="cursor-pointer bg-white shadow-2xl rounded-2xl border border-sky-50 overflow-hidden flex flex-col justify-between transition-all hover:shadow-sky-950/20 hover:scale-[1.03] duration-300 group"
          >
            <div>
              <div className="w-full aspect-video bg-sky-950 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                {item.tipo_midia === "imagem" ? (
                  <img
                    src={item.midia}
                    alt={item.titulo}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <>
                    <div className="absolute z-20 bg-black/40 group-hover:bg-black/20 transition-colors w-12 h-12 rounded-full flex items-center justify-center">
                      <Play
                        size={20}
                        className="text-white fill-white ml-0.5"
                      />
                    </div>
                    <video
                      className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                      muted
                      preload="metadata"
                    >
                      <source src={item.midia} type="video/mp4" />
                    </video>
                  </>
                )}

                <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white bg-sky-700/90 backdrop-blur-sm">
                  <span>{item.tipo_midia === "imagem" ? "🖼️" : "🎬"}</span>
                  <span>
                    {item.tipo_midia === "imagem" ? "Imagem" : "Vídeo"}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.categorias?.slice(0, 2).map((c) => (
                    <span
                      key={c.id}
                      className="text-[10px] font-black uppercase tracking-widest text-[#1599cd] bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-md"
                    >
                      {c.nome}
                    </span>
                  ))}
                </div>

                <h2 className="text-lg font-black text-purple-950 uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-sky-700 transition">
                  {item.titulo}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-2">
                  {item.descricao || "Clique para ver o conteúdo completo."}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarFavoritoAutoajuda(item.id);
                }}
                className="p-2 bg-sky-50 hover:bg-sky-100 rounded-xl transition flex items-center justify-center cursor-pointer border border-sky-100/50 group/fav shrink-0"
              >
                <Heart
                  size={16}
                  className={`transition-all transform active:scale-75 duration-200 ${
                    item.favoritado
                      ? "text-[#1599cd] fill-[#1599cd] scale-110"
                      : "text-gray-400 group-hover/fav:text-[#1599cd]"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
