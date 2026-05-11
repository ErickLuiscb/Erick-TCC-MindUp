import { Link, useParams } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";

export default function Ver_Anotacao() {
  const { id } = useParams();
  const { anotacoes, carregando, buscarAnotacaoPorId } = useAnotacoes();

  const anotacao = buscarAnotacaoPorId(id);

  if (carregando) return <p className="text-center pt-10 text-white">Carregando...</p>;

  if (!anotacao)
    return <p className="text-center pt-10">Anotação não encontrada.</p>;

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-purple-700 to-purple-400 text-white">
      <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">
          {anotacao.titulo}
        </h1>

        <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-200 mb-6">
          {anotacao.texto}
        </p>

        <Link
          to="/anotacoes"
          className="inline-block bg-orange-500 px-4 py-2 rounded-full font-semibold hover:bg-orange-600 transition"
        >
          ← Voltar
        </Link>
      </div>
    </div>
  );
}
