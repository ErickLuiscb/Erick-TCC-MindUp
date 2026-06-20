import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import {
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  Eye,
  EyeOff,
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
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
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
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar ao Painel</span>
      </button>

      {/* TOPO DO CRUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-4 border-b border-purple-300/30 text-white">
        <div>
          <h1 className="text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300]">
            Gerenciar Artigos 📄
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Escreva resumos, anexe PDFs informativos e modifique a visibilidade
            dos seus textos autorais.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/artigos/criar")}
          className="bg-[#ff3d00] hover:bg-[#ff5722] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 text-sm tracking-wide cursor-pointer"
        >
          <Plus size={18} />
          <span>Criar Artigo</span>
        </button>
      </div>

      {/* ESTADO VAZIO */}
      {artigos.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto mt-12 shadow-xl text-white">
          <p className="text-2xl mb-2">📄</p>
          <h3 className="font-bold text-lg">Nenhum artigo publicado</h3>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Você ainda não publicou nenhum texto de apoio ou PDF. Clique no
            botão superior para fazer seu primeiro upload técnico.
          </p>
        </div>
      )}

      {/* GRID DE CARDS DE ARTIGOS (Design de Alta Qualidade Acadêmica) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {artigos.map((artigo) => (
          <div
            key={artigo.id}
            className="bg-white rounded-2xl shadow-2xl border border-purple-50 p-6 flex flex-col justify-between transition-all hover:shadow-purple-950/20 hover:scale-[1.02] duration-300 group"
          >
            <div>
              {/* Header do card contendo o Status Operacional Ativo/Inativo e Data */}
              <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-gray-50">
                <div
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1 text-white ${
                    artigo.ativo
                      ? "bg-emerald-600 border border-emerald-500"
                      : "bg-gray-600 border border-gray-500"
                  }`}
                >
                  {artigo.ativo ? <Eye size={11} /> : <EyeOff size={11} />}
                  <span>{artigo.ativo ? "No Ar" : "Oculto"}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold tracking-wide">
                  <Calendar size={12} className="text-purple-500" />
                  <span>{formatarData(artigo.created_at)}</span>
                </div>
              </div>

              {/* Bloco de Categorias */}
              <div className="flex flex-wrap gap-1 mb-3">
                {artigo.categorias?.slice(0, 2).map((c) => (
                  <span
                    key={c.id}
                    className="text-[9px] font-black uppercase tracking-wider text-[#ff7300] bg-orange-50 px-2 py-0.5 rounded border border-orange-100"
                  >
                    {c.nome.includes("-") ? c.nome.split("-")?.trim() : c.nome}
                  </span>
                ))}
              </div>

              {/* Título do PDF em Destaque */}
              <h3 className="text-base font-black text-purple-950 uppercase tracking-wide leading-snug line-clamp-2 group-hover:text-purple-700 transition flex items-start gap-1.5">
                <BookOpen
                  size={16}
                  className="text-purple-500 mt-0.5 shrink-0"
                />
                <span>{artigo.titulo}</span>
              </h3>

              {/* Resumo do Texto */}
              <p className="text-xs text-gray-500 leading-relaxed mt-3 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {artigo.descricao ||
                  "Sem resumo cadastrado para este material."}
              </p>
            </div>

            {/* BARRA DE AÇÕES OPERACIONAIS DO CRUD WEB */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Link
                to={`/dashboard/artigos/editar/${artigo.id}`}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-100"
              >
                <Edit3 size={12} />
                <span>Editar</span>
              </Link>

              <button
                onClick={() => excluirArtigo(artigo.id, artigo.titulo)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-100 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
