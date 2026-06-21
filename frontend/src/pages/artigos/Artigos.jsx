import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useArtigos } from "../../context/ArtigosContext";
import { useVideos } from "../../context/VideosContext";
import { Search, Heart, BookOpen, Filter, X } from "lucide-react";

export default function Artigos() {
  const navigate = useNavigate();
  const { artigos, carregando, alternarFavoritoArtigo } = useArtigos();
  const { categorias } = useVideos();

  const [busca, setBusca] = useState("");
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
          Carregando acervo de leitura...
        </div>
      </div>
    );
  }

  const handleAlternarCategoria = (id) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const filtrados = artigos.filter((a) => {
    const bateBusca = a.titulo.toLowerCase().includes(busca.toLowerCase());
    if (categoriasSelecionadas.length === 0) return bateBusca;
    const possuiCategoria = a.categorias?.some((cat) =>
      categoriasSelecionadas.includes(cat.id),
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

      {/* BARRA DE BUSCA + BOTÃO DE FILTROS */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-xl flex gap-3 items-center">
          <div className="relative flex-1">
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
              <div className="flex flex-wrap gap-1 mb-4">
                {artigo.categorias?.slice(0, 2).map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-black uppercase tracking-widest text-[#ff7300] bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-md"
                  >
                    {c.nome}
                  </span>
                ))}
              </div>

              <h2 className="text-lg font-black text-purple-950 uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-purple-700 transition">
                {artigo.titulo}
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-3">
                {artigo.descricao ||
                  "Clique para abrir e visualizar os detalhes completos e resumo deste material de leitura."}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
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
