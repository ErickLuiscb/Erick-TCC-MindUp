import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useArtigos } from "../../context/ArtigosContext";
import { useVideos } from "../../context/VideosContext";
import { Search, Heart, BookOpen, Tag } from "lucide-react";

export default function Artigos() {
  const navigate = useNavigate();
  const { artigos, carregando, alternarFavoritoArtigo } = useArtigos();
  const { categorias } = useVideos();

  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
        <div className="text-xl font-bold text-white tracking-wide">
          Carregando acervo de leitura...
        </div>
      </div>
    );
  }

  // Filtro cruzado inteligente por título AND categoria
  const filtrados = artigos.filter((a) => {
    const bateBusca = a.titulo.toLowerCase().includes(busca.toLowerCase());
    if (!categoriaSelecionada) return bateBusca;
    const possuiCategoria = a.categorias?.some(
      (cat) => cat.id === categoriaSelecionada,
    );
    return bateBusca && possuiCategoria;
  });

  return (
    <div className="max-w-6xl mx-auto p-2 animate-fadeIn text-black">
      {/* CABEÇALHO */}
      <header className="mb-8 pb-4 border-b border-purple-300/30">
        <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-md">
          Artigos e Publicações 📄
        </h1>
        <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
          Explore leituras, pesquisas e materiais de apoio recomendados pelos
          profissionais de saúde mental.
        </p>
      </header>

      {/* BARRA DE BUSCA */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-xl group">
          <input
            type="text"
            placeholder="Buscar artigos por palavra-chave..."
            className="w-full pl-5 pr-12 py-3.5 bg-white border border-purple-100 rounded-2xl shadow-xl text-sm font-semibold text-black focus:outline-3 focus:outline-[#ffb300] placeholder-gray-400 transition"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="absolute right-4 top-3.5 text-purple-700">
            <Search size={20} />
          </div>
        </div>
      </div>

      {/* FILTRO POR CATEGORIAS */}
      <div className="mb-10 w-full">
        <div className="flex items-center gap-1.5 text-xs font-black text-purple-200 uppercase tracking-widest mb-3">
          <Tag size={12} />
          <span>Assuntos Disponíveis:</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
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
              {cat.nome.includes("-")
                ? cat.nome.split("-")[1]?.trim()
                : cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE CARDS RESPONSIVOS ESTILO PERSONARE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {filtrados.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-sm mx-auto mt-6 shadow-xl">
            <p className="text-xl font-bold text-white">
              📄 Nenhum artigo encontrado
            </p>
            <p className="text-purple-200 text-xs mt-1">
              Modifique os termos da busca ou filtre por outro assunto.
            </p>
          </div>
        )}

        {filtrados.map((artigo) => (
          <div
            key={artigo.id}
            onClick={() => navigate(`/artigos/${artigo.id}`)}
            className="cursor-pointer bg-white shadow-2xl rounded-2xl border border-purple-50 p-6 flex flex-col justify-between transition-all hover:shadow-purple-950/20 hover:scale-[1.03] duration-300 group"
          >
            <div>
              {/* Topo do Card: Categoria com Tag Colorida */}
              <div className="flex flex-wrap gap-1 mb-4">
                {artigo.categorias?.slice(0, 2).map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-black uppercase tracking-widest text-[#ff7300] bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-md"
                  >
                    {c.nome.includes("-")
                      ? c.nome.split("-")[0]?.trim()
                      : c.nome}
                  </span>
                ))}
              </div>

              {/* Título Chamativo (Inspirado no Exemplo) */}
              <h2 className="text-lg font-black text-purple-950 uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-purple-700 transition">
                {artigo.titulo}
              </h2>

              {/* Pequeno Resumo Embaixo */}
              <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-3">
                {artigo.descricao ||
                  "Clique para abrir e visualizar os detalhes completos e resumo deste material de leitura."}
              </p>
            </div>

            {/* Rodapé do Card: Autor, Foto e Botão Favoritar Coração Laranja */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              {/* Bloco do Autor com Foto */}
              <div className="flex items-center gap-2.5 max-w-[75%]">
                <img
                  src={artigo.autor?.imagem_perfil || "/default_perfil.png"}
                  alt="Autor"
                  className="w-7 h-7 rounded-full object-cover border border-purple-200 shrink-0"
                />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
                  Por {artigo.autor?.nome || "Profissional MindUp"}
                </span>
              </div>

              {/* Coração Laranja com e.stopPropagation para não ativar o clique do Card */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarFavoritoArtigo(artigo.id);
                }}
                className="p-2 bg-orange-50 hover:bg-orange-100 rounded-xl transition flex items-center justify-center cursor-pointer border border-orange-100/50 group/fav"
              >
                <Heart
                  size={16}
                  className={`transition-all transform active:scale-75 duration-200 ${
                    artigo.favoritado
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
