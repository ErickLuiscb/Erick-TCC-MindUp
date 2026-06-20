import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";
import { ArrowLeft, Save } from "lucide-react";

export default function Editar_Anotacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { carregando, editarAnotacao, buscarAnotacaoPorId } = useAnotacoes();

  const anotacao = buscarAnotacaoPorId(id);

  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (anotacao) {
      setTitulo(anotacao.titulo || "");
      setTexto(anotacao.texto || "");
    }
  }, [anotacao]);

  if (carregando) {
    return (
      <div className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Buscando registro no servidor...
        </p>
      </div>
    );
  }

  if (!anotacao) {
    return (
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl">
        <p className="text-xl font-bold text-white">
          ❌ Registro não encontrado
        </p>
        <p className="text-purple-200 text-xs mt-2">
          Esta anotação pode ter sido excluída ou não pertence à sua chave.
        </p>
        <button
          onClick={() => navigate("/anotacoes")}
          className="mt-4 text-xs font-bold text-[#ffb300] uppercase tracking-wider hover:underline"
        >
          Voltar para o diário
        </button>
      </div>
    );
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    if (!titulo.trim() || !texto.trim()) {
      setErro("❌ Os campos não podem ser atualizados em branco.");
      setSalvando(false);
      return;
    }

    // Envia a requisição PUT estruturada com segurança
    const resp = await editarAnotacao(anotacao.id, { titulo, texto });

    if (resp?.sucesso) {
      navigate("/anotacoes");
    } else {
      setErro(
        "❌ " +
          (resp?.mensagem || "Erro ao atualizar anotação. Verifique os dados."),
      );
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-2 animate-fadeIn text-black">
      {/* Botão de voltar simples e funcional */}
      <button
        onClick={() => navigate("/anotacoes")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
        disabled={salvando}
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar para o Diário</span>
      </button>

      {/* Banner de Erros Customizado */}
      {erro && (
        <div className="p-4 bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl mb-6 shadow-xs animate-fadeIn">
          {erro}
        </div>
      )}

      {/* Caixa do Formulário Unificado */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-black text-purple-950 tracking-wide">
            Modificar Registro ✏️
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Altere os dados desejados e salve para sincronizar as mudanças com o
            banco PostgreSQL.
          </p>
        </header>

        <form onSubmit={salvar} className="space-y-5">
          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Título do Registro:
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:outline-purple-600 text-black font-semibold"
              required
              maxLength={100}
              disabled={salvando}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Conteúdo da Anotação:
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm h-52 focus:outline-purple-600 text-black leading-relaxed"
              required
              disabled={salvando}
            />
          </div>

          {/* Botões de Navegação e Envio */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/anotacoes")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-md shadow-purple-950/10 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{salvando ? "Atualizando..." : "Salvar Alterações"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
