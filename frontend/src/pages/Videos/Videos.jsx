import { useState } from "react";
import { useNavigate } from "react-router";
import { useVideos } from "../../context/VideosContext";
import { Search, Heart, Film, Tag } from "lucide-react";

export default function Videos() {
  const navigate = useNavigate();
  const { videos, categorias, carregando, alternarFavoritoVideo } = useVideos();

  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
        <div className="text-xl font-bold text-white tracking-wide">
          Carregando galeria multimídia...
        </div>
      </div>
    );
  }

  // Lógica de Filtragem Cruzada (Filtra por título AND por categoria se houver uma selecionada)
  const filtrados = videos.filter((v) => {
    const bateBusca = v.titulo.toLowerCase().includes(busca.toLowerCase());

    if (!categoriaSelecionada) return bateBusca;

    // Verifica se o vídeo possui o ID da categoria selecionada dentro do seu array de categorias vindo do Laravel
    const possuiCategoria = v.categorias?.some(
      (cat) => cat.id === categoriaSelecionada,
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

      {/* BARRA DE BUSCA COM DESIGN REFINADO */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-xl group">
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
      </div>

      {/* COMPONENTE DE FILTROS INTELIGENTES (CATEGORIAS) */}
      <div className="mb-10 w-full">
        <div className="flex items-center gap-1.5 text-xs font-black text-purple-200 uppercase tracking-widest mb-3">
          <Tag size={12} />
          <span>Filtrar por Categoria:</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Botão "Todos" */}
          <button
            onClick={() => setCategoriaSelecionada(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer ${
              categoriaSelecionada === null
                ? "bg-[#ff7300] text-white"
                : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
            }`}
          >
            Todos
          </button>

          {/* Renderiza as categorias reais vindas do PostgreSQL */}
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaSelecionada(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer ${
                categoriaSelecionada === cat.id
                  ? "bg-[#ff7300] text-white"
                  : "bg-white/90 text-purple-950 hover:bg-white border border-purple-100"
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE CARDS RESPONSIVOS INTELIGENTES (Ajuste Mobile First) */}
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
            {/* Bloco Superior: Player de Pré-visualização ou Thumbnail Estilizado */}
            <div>
              <div className="w-full aspect-video bg-purple-950 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                {/* Ícone central discreto de Cinema simulando uma capa de player */}
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

              {/* Corpo de Texto */}
              <div className="p-5">
                <h3 className="text-lg font-black text-purple-950 tracking-wide line-clamp-1 group-hover:text-purple-700 transition">
                  {video.titulo}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {video.descricao || "Sem descrição disponível."}
                </p>
              </div>
            </div>

            {/* Bloco Inferior: Categorias anexadas e Ação de Favoritar */}
            <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between gap-4">
              {/* Lista horizontal das subcategorias anexadas ao vídeo (Mostra a primeira) */}
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

              {/* Botão do Coração Laranja com Bloqueio de Clique no Card (e.stopPropagation) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); //vBloqueia o redirecionamento para o player ao clicar no coração
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
