import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSugestoes } from "../../context/SugestoesContext";
import { useVideos } from "../../context/VideosContext";
import { TIPOS_SUGESTAO } from "../../utils/sugestoes";
import { Search, Heart, Lightbulb, Filter, X } from "lucide-react";

export default function Sugestoes() {
  const navigate = useNavigate();
  const { sugestoes, carregando, alternarFavoritoSugestao } = useSugestoes();
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
          Reunindo indicações para você...
        </div>
      </div>
    );
  }

  const handleAlternarCategoria = (id) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const filtradas = sugestoes.filter((s) => {
    const bateBusca = s.titulo.toLowerCase().includes(busca.toLowerCase());
    const bateTipo = !tipoSelecionado || s.tipo === tipoSelecionado;
    const bateCategoria =
      categoriasSelecionadas.length === 0 ||
      s.categorias?.some((cat) => categoriasSelecionadas.includes(cat.id));
    return bateBusca && bateTipo && bateCategoria;
  });

  return (
    <div className="max-w-6xl mx-auto p-2 animate-fadeIn text-black">
      {/* CABEÇALHO */}
      <header className="mb-8 pb-4 border-b border-purple-300/30 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-md">
            Sugestões Culturais 💡
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Livros, filmes, séries, músicas e podcasts selecionados pelos
            profissionais para te inspirar, relaxar e refletir.
          </p>
        </div>
        <button
          onClick={() => navigate("/favoritos?tipo=sugestao")}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-200 hover:text-white transition shrink-0"
        >
          <Heart size={14} className="fill-current" />
          <span>Ver meus favoritos</span>
        </button>
      </header>

      {/* FILTRO POR TIPO (chips horizontais) */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          onClick={() => setTipoSelecionado(null)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
            tipoSelecionado === null
              ? "bg-[#13b5a2] border-teal-400 text-white shadow-md"
              : "bg-white/10 border-white/10 text-purple-200 hover:bg-white/20"
          }`}
        >
          Todos
        </button>
        {TIPOS_SUGESTAO.map((t) => (
          <button
            key={t.valor}
            onClick={() => setTipoSelecionado(t.valor)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer flex items-center gap-1.5 ${
              tipoSelecionado === t.valor
                ? "bg-[#13b5a2] border-teal-400 text-white shadow-md"
                : "bg-white/10 border-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
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

          {/* Botão de Filtros de categoria */}
          <div className="relative" ref={painelRef}>
            <button
              onClick={() => setPainelAberto((v) => !v)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer border ${
                categoriasSelecionadas.length > 0
                  ? "bg-[#13b5a2] border-teal-400 text-white"
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
                  <h3 className="text-xs font-black uppercase text-teal-700 tracking-wider">
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
                          ? "bg-teal-50 border-teal-300 text-teal-900"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={categoriasSelecionadas.includes(cat.id)}
                        onChange={() => handleAlternarCategoria(cat.id)}
                        className="rounded text-teal-700 focus:ring-teal-600"
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
        {filtradas.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-sm mx-auto mt-6 shadow-xl">
            <p className="text-xl font-bold text-white">
              💡 Nenhuma sugestão encontrada
            </p>
            <p className="text-purple-200 text-xs mt-1">
              Modifique os termos da busca ou os filtros selecionados.
            </p>
          </div>
        )}

        {filtradas.map((sugestao) => {
          const tipo = TIPOS_SUGESTAO.find((t) => t.valor === sugestao.tipo);
          return (
            <div
              key={sugestao.id}
              onClick={() => navigate(`/sugestoes/${sugestao.id}`)}
              className="cursor-pointer bg-white shadow-2xl rounded-2xl border border-teal-50 overflow-hidden flex flex-col justify-between transition-all hover:shadow-teal-950/20 hover:scale-[1.03] duration-300 group"
            >
              {/* Capa */}
              <div className="w-full aspect-video bg-teal-950 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                {sugestao.capa ? (
                  <img
                    src={sugestao.capa}
                    alt={sugestao.titulo}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <Lightbulb
                    size={32}
                    className="text-teal-300/40 group-hover:scale-110 transition-transform"
                  />
                )}

                {tipo && (
                  <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white bg-teal-700/90 backdrop-blur-sm">
                    <span>{tipo.emoji}</span>
                    <span>{tipo.label}</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {sugestao.categorias?.slice(0, 2).map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] font-black uppercase tracking-widest text-[#13b5a2] bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-md"
                      >
                        {c.nome}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-lg font-black text-purple-950 uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-teal-700 transition">
                    {sugestao.titulo}
                  </h2>

                  <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-2">
                    {sugestao.descricao || "Clique para ver os detalhes."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                    Por {sugestao.autor?.nome || "Profissional MindUp"}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      alternarFavoritoSugestao(sugestao.id);
                    }}
                    className="p-2 bg-teal-50 hover:bg-teal-100 rounded-xl transition flex items-center justify-center cursor-pointer border border-teal-100/50 group/fav shrink-0"
                  >
                    <Heart
                      size={16}
                      className={`transition-all transform active:scale-75 duration-200 ${
                        sugestao.favoritado
                          ? "text-[#13b5a2] fill-[#13b5a2] scale-110"
                          : "text-gray-400 group-hover/fav:text-[#13b5a2]"
                      }`}
                    />
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
