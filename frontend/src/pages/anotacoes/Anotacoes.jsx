import { Link } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";
import { Plus, Eye, Edit3, Trash2, Calendar } from "lucide-react";

export default function Anotacoes() {
  const { anotacoes, carregando, deletarAnotacao } = useAnotacoes();

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
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

  return (
    <div className="max-w-6xl mx-auto p-2 animate-fadeIn">
      {/* CABEÇALHO DA PÁGINA */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-4 border-b border-purple-300/30">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-md">
            Meu Diário Pessoal 📒
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Um espaço totalmente seguro e confidencial para guardar seus
            desabafos e reflexões.
          </p>
        </div>

        <Link
          to="/anotacoes/criar"
          className="bg-[#ff7300] hover:bg-[#ff8c00] text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-orange-950/20 transition-all transform hover:scale-105 flex items-center gap-2 text-sm tracking-wide"
        >
          <Plus size={18} />
          <span>Nova Anotação</span>
        </Link>
      </header>

      {/* ESTADO VAZIO */}
      {anotacoes.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto mt-12 shadow-xl animate-fadeIn">
          <p className="text-2xl mb-2">✍️</p>
          <h3 className="text-white font-bold text-lg">
            Seu diário está em branco
          </h3>
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

      {/* BLINGAGEM E GRID DE NOTAS PROFISSIONAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {anotacoes.map((a) => (
          <div
            key={a.id}
            className="bg-white/95 text-gray-800 shadow-2xl rounded-2xl p-6 border border-purple-100 flex flex-col justify-between transition-all hover:shadow-purple-950/20 hover:scale-[1.02] duration-300 group"
          >
            <div>
              {/* Header do Card com Título e Data */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 className="text-lg font-black text-purple-950 tracking-wide line-clamp-1 group-hover:text-purple-700 transition">
                  {a.titulo}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-4">
                <Calendar size={12} className="text-purple-500" />
                <span>{formatarData(a.created_at)}</span>
              </div>

              {/* Corpo de Texto Truncado para Usabilidade Limpa */}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                {a.texto}
              </p>
            </div>

            {/* BARRA DE AÇÕES MODERNA COM ÍCONES E BOTÕES */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              {/* CORRIGIDO: Modificado o fechamento de </Route> para </Link> */}
              <Link
                to={`/anotacoes/${a.id}`}
                title="Visualizar por completo"
                className="p-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-center shadow-xs"
              >
                <Eye size={16} />
              </Link>

              <Link
                to={`/anotacoes/editar/${a.id}`}
                title="Editar conteúdo"
                className="p-2 text-[#ff7300] bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center shadow-xs"
              >
                <Edit3 size={16} />
              </Link>

              <button
                onClick={() => confirmarExclusao(a.id)}
                title="Apagar anotação"
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center shadow-xs cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
