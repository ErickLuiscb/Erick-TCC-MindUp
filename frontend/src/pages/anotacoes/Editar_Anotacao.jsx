import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";

export default function Editar_Anotacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { anotacoes, carregando, editarAnotacao, buscarAnotacaoPorId } =
    useAnotacoes();

  const anotacao = buscarAnotacaoPorId(id);

  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (anotacao) {
      setTitulo(anotacao.titulo);
      setTexto(anotacao.texto);
    }
  }, [anotacao]);

  if (carregando) return <p>Carregando...</p>;

  if (!anotacao)
    return <p className="text-center pt-10">Anotação não encontrada.</p>;

  async function salvar(e) {
    e.preventDefault();

    try {
      await editarAnotacao(anotacao.id, { titulo, texto });
      navigate("/anotacoes");
    } catch {
      alert("Erro ao editar anotação.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Editar Anotação
      </h1>

      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Conteúdo</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md h-40"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
