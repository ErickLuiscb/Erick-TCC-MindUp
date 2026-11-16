import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import { useVideos } from "../../../context/VideosContext";
import {
  Plus,
  Edit3,
  Trash2,
  Film,
  ArrowLeft,
  Search,
  Filter,
  X,
} from "lucide-react";

export default function MeusVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
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
  // CARREGAR VÍDEOS DO AUTOR
  // ============================
  async function carregarVideos() {
    try {
      const resp = await api.get("/dashboard/videos");
      setVideos(resp.data.data ?? resp.data ?? []);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar seus vídeos.");
    } finally {
      setCarregando(false);
    }
  }

  // ============================
  // EXCLUIR VÍDEO
  // ============================
  async function excluirVideo(id, titulo) {
    const ok = window.confirm(
      `⚠️ ATENÇÃO: Tem certeza absoluta que deseja excluir permanentemente o vídeo:\n\n"${titulo}"?\n\nEsta ação apagará o arquivo físico do servidor.`,
    );

    if (!ok) return;

    try {
      await api.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar remover o vídeo do servidor.");
    }
  }

  useEffect(() => {
    carregarVideos();
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

  const filtrados = videos.filter((x) => {
    const bateBusca = x.titulo.toLowerCase().includes(busca.toLowerCase());
    if (categoriasSelecionadas.length === 0) return bateBusca;
    const possuiCategoria = x.categorias?.some((cat) =>
      categoriasSelecionadas.includes(cat.id),
    );
    return bateBusca && possuiCategoria;
  });

  return (
    <div className="text-black max-w-7xl mx-auto animate-fadeIn p-2">
      {/* Botão de voltar ao painel principal */}
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

      {/* TOPO DO CRUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10 pb-4 border-b border-purple-300/30 text-white">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300]">
            Gerenciar Vídeos 🎬
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Gerencie, edite ou remova suas publicações de psicoeducação.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/videos/criar")}
          className="w-full sm:w-auto justify-center bg-[#ff3d00] hover:bg-[#ff5722] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 motion-reduce:transform-none flex items-center gap-2 text-sm tracking-wide cursor-pointer"
        >
          <Plus size={18} />
          <span>Criar Vídeo</span>
        </button>
      </div>

      {/* BARRA DE BUSCA + BOTÃO DE FILTROS (só aparece se já existir conteúdo) */}
      {videos.length > 0 && (
        <div className="flex justify-center mb-6 sm:mb-10">
          <div className="relative w-full max-w-xl flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                aria-label="Buscar vídeos por título"
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
                aria-controls="painel-filtros-meus-videos"
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
                  id="painel-filtros-meus-videos"
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

      {/* ESTADO VAZIO */}
      {videos.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-md mx-auto mt-8 sm:mt-12 shadow-xl text-white">
          <p className="text-2xl mb-2" aria-hidden="true">
            📹
          </p>
          <h2 className="font-bold text-lg">Nenhum vídeo publicado</h2>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Você ainda não criou nenhum conteúdo em vídeo. Clique no botão
            superior para fazer sua primeira publicação.
          </p>
        </div>
      )}

      {/* GRID DE CARDS RESPONSIVOS (Proporção de Tela de Cinema Fixa) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 items-stretch">
        {/* Existem conteúdos, mas nenhum combina com a busca/filtro */}
        {videos.length > 0 && filtrados.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-sm mx-auto mt-6 shadow-xl text-white">
            <p className="text-xl font-bold">🎬 Nenhum vídeo encontrado</p>
            <p className="text-purple-200 text-xs mt-1">
              Experimente alterar o termo digitado ou limpar o filtro de
              categoria.
            </p>
          </div>
        )}

        {/* CARD DE VÍDEO
            Celular (< sm): layout HORIZONTAL compacto — miniatura à esquerda,
            texto e ações à direita (flex-row), como nas telas de conteúdo.
            sm em diante: layout VERTICAL de sempre (flex-col). */}
        {filtrados.map((video) => (
          <article
            key={video.id}
            className="bg-white rounded-2xl shadow-2xl border border-purple-50 overflow-hidden flex flex-row sm:flex-col sm:justify-between transition-all hover:shadow-purple-950/20 hover:scale-[1.02] motion-reduce:hover:scale-100 duration-300 group"
          >
            {/* Miniatura: coluna fixa de 7rem no celular; largura total + 16:9 a partir de sm */}
            <div className="relative shrink-0 w-28 sm:w-full sm:aspect-video bg-purple-950 flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-gray-100">
              <Film
                size={32}
                className="text-purple-300/30 absolute z-10 group-hover:scale-110 transition-transform"
              />

              <video
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                muted
                preload="metadata"
              >
                <source src={video.arquivo} type="video/mp4" />
              </video>
            </div>

            {/* Coluna de texto: título + descrição + categorias em cima, ações embaixo */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Informações de Texto */}
              <div className="p-3 sm:p-5">
                <h2 className="text-base sm:text-lg font-black text-purple-950 tracking-wide line-clamp-2 sm:line-clamp-1 group-hover:text-purple-700 transition">
                  {video.titulo}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3 sm:bg-gray-50 sm:p-3 sm:rounded-xl sm:border sm:border-gray-100">
                  {video.descricao || "Sem descrição informada."}
                </p>

                {/* Exibe as Categorias Vinculadas ao Vídeo
                    (no celular, só as 2 primeiras + contador; de sm em diante, todas) */}
                <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
                  {video.categorias?.map((c, i) => (
                    <span
                      key={c.id}
                      className={`max-w-full truncate text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 ${
                        i >= 2 ? "hidden sm:inline" : ""
                      }`}
                    >
                      {c.nome}
                    </span>
                  ))}
                  {video.categorias?.length > 2 && (
                    <span className="sm:hidden self-center text-[10px] font-bold text-gray-500">
                      +{video.categorias.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* BARRA DE AÇÕES DO CRUD COM DESIGN WEB LIMPO
                  (no celular, só os ícones; de sm em diante, ícone + texto) */}
              <div className="px-3 pb-3 pt-2 sm:px-5 sm:pb-5 sm:pt-3 border-t border-gray-100 flex justify-end gap-2 sm:gap-3">
                <Link
                  to={`/dashboard/videos/editar/${video.id}`}
                  title="Editar vídeo"
                  aria-label={`Editar vídeo: ${video.titulo}`}
                  className="px-3 py-3 sm:px-4 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-amber-100"
                >
                  <Edit3 size={14} />
                  <span className="hidden sm:inline">Editar</span>
                </Link>

                <button
                  type="button"
                  onClick={() => excluirVideo(video.id, video.titulo)}
                  title="Excluir vídeo"
                  aria-label={`Excluir vídeo: ${video.titulo}`}
                  className="px-3 py-3 sm:px-4 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-red-100 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Excluir</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
