import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";
import { HUMORES, infoHumor } from "../../utils/humores";
import ExportarAnotacoes from "./ExportarAnotacoes";
import {
  Plus,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Search,
  Filter,
  X,
} from "lucide-react";

const SEM_HUMOR = "sem_humor";

const OPCOES_HUMOR = [
  ...HUMORES,
  { valor: SEM_HUMOR, emoji: "➖", label: "Sem humor" },
];

// Para a busca ignorar maiúsculas e acentos ("reflexao" encontra "Reflexão")
const normalizar = (texto) =>
  (texto ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function Anotacoes() {
  const { anotacoes, carregando, deletarAnotacao } = useAnotacoes();

  const [busca, setBusca] = useState("");
  const [humoresSelecionados, setHumoresSelecionados] = useState([]);
  const [painelAberto, setPainelAberto] = useState(false);
  const painelRef = useRef(null);
  const botaoFiltroRef = useRef(null);

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

  // Esc fecha o painel e devolve o foco ao botão "Filtros"
  // (só escuta o teclado enquanto o painel estiver aberto)
  useEffect(() => {
    if (!painelAberto) return;
    function handleEsc(e) {
      if (e.key === "Escape") {
        setPainelAberto(false);
        botaoFiltroRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [painelAberto]);

  if (carregando) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center pt-20 animate-pulse"
      >
        <div className="text-xl font-bold text-white tracking-wide">
          Carregando seus pensamentos...
        </div>
      </div>
    );
  }

  async function confirmarExclusao(id) {
    const ok = window.confirm(
      "⚠️ Tem certeza que deseja apagar este registro do seu diário? Esta ação não pode ser desfeita.",
    );
    if (!ok) return;

    try {
      await deletarAnotacao(id);
    } catch {
      alert("Erro ao excluir anotação.");
    }
  }

  // Função auxiliar para formatar a data que vem do Laravel Resource de forma limpa
  const formatarData = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAlternarHumor = (valor) => {
    setHumoresSelecionados((prev) =>
      prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor],
    );
  };

  const limparFiltros = () => {
    setBusca("");
    setHumoresSelecionados([]);
  };

  // ORDEM: mais novas em cima, mais velhas embaixo.
  // O backend já envia nessa ordem, mas uma anotação recém-criada entra no fim
  // da lista até a página recarregar. Ordenar aqui garante a ordem sempre.
  const ordenadas = [...anotacoes].sort((a, b) => {
    const diff = new Date(b.created_at) - new Date(a.created_at);
    return diff && !Number.isNaN(diff) ? diff : b.id - a.id;
  });

  // FILTRO: título contém o texto buscado E (se houver humores marcados) o
  // humor da anotação é um dos marcados — igual às categorias nos conteúdos.
  const termo = normalizar(busca.trim());
  const filtradas = ordenadas.filter((a) => {
    const bateBusca = normalizar(a.titulo).includes(termo);
    if (humoresSelecionados.length === 0) return bateBusca;
    return bateBusca && humoresSelecionados.includes(a.humor ?? SEM_HUMOR);
  });

  const filtrosAtivos = termo !== "" || humoresSelecionados.length > 0;
  const qtd = filtradas.length;
  const palavraQtd = qtd === 1 ? "anotação" : "anotações";

  return (
    <div className="max-w-6xl mx-auto p-2 animate-fadeIn">
      {/* CABEÇALHO DA PÁGINA */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10 pb-4 border-b border-purple-300/30">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-md">
            Meu Diário Pessoal 📒
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Um espaço totalmente seguro e confidencial para guardar seus
            desabafos e reflexões.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <ExportarAnotacoes
            anotacoes={ordenadas}
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all w-full sm:w-auto justify-center flex items-center gap-2 text-sm tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
          >
            Exportar anotações
          </ExportarAnotacoes>

          <Link
            to="/anotacoes/criar"
            className="bg-[#ff7300] hover:bg-[#ff8c00] text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-orange-950/20 transition-all transform hover:scale-105 motion-reduce:transform-none w-full sm:w-auto justify-center flex items-center gap-2 text-sm tracking-wide"
          >
            <Plus size={18} />
            <span>Nova Anotação</span>
          </Link>
        </div>
      </header>

      {/* BARRA DE BUSCA + FILTRO POR HUMOR (só aparece se já existir alguma anotação) */}
      {anotacoes.length > 0 && (
        <>
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative w-full max-w-xl flex gap-3 items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  aria-label="Buscar anotações por título"
                  placeholder="Buscar anotações por título..."
                  className="w-full pl-5 pr-12 py-3.5 bg-white border border-purple-100 rounded-2xl shadow-xl text-sm font-semibold text-black focus:outline-3 focus:outline-[#ffb300] placeholder-gray-500 transition"
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
                  ref={botaoFiltroRef}
                  onClick={() => setPainelAberto((v) => !v)}
                  aria-expanded={painelAberto}
                  aria-controls="painel-filtros-humor"
                  className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer border ${
                    humoresSelecionados.length > 0
                      ? "bg-[#ff7300] border-orange-400 text-white"
                      : "bg-white text-purple-950 border-purple-100 hover:bg-purple-50"
                  }`}
                >
                  <Filter size={16} />
                  <span>
                    Filtros{" "}
                    {humoresSelecionados.length > 0 &&
                      `(${humoresSelecionados.length})`}
                  </span>
                </button>

                {/* PAINEL FLUTUANTE
                    Largura = tela inteira menos as margens (2rem), limitada a 24rem,
                    como nas telas de conteúdo. */}
                {painelAberto && (
                  <div
                    id="painel-filtros-humor"
                    role="group"
                    aria-labelledby="titulo-filtro-humor"
                    className="absolute right-0 top-14 w-[calc(100vw-2rem)] max-w-96 bg-white border border-purple-100 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn text-black"
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                      <h2
                        id="titulo-filtro-humor"
                        className="text-xs font-black uppercase text-purple-700 tracking-wider"
                      >
                        Filtrar por Humor
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setPainelAberto(false);
                          botaoFiltroRef.current?.focus();
                        }}
                        aria-label="Fechar filtros"
                        className="p-3 -m-3 text-gray-500 hover:text-red-500 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* 9 opções em 3 colunas. Cada uma é um checkbox de verdade (escondido
                        visualmente), então o leitor de tela anuncia marcado/desmarcado. */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {OPCOES_HUMOR.map((op) => {
                        const marcado = humoresSelecionados.includes(op.valor);
                        return (
                          <label
                            key={op.valor}
                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wide text-center cursor-pointer select-none transition focus-within:ring-2 focus-within:ring-purple-600 ${
                              marcado
                                ? "bg-orange-100 border-[#ff7300] text-orange-950"
                                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={marcado}
                              onChange={() => handleAlternarHumor(op.valor)}
                              className="sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className="text-2xl leading-none"
                            >
                              {op.emoji}
                            </span>
                            <span>{op.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    {humoresSelecionados.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setHumoresSelecionados([])}
                        className="mt-3 pt-2 border-t border-gray-100 w-full text-[11px] font-bold text-red-600 hover:underline cursor-pointer text-left"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quantidade de resultados: visível quando há filtro; sempre lida por
              leitores de tela quando o número muda */}
          <p
            role="status"
            className={
              filtrosAtivos
                ? "text-center text-purple-200 text-xs font-bold mb-4 sm:mb-6"
                : "sr-only"
            }
          >
            {filtrosAtivos
              ? `${qtd} ${palavraQtd} ${qtd === 1 ? "encontrada" : "encontradas"}`
              : `${qtd} ${palavraQtd}`}
          </p>
        </>
      )}

      {/* ESTADO VAZIO */}
      {anotacoes.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-md mx-auto mt-12 shadow-xl animate-fadeIn">
          <p className="text-2xl mb-2">✍️</p>
          <h2 className="text-white font-bold text-lg">
            Seu diário está em branco
          </h2>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Escrever ajuda a organizar os pensamentos e aliviar tensões. Que tal
            começar registrando como foi o seu dia hoje?
          </p>
          <Link
            to="/anotacoes/criar"
            className="inline-block mt-6 text-xs font-bold uppercase tracking-wider text-[#ffb300] hover:underline"
          >
            Criar minha primeira nota →
          </Link>
        </div>
      )}

      {/* NENHUM RESULTADO (existem anotações, mas nenhuma combina com os filtros) */}
      {anotacoes.length > 0 && filtradas.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-md mx-auto mt-6 shadow-xl animate-fadeIn">
          <p className="text-2xl mb-2" aria-hidden="true">
            🔍
          </p>
          <h2 className="text-white font-bold text-lg">
            Nenhuma anotação encontrada
          </h2>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Nenhuma anotação combina com a busca ou com os humores selecionados.
          </p>
          <button
            type="button"
            onClick={limparFiltros}
            className="inline-block mt-6 text-xs font-bold uppercase tracking-wider text-[#ffb300] hover:underline cursor-pointer"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* BLINGAGEM E GRID DE NOTAS PROFISSIONAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {filtradas.map((a) => {
          const humor = infoHumor(a.humor);
          return (
            <article
              key={a.id}
              className="bg-white/95 text-gray-800 shadow-2xl rounded-2xl p-4 sm:p-6 border border-purple-100 flex flex-col justify-between transition-all hover:shadow-purple-950/20 hover:scale-[1.02] motion-reduce:hover:scale-100 duration-300 group"
            >
              <div>
                {/* Header do Card com Título e Data */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="text-lg font-black text-purple-950 tracking-wide line-clamp-1 group-hover:text-purple-700 transition">
                    {a.titulo}
                  </h2>
                  {humor && (
                    <span
                      role="img"
                      aria-label={`Humor: ${humor.label}`}
                      title={humor.label}
                      className="text-3xl leading-none shrink-0"
                    >
                      {humor.emoji}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-4">
                  <Calendar size={12} className="text-purple-500" />
                  <time dateTime={a.created_at}>
                    {formatarData(a.created_at)}
                  </time>
                </div>

                {/* Corpo de Texto Truncado para Usabilidade Limpa */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 sm:line-clamp-4 wrap-break-words bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  {a.texto}
                </p>
              </div>

              {/* BARRA DE AÇÕES MODERNA COM ÍCONES E BOTÕES */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                {/* CORRIGIDO: Modificado o fechamento de </Route> para </Link> */}
                <Link
                  to={`/anotacoes/${a.id}`}
                  title="Visualizar por completo"
                  aria-label={`Visualizar anotação: ${a.titulo}`}
                  className="p-3 sm:p-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-center shadow-xs"
                >
                  <Eye size={16} />
                </Link>

                <Link
                  to={`/anotacoes/editar/${a.id}`}
                  title="Editar conteúdo"
                  aria-label={`Editar anotação: ${a.titulo}`}
                  className="p-3 sm:p-2 text-[#ff7300] bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center shadow-xs"
                >
                  <Edit3 size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => confirmarExclusao(a.id)}
                  title="Apagar anotação"
                  aria-label={`Apagar anotação: ${a.titulo}`}
                  className="p-3 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
