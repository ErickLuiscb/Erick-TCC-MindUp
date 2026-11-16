import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import { useVideos } from "../../../context/VideosContext";
import {
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  FileText,
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  X,
} from "lucide-react";

export default function MeusArtigos() {
  const navigate = useNavigate();
  const [artigos, setArtigos] = useState([]);
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
  // CARREGAR ARTIGOS DO AUTOR
  // ============================
  async function carregarArtigos() {
    try {
      setCarregando(true);
      // Consome a rota oficial da dashboard que criamos no backend
      const resp = await api.get("/dashboard/artigos");
      // Mapeia e extrai a estrutura vinda do ArtigoResource do Laravel
      setArtigos(resp.data.data ?? resp.data ?? []);
    } catch (error) {
      console.error("Erro ao carregar artigos:", error);
      alert("Erro ao carregar seus artigos.");
    } finally {
      setCarregando(false);
    }
  }

  // ============================
  // EXCLUIR ARTIGO
  // ============================
  async function excluirArtigo(id, titulo) {
    const ok = window.confirm(
      `⚠️ ATENÇÃO: Tem certeza absoluta que deseja excluir permanentemente o artigo:\n\n"${titulo}"?\n\nEsta ação apagará o arquivo PDF físico do servidor.`,
    );

    if (!ok) return;

    try {
      // Consome a rota oficial de deleção do seu api.php do Laravel
      await api.delete(`/artigos/${id}`);
      setArtigos((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Erro ao excluir artigo:", error);
      alert("Erro ao tentar remover o artigo do servidor.");
    }
  }

  useEffect(() => {
    carregarArtigos(); // Executa a carga inicial ao montar a tela
  }, []);

  // Função auxiliar para formatar a data que vem do Laravel de forma limpa
  const formatarData = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (carregando) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center pt-20 animate-pulse"
      >
        <div className="text-xl font-bold text-white tracking-wide">
          Buscando seus artigos em PDF...
        </div>
      </div>
    );
  }

  const handleAlternarCategoria = (id) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const filtrados = artigos.filter((x) => {
    const bateBusca = x.titulo.toLowerCase().includes(busca.toLowerCase());
    if (categoriasSelecionadas.length === 0) return bateBusca;
    const possuiCategoria = x.categorias?.some((cat) =>
      categoriasSelecionadas.includes(cat.id),
    );
    return bateBusca && possuiCategoria;
  });

  return (
    <div className="text-black max-w-7xl mx-auto animate-fadeIn p-2">
      {/* Botão Superior de Voltar ao Painel Geral */}
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
            Gerenciar Artigos 📄
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Escreva resumos, anexe PDFs informativos e gerencie seus textos
            autorais.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/artigos/criar")}
          className="w-full sm:w-auto justify-center bg-[#ff3d00] hover:bg-[#ff5722] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 motion-reduce:transform-none flex items-center gap-2 text-sm tracking-wide cursor-pointer"
        >
          <Plus size={18} />
          <span>Criar Artigo</span>
        </button>
      </div>

      {/* BARRA DE BUSCA + BOTÃO DE FILTROS (só aparece se já existir conteúdo) */}
      {artigos.length > 0 && (
        <div className="flex justify-center mb-6 sm:mb-10">
          <div className="relative w-full max-w-xl flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                aria-label="Buscar artigos por título"
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
                aria-controls="painel-filtros-meus-artigos"
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
                  id="painel-filtros-meus-artigos"
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
      {artigos.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-md mx-auto mt-8 sm:mt-12 shadow-xl text-white">
          <p className="text-2xl mb-2" aria-hidden="true">
            📄
          </p>
          <h2 className="font-bold text-lg">Nenhum artigo publicado</h2>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Você ainda não publicou nenhum texto de apoio ou PDF. Clique no
            botão superior para fazer seu primeiro upload técnico.
          </p>
        </div>
      )}

      {/* GRID DE CARDS DE ARTIGOS (Design de Alta Qualidade Acadêmica) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 items-stretch">
        {/* Existem conteúdos, mas nenhum combina com a busca/filtro */}
        {artigos.length > 0 && filtrados.length === 0 && (
          <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-sm mx-auto mt-6 shadow-xl text-white">
            <p className="text-xl font-bold">📄 Nenhum artigo encontrado</p>
            <p className="text-purple-200 text-xs mt-1">
              Experimente alterar o termo digitado ou limpar o filtro de
              categoria.
            </p>
          </div>
        )}

        {/* CARD DE ARTIGO
            Celular (< sm): layout HORIZONTAL compacto — selo de documento à esquerda
            (faz o papel de miniatura, já que artigo não tem imagem), texto à direita.
            sm em diante: card de texto de sempre. */}
        {filtrados.map((artigo) => (
          <article
            key={artigo.id}
            className="bg-white rounded-2xl shadow-2xl border border-purple-50 overflow-hidden flex flex-row sm:flex-col sm:justify-between transition-all hover:shadow-purple-950/20 hover:scale-[1.02] motion-reduce:hover:scale-100 duration-300 group"
          >
            {/* Selo de documento: só no celular */}
            <div
              aria-hidden="true"
              className="sm:hidden shrink-0 w-14 bg-orange-50 border-r border-orange-100 flex items-center justify-center"
            >
              <FileText size={24} className="text-[#ff7300]" />
            </div>

            <div className="flex-1 min-w-0 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                {/* Header do card contendo a Data */}
                <div className="flex items-center justify-end gap-4 mb-2 sm:mb-4 pb-2 border-b border-gray-50">
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-bold tracking-wide">
                    <Calendar size={12} className="text-purple-500" />
                    <time dateTime={artigo.created_at}>
                      {formatarData(artigo.created_at)}
                    </time>
                  </div>
                </div>

                {/* Bloco de Categorias */}
                <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                  {artigo.categorias?.slice(0, 2).map((c) => (
                    <span
                      key={c.id}
                      className="max-w-full truncate text-[10px] font-black uppercase tracking-wider text-[#ff7300] bg-orange-50 px-2 py-0.5 rounded border border-orange-100"
                    >
                      {c.nome}
                    </span>
                  ))}
                  {artigo.categorias?.length > 2 && (
                    <span className="self-center text-[10px] font-bold text-gray-500">
                      +{artigo.categorias.length - 2}
                    </span>
                  )}
                </div>

                {/* Título do PDF em Destaque */}
                <h2 className="text-sm sm:text-base font-black text-purple-950 uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-purple-700 transition flex items-start gap-1.5">
                  <BookOpen
                    size={16}
                    className="text-purple-500 mt-0.5 shrink-0"
                  />
                  <span>{artigo.titulo}</span>
                </h2>

                {/* Resumo do Texto */}
                <p className="text-xs text-gray-500 leading-relaxed mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3 sm:bg-gray-50 sm:p-3 sm:rounded-xl sm:border sm:border-gray-100">
                  {artigo.descricao ||
                    "Sem resumo cadastrado para este material."}
                </p>
              </div>

              {/* BARRA DE AÇÕES OPERACIONAIS DO CRUD WEB */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex justify-end gap-3">
                <Link
                  to={`/dashboard/artigos/editar/${artigo.id}`}
                  aria-label={`Editar artigo: ${artigo.titulo}`}
                  className="px-4 py-3 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-amber-100"
                >
                  <Edit3 size={12} />
                  <span>Editar</span>
                </Link>

                <button
                  type="button"
                  onClick={() => excluirArtigo(artigo.id, artigo.titulo)}
                  aria-label={`Excluir artigo: ${artigo.titulo}`}
                  className="px-4 py-3 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-red-100 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
