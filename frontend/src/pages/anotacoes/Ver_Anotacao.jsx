import { Link, useParams } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";
import { infoHumor } from "../../utils/humores";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import ExportarAnotacoes from "./ExportarAnotacoes";

export default function Ver_Anotacao() {
  const { id } = useParams();
  const { carregando, buscarAnotacaoPorId } = useAnotacoes();

  const anotacao = buscarAnotacaoPorId(id);

  if (carregando) {
    return (
      <div role="status" className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Abrindo diário...
        </p>
      </div>
    );
  }

  if (!anotacao) {
    return (
      <div
        role="alert"
        className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl text-white"
      >
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

  const humor = infoHumor(anotacao.humor);

  return (
    <div className="max-w-3xl mx-auto p-2 animate-fadeIn text-black">
      {/* Botão de navegação superior para retorno rápido */}
      <Link
        to="/anotacoes"
        className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-4 sm:mb-6 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar para a listagem</span>
      </Link>

      {/* Cartão de leitura limpo e confortável */}
      <article className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 md:p-10 border border-purple-100 flex flex-col justify-between min-h-0 sm:min-h-[400px]">
        <div>
          {/* Cabeçalho da Nota */}
          <header className="border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen size={14} />
              <span>Registro Pessoal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-purple-950 tracking-wide leading-tight flex items-center gap-3">
              <span className="min-w-0 wrap-break-words">
                {anotacao.titulo}
              </span>
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
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mt-3">
              <Calendar size={14} className="text-purple-500" />
              <span>
                Escrito em{" "}
                <time dateTime={anotacao.created_at}>
                  {formatarData(anotacao.created_at)}
                </time>
              </span>
            </div>
          </header>

          {/* Corpo do desabafo com espaçamento e fonte confortável para leitura */}
          <p className="whitespace-pre-wrap wrap-break-words text-base leading-relaxed text-gray-700 font-medium tracking-wide px-1">
            {anotacao.texto}
          </p>
        </div>

        {/* Rodapé do cartão contendo link de atalho para edição rápida caso o usuário queira mudar algo */}
        <footer className="mt-8 sm:mt-12 pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
          <Link
            to="/anotacoes"
            className="text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 sm:py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Fechar Leitura
          </Link>

          <ExportarAnotacoes
            anotacoes={[anotacao]}
            tituloDocumento={`MindUp - ${anotacao.titulo}`.slice(0, 80)}
            className="text-center bg-white border-2 border-purple-200 hover:bg-purple-50 text-purple-800 font-bold px-5 py-3 sm:py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            Exportar esta anotação
          </ExportarAnotacoes>

          <Link
            to={`/anotacoes/editar/${anotacao.id}`}
            className="text-center bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-3 sm:py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm shadow-purple-950/10"
          >
            <span aria-hidden="true">✏️</span> Editar Nota
          </Link>
        </footer>
      </article>
    </div>
  );
}
