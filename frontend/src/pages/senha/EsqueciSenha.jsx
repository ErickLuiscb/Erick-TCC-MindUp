import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../service/api";
import { ArrowLeft, Mail } from "lucide-react";

export default function EsqueciSenha() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setEnviando(true);

    try {
      const resp = await api.post("/forgot-password", { email });
      setMensagem(
        "✅ " +
          (resp.data?.message ||
            "Se o e-mail informado estiver cadastrado, você receberá um link em instantes."),
      );
      setEnviado(true);
    } catch (error) {
      console.error(error);

      if (error.foiTimeout) {
        setMensagem(
          "⏱️ O servidor demorou mais que o esperado. Se o e-mail estiver correto, o link pode chegar em alguns instantes mesmo assim.",
        );
      } else {
        setMensagem(
          "❌ " +
            (error.response?.data?.message ||
              "Não foi possível processar seu pedido agora. Tente novamente em instantes."),
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-10">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 py-1 text-purple-700 hover:text-purple-900 font-semibold text-sm mb-5 sm:mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft
            size={16}
            className="transform group-hover:-translate-x-1 transition-transform"
          />
          <span>Voltar para o login</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 p-2.5 rounded-xl">
            <Mail size={22} className="text-purple-700" />
          </div>
          <h1 className="text-2xl font-black text-purple-900">
            Esqueceu a senha?
          </h1>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Sem problemas. Digite o e-mail da sua conta e vamos te mandar um link
          para você escolher uma nova senha.
        </p>

        {/* Região de aviso sempre presente: leitores de tela anunciam o texto assim que ele aparece */}
        <div role="status" aria-live="polite">
          {mensagem && (
            <p
              className={`mb-4 font-bold text-sm ${
                mensagem.includes("❌") || mensagem.includes("⏱️")
                  ? "text-red-600"
                  : "text-green-700"
              }`}
            >
              {mensagem}
            </p>
          )}
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="esqueci-email"
              className="font-semibold block text-purple-900 text-sm mb-1"
            >
              E-mail:
            </label>
            <input
              id="esqueci-email"
              autoComplete="email"
              className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-purple-600"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={enviando}
              placeholder="seu@email.com"
            />

            <button
              type="submit"
              disabled={enviando}
              className="w-full mt-6 bg-purple-900 text-white py-3 px-4 rounded-full font-bold text-sm sm:text-base shadow-md hover:bg-purple-950 transition disabled:opacity-50"
            >
              {enviando ? "ENVIANDO..." : "ENVIAR LINK DE REDEFINIÇÃO"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full bg-purple-100 text-purple-900 py-3 rounded-full font-bold hover:bg-purple-200 transition"
          >
            Voltar para o login
          </button>
        )}
      </div>
    </div>
  );
}
