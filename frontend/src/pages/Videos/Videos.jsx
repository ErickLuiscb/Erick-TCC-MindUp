import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useVideos } from "../../context/VideosContext";
import { Search, Heart, Film, Filter, X } from "lucide-react";

export default function Videos() {
  const navigate = useNavigate();
  const { videos, categorias, carregando, alternarFavoritoVideo } = useVideos();

  const [busca, setBusca] = useState("");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [painelAberto, setPainelAberto] = useState(false);
  const painelRef = useRef(null);

  // Fecha o painel ao clicar fora
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
          Carregando galeria multimídia...
        </div>
      </div>
    );
  }

  const handleAlternarCategoria = (id) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const filtrados = videos.filter((v) => {
    const bateBusca = v.titulo.toLowerCase().includes(busca.toLowerCase());
    if (categoriasSelecionadas.length === 0) return bateBusca;
    const possuiCategoria = v.categorias?.some((cat) =>
      categoriasSelecionadas.includes(cat.id),
    );
    return bateBusca && possuiCategoria;
  });

  return (
    <div className="max-w-6xl mx-auto p-2 animate-fadeIn text-black">
      {/* CABEÇALHO */}
      <header className="mb-8 pb-4 border-b border-purple-300/30">
        <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-md">
          Vídeos Educativos 🎬
        </h1>
        <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
          Assista a orientações, exercícios e conteúdos curados por
          profissionais da saúde mental.
        </p>
      </header>

      {/* BARRA DE BUSCA + BOTÃO DE FILTROS */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-xl flex gap-3 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar conteúdos por título..."
              className="w-full pl-5 pr-12 py-3.5 bg-white border border-purple-100 rounded-2xl shadow-xl text-sm font-semibold text-black focus:outline-3 focus:outline-[#ffb300] placeholder-gray-400 transition"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <div className="absolute right-4 top-3.5 text-purple-700">
              <Search size={20} />
            </div>
          </div>

          {/* Botão de Filtros */}
          <div className="relative" ref={painelRef}>
            <button
              onClick={() => setPainelAberto((v) => !v)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer border ${
                categoriasSelecionadas.length > 0
                  ? "bg-[#ff7300] border-orange-400 text-white"
                  : "bg-white text-purple-950 border-purple-100 hover:bg-purple-50"
              }`}
            >
              <Filter size={16} />
              <span>
                Filtros{" "}
                {categoriasSelecionadas.length > 0 &&
                  `(${categoriasSelecionadas.length})`}
              </span>
            </button>

            {/* PAINEL FLUTUANTE */}
            {painelAberto && (
              <div className="absolute right-0 top-14 w-96 bg-white border border-purple-100 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-black uppercase text-purple-700 tracking-wider">
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
                          ? "bg-purple-100 border-purple-300 text-purple-950"
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
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {filtrados.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-sm mx-auto mt-6 shadow-xl">
            <p className="text-xl font-bold text-white">
              🎬 Nenhum vídeo encontrado
            </p>
            <p className="text-purple-200 text-xs mt-1">
              Experimente alterar o termo digitado ou limpar o filtro de
              categoria.
            </p>
          </div>
        )}

        {filtrados.map((video) => (
          <div
            key={video.id}
            onClick={() => navigate(`/videos/${video.id}`)}
            className="cursor-pointer bg-white shadow-2xl rounded-2xl border border-purple-50 overflow-hidden flex flex-col justify-between transition-all hover:shadow-purple-950/20 hover:scale-[1.03] duration-300 group"
          >
            <div>
              <div className="w-full aspect-video bg-purple-950 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                <Film
                  size={36}
                  className="text-purple-300/40 absolute z-10 group-hover:scale-125 transition-transform"
                />
                <video
                  className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                  muted
                  preload="metadata"
                >
                  <source src={video.arquivo} type="video/mp4" />
                </video>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-black text-purple-950 tracking-wide line-clamp-1 group-hover:text-purple-700 transition">
                  {video.titulo}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {video.descricao || "Sem descrição disponível."}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1 max-w-[70%] overflow-hidden truncate">
                {video.categorias?.slice(0, 2).map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/50"
                  >
                    {c.nome}
                  </span>
                ))}
                {video.categorias?.length > 2 && (
                  <span className="text-[9px] font-bold text-gray-400">
                    +{video.categorias.length - 2}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarFavoritoVideo(video.id);
                }}
                className="p-2 bg-orange-50 hover:bg-orange-100 rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer border border-orange-100/50 group/fav"
              >
                <Heart
                  size={18}
                  className={`transition-all transform active:scale-75 duration-200 ${
                    video.favoritado
                      ? "text-[#ff7300] fill-[#ff7300] scale-110"
                      : "text-gray-400 group-hover/fav:text-[#ff7300]"
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
