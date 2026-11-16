import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import { useVideos } from "../../../context/VideosContext";
import { infoTipoSugestao } from "../../../utils/sugestoes";
import {
  Plus,
  Edit3,
  Trash2,
  Lightbulb,
  ArrowLeft,
  Search,
  Filter,
  X,
} from "lucide-react";

export default function MinhasSugestoes() {
  const navigate = useNavigate();
  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // FILTRO (busca por título + categorias), igual às telas públicas.
  // As categorias vêm do BootstrapContext, via VideosContext.
  const { categorias } = useVideos();
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

  // ============================
  // CARREGAR SUGESTÕES DO AUTOR
  // ============================
  async function carregarSugestoes() {
    try {
      setCarregando(true);
      const resp = await api.get("/dashboard/sugestoes");
      setSugestoes(resp.data.data ?? resp.data ?? []);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar suas sugestões.");
    } finally {
      setCarregando(false);
    }
  }

  // ============================
  // EXCLUIR SUGESTÃO
  // ============================
  async function excluirSugestao(id, titulo) {
    const ok = window.confirm(
      `⚠️ ATENÇÃO: Tem certeza absoluta que deseja excluir permanentemente a sugestão:\n\n"${titulo}"?`,
    );

    if (!ok) return;

    try {
      await api.delete(`/sugestoes/${id}`);
      setSugestoes((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar remover a sugestão do servidor.");
    }
  }

  useEffect(() => {
    carregarSugestoes();
  }, []);

  if (carregando) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center pt-20 animate-pulse"
      >
        <div className="text-xl font-bold text-white tracking-wide">
          Buscando suas publicações...
        </div>
      </div>
    );
  }

  const handleAlternarCategoria = (id) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const filtrados = sugestoes.filter((x) => {
    const bateBusca = x.titulo.toLowerCase().includes(busca.toLowerCase());
    if (categoriasSelecionadas.length === 0) return bateBusca;
    const possuiCategoria = x.categorias?.some((cat) =>
      categoriasSelecionadas.includes(cat.id),
    );
    return bateBusca && possuiCategoria;
  });

  return (
    <div className="text-black max-w-7xl mx-auto animate-fadeIn p-2">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-4 sm:mb-6 group transition-colors cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar ao Painel</span>
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10 pb-4 border-b border-purple-300/30 text-white">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300]">
            Gerenciar Sugestões 💡
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Gerencie, edite ou remova suas indicações culturais.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/sugestoes/criar")}
          className="w-full sm:w-auto justify-center bg-[#ff3d00] hover:bg-[#ff5722] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 motion-reduce:transform-none flex items-center gap-2 text-sm tracking-wide cursor-pointer"
        >
          <Plus size={18} />
          <span>Criar Sugestão</span>
        </button>
      </div>

      {/* BARRA DE BUSCA + BOTÃO DE FILTROS (só aparece se já existir conteúdo) */}
      {sugestoes.length > 0 && (
        <div className="flex justify-center mb-6 sm:mb-10">
          <div className="relative w-full max-w-xl flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                aria-label="Buscar sugestões por título"
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
                type="button"
                onClick={() => setPainelAberto((v) => !v)}
                aria-expanded={painelAberto}
                aria-controls="painel-filtros-minhas-sugestoes"
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
                <div
                  id="painel-filtros-minhas-sugestoes"
                  className="absolute right-0 top-14 w-[calc(100vw-2rem)] max-w-96 bg-white border border-purple-100 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn"
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                    <h3 className="text-xs font-black uppercase text-purple-700 tracking-wider">
                      Filtrar por Tema
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPainelAberto(false)}
                      aria-label="Fechar filtros"
                      className="p-3 -m-3 text-gray-400 hover:text-red-500 cursor-pointer"
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
        </div>
      )}

      {sugestoes.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-md mx-auto mt-8 sm:mt-12 shadow-xl text-white">
          <p className="text-2xl mb-2" aria-hidden="true">
            💡
          </p>
          <h2 className="font-bold text-lg">Nenhuma sugestão publicada</h2>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Você ainda não indicou nenhum livro, filme ou outro conteúdo
            cultural. Clique no botão superior para começar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 items-stretch">
        {/* Existem conteúdos, mas nenhum combina com a busca/filtro */}
        {sugestoes.length > 0 && filtrados.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-sm mx-auto mt-6 shadow-xl text-white">
            <p className="text-xl font-bold">💡 Nenhuma sugestão encontrada</p>
            <p className="text-purple-200 text-xs mt-1">
              Experimente alterar o termo digitado ou limpar o filtro de
              categoria.
            </p>
          </div>
        )}

        {/* CARD DE SUGESTÃO
            Celular (< sm): layout HORIZONTAL com CAPA VERTICAL (proporção ~2:3,
            como pôster de filme ou capa de livro) à esquerda, texto e ações à direita.
            sm em diante: layout VERTICAL de sempre, com capa 16:9. */}
        {filtrados.map((sugestao) => {
          const tipo = infoTipoSugestao(sugestao.tipo);
          return (
            <article
              key={sugestao.id}
              className="bg-white rounded-2xl shadow-2xl border border-teal-50 overflow-hidden flex flex-row sm:flex-col sm:justify-between transition-all hover:shadow-teal-950/20 hover:scale-[1.02] motion-reduce:hover:scale-100 duration-300 group"
            >
              {/* Capa: no celular é uma coluna de 6rem com altura mínima de 9rem (2:3);
                  a partir de sm volta a largura total em 16:9 */}
              <div className="relative shrink-0 w-24 min-h-36 sm:min-h-0 sm:w-full sm:aspect-video bg-teal-950 flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-gray-100">
                {sugestao.capa ? (
                  <img
                    src={sugestao.capa}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <Lightbulb
                    size={32}
                    className="text-teal-300/30 absolute z-10 group-hover:scale-110 transition-transform"
                  />
                )}

                {/* Selo do tipo sobre a capa: só a partir de sm
                    (no celular o tipo aparece como texto acima do título) */}
                <div className="hidden sm:flex absolute top-3 right-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md items-center gap-1 text-white bg-teal-700/90">
                  <span>{tipo.emoji}</span>
                  <span>{tipo.label}</span>
                </div>
              </div>

              {/* Coluna de texto: título + descrição + categorias em cima, ações embaixo */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="p-3 sm:p-5">
                  <p className="sm:hidden text-[10px] font-black uppercase tracking-wider text-teal-700 mb-1">
                    <span aria-hidden="true">{tipo.emoji}</span> {tipo.label}
                  </p>

                  <h2 className="text-base sm:text-lg font-black text-purple-950 tracking-wide line-clamp-2 sm:line-clamp-1 group-hover:text-teal-700 transition">
                    {sugestao.titulo}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3 sm:bg-gray-50 sm:p-3 sm:rounded-xl sm:border sm:border-gray-100">
                    {sugestao.descricao || "Sem descrição informada."}
                  </p>

                  {/* (no celular, só as 2 primeiras categorias + contador; de sm em diante, todas) */}
                  <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
                    {sugestao.categorias?.map((c, i) => (
                      <span
                        key={c.id}
                        className={`max-w-full truncate text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 ${
                          i >= 2 ? "hidden sm:inline" : ""
                        }`}
                      >
                        {c.nome}
                      </span>
                    ))}
                    {sugestao.categorias?.length > 2 && (
                      <span className="sm:hidden self-center text-[10px] font-bold text-gray-500">
                        +{sugestao.categorias.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* (no celular, só os ícones; de sm em diante, ícone + texto) */}
                <div className="px-3 pb-3 pt-2 sm:px-5 sm:pb-5 sm:pt-3 border-t border-gray-100 flex justify-end gap-2 sm:gap-3">
                  <Link
                    to={`/dashboard/sugestoes/editar/${sugestao.id}`}
                    title="Editar sugestão"
                    aria-label={`Editar sugestão: ${sugestao.titulo}`}
                    className="px-3 py-3 sm:px-4 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-amber-100"
                  >
                    <Edit3 size={14} />
                    <span className="hidden sm:inline">Editar</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      excluirSugestao(sugestao.id, sugestao.titulo)
                    }
                    title="Excluir sugestão"
                    aria-label={`Excluir sugestão: ${sugestao.titulo}`}
                    className="px-3 py-3 sm:px-4 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-red-100 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
