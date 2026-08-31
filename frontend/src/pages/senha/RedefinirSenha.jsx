import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import api from "../../service/api";
import { KeyRound, CheckCircle2 } from "lucide-react";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const linkInvalido = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (senha !== confirmacao) {
      setErro("❌ As senhas não coincidem.");
      return;
    }

    setEnviando(true);

    try {
      await api.post("/reset-password", {
        email,
        token,
        senha,
        senha_confirmation: confirmacao,
      });
      setSucesso(true);
    } catch (error) {
      console.error(error);

      if (error.foiTimeout) {
        setErro(
          "⏱️ O servidor demorou mais que o esperado. Tente fazer login — a senha pode já ter sido alterada.",
        );
      } else {
        setErro(
          "❌ " +
            (error.response?.data?.message ||
              "Não foi possível redefinir sua senha. O link pode ter expirado."),
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 p-2.5 rounded-xl">
            <KeyRound size={22} className="text-purple-700" />
          </div>
          <h1 className="text-2xl font-black text-purple-900">Nova senha</h1>
        </div>

        {linkInvalido && (
          <div className="mt-4">
            <p className="text-sm text-red-600 font-bold mb-4">
              ❌ Este link de redefinição está incompleto ou inválido. Peça um
              novo link na tela de login.
            </p>
            <Link
              to="/esqueci-senha"
              className="block text-center w-full bg-purple-900 text-white py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition"
            >
              Pedir novo link
            </Link>
          </div>
        )}

        {!linkInvalido && sucesso && (
          <div className="mt-4 text-center">
            <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
            <p className="text-sm text-green-700 font-bold mb-6">
              Senha redefinida com sucesso! Você já pode fazer login com sua
              nova senha.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-purple-900 text-white py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition"
            >
              Ir para o login
            </button>
          </div>
        )}

        {!linkInvalido && !sucesso && (
          <>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 mt-2">
              Escolha uma nova senha para <strong>{email}</strong>.
            </p>

            {erro && (
              <p className="mb-4 font-bold text-sm text-red-600">{erro}</p>
            )}

            <form onSubmit={handleSubmit}>
              <label className="font-semibold block text-purple-900 text-sm mb-1">
                Nova senha:
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-purple-600"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                disabled={enviando}
              />

              <label className="font-semibold block mt-4 text-purple-900 text-sm mb-1">
                Confirme a nova senha:
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-purple-600"
                type="password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                required
                minLength={6}
                disabled={enviando}
              />

              <p className="text-[11px] text-gray-400 mt-2">
                Mínimo de 6 caracteres.
              </p>

              <button
                type="submit"
                disabled={enviando}
                className="w-full mt-6 bg-purple-900 text-white py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition disabled:opacity-50"
              >
                {enviando ? "SALVANDO..." : "REDEFINIR SENHA"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
