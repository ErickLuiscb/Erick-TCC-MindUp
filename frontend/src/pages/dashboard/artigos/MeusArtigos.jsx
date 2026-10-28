import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import {
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  FileText,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function MeusArtigos() {
  const navigate = useNavigate();
  const [artigos, setArtigos] = useState([]);
  const [carregando, setCarregando] = useState(true);

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
        {/* CARD DE ARTIGO
            Celular (< sm): layout HORIZONTAL compacto — selo de documento à esquerda
            (faz o papel de miniatura, já que artigo não tem imagem), texto à direita.
            sm em diante: card de texto de sempre. */}
        {artigos.map((artigo) => (
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
