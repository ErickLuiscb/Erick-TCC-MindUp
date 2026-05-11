import { Link } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";

export default function Anotacoes() {
  const { anotacoes, carregando, deletarAnotacao } = useAnotacoes();

  if (carregando) {
    return <p className="text-center pt-10 text-white">Carregando...</p>;
  }

  async function confirmarExclusao(id) {
    const ok = window.confirm("Tem certeza que deseja excluir esta anotação?");
    if (!ok) return;

    try {
      await deletarAnotacao(id);
    } catch {
      alert("Erro ao excluir anotação.");
    }
  }

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-900">Minhas Anotações</h1>

        <Link
          to="/anotacoes/criar"
          className="bg-purple-600 text-white px-4 py-2 rounded-full"
        >
          + Nova Anotação
        </Link>
      </header>

      {anotacoes.length === 0 && (
        <p className="text-gray-600 text-center mt-10">
          Você ainda não criou nenhuma anotação.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {anotacoes.map((a) => (
          <div
            key={a.id}
            className="bg-white shadow-md p-4 rounded-xl border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-purple-700">{a.titulo}</h2>

            <p className="text-gray-600 mt-1 line-clamp-3">{a.texto}</p>

            <div className="flex justify-between mt-4 text-sm">
              <Link
                to={`/anotacoes/${a.id}`}
                className="text-blue-600 font-medium hover:underline"
              >
                Ver
              </Link>

              <Link
                to={`/anotacoes/editar/${a.id}`}
                className="text-yellow-600 font-medium hover:underline"
              >
                Editar
              </Link>

              <button
                onClick={() => confirmarExclusao(a.id)}
                className="text-red-600 font-medium hover:underline"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
