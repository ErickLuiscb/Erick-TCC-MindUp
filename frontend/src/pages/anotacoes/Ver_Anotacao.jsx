import { Link, useParams } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";

export default function Ver_Anotacao() {
  const { id } = useParams();
  const { carregando, buscarAnotacaoPorId } = useAnotacoes();

  const anotacao = buscarAnotacaoPorId(id);

  if (carregando) {
    return (
      <div className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Abrindo diário...
        </p>
      </div>
    );
  }

  if (!anotacao) {
    return (
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl text-white">
        <p className="text-xl font-bold">❌ Registro não encontrado</p>
        <p className="text-purple-200 text-xs mt-2">
          Esta anotação pode ter sido removida ou não pertence ao seu perfil.
        </p>
        <Link
          to="/anotacoes"
          className="inline-block mt-4 text-xs font-bold text-[#ffb300] uppercase tracking-wider hover:underline"
        >
          Voltar para o diário
        </Link>
      </div>
    );
  }

  // Função auxiliar para formatar data e hora da criação da nota
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
    <div className="max-w-3xl mx-auto p-2 animate-fadeIn text-black">
      {/* Botão de navegação superior para retorno rápido */}
      <Link
        to="/anotacoes"
        className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar para a listagem</span>
      </Link>

      {/* Cartão de leitura limpo e confortável */}
      <article className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-purple-100 flex flex-col justify-between min-h-[400px]">
        <div>
          {/* Cabeçalho da Nota */}
          <header className="border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen size={14} />
              <span>Registro Pessoal</span>
            </div>

            <h1 className="text-3xl font-black text-purple-950 tracking-wide leading-tight">
              {anotacao.titulo}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mt-3">
              <Calendar size={14} className="text-purple-500" />
              <span>Escrito em {formatarData(anotacao.created_at)}</span>
            </div>
          </header>

          {/* Corpo do desabafo com espaçamento e fonte confortável para leitura */}
          <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 font-medium tracking-wide px-1">
            {anotacao.texto}
          </p>
        </div>

        {/* Rodapé do cartão contendo link de atalho para edição rápida caso o usuário queira mudar algo */}
        <footer className="mt-12 pt-4 border-t border-gray-100 flex justify-between items-center">
          <Link
            to="/anotacoes"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Fechar Leitura
          </Link>

          <Link
            to={`/anotacoes/editar/${anotacao.id}`}
            className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm shadow-purple-950/10"
          >
            ✏️ Editar Nota
          </Link>
        </footer>
      </article>
    </div>
  );
}
