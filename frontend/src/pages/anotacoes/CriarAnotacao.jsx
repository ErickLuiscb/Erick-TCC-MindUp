import { useState } from "react";
import { useNavigate } from "react-router";
import { useAnotacoes } from "../../context/AnotacoesContext";
import { ArrowLeft, Save } from "lucide-react";

export default function CriarAnotacao() {
  const { criarAnotacao } = useAnotacoes();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    // Validação preventiva simples antes de disparar a rede
    if (!titulo.trim() || !texto.trim()) {
      setErro("❌ Por favor, preencha todos os campos do seu registro.");
      setSalvando(false);
      return;
    }

    const resp = await criarAnotacao({ titulo, texto });

    if (resp?.sucesso) {
      navigate("/anotacoes");
    } else {
      setErro(
        "❌ " +
          (resp?.mensagem || "Erro ao criar anotação. Verifique os dados."),
      );
      setSalvando(false); // Libera o formulário em caso de falha
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-2 animate-fadeIn text-black">
      {/* Botão de voltar e indicação de contexto */}
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

      {/* Banner de Feedback de Erro */}
      {erro && (
        <div className="p-4 bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl mb-6 shadow-xs animate-fadeIn">
          {erro}
        </div>
      )}

      {/* Caixa do Formulário Web Profissional */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-black text-purple-950 tracking-wide">
            Nova Página do Diário ✍️
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Seus dados são criptografados e vinculados unicamente à sua chave de
            acesso pessoal.
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
              placeholder="Dê um título para o seu momento ou sentimento..."
              required
              maxLength={100}
              disabled={salvando}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              O que você está pensando ou sentindo?
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm h-52 focus:outline-purple-600 text-black leading-relaxed"
              placeholder="Fique à vontade para escrever tudo o que vier à mente. Este espaço é inteiramente seu..."
              required
              disabled={salvando}
            />
          </div>

          {/* Botões de Ação Alinhados */}
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
              <span>{salvando ? "Salvando..." : "Salvar Registro"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
