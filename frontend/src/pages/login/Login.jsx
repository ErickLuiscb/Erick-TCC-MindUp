import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { semEspacos, bloquearEspaco } from "../../utils/senha";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, autenticado, carregando, reenviarVerificacao } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [mensagem, setMensagem] = useState("");
  const [loadingRequisicao, setLoadingRequisicao] = useState(false);
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const from = location.state?.from || "/inicial";

  useEffect(() => {
    if (!carregando && autenticado) {
      navigate("/inicial", { replace: true });
    }
  }, [carregando, autenticado]);

  if (carregando) {
    return (
      <div
        role="status"
        className="min-h-dvh flex items-center justify-center text-white text-xl"
      >
        Carregando...
      </div>
    );
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSenhaChange = (e) =>
    setForm({ ...form, senha: semEspacos(e.target.value) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(""); // Limpa erro antigo imediatamente ao clicar
    setEmailNaoVerificado(false);
    setLoadingRequisicao(true); // Trava o botão para evitar requisições fantasmas

    const resp = await login(form.email, form.senha);

    if (!resp.sucesso) {
      setMensagem("❌ " + resp.mensagem);
      setEmailNaoVerificado(!!resp.emailNaoVerificado);
      setLoadingRequisicao(false); // Libera o formulário apenas se der erro real
      return;
    }

    setMensagem("✅ Login realizado!");
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 800);
  };

  const handleReenviar = async () => {
    setReenviando(true);
    const resp = await reenviarVerificacao(form.email);
    setMensagem((resp.sucesso ? "✅ " : "❌ ") + resp.mensagem);
    setReenviando(false);
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full flex flex-col md:flex-row">
        <div className="flex-1 p-6 sm:p-8 md:p-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-2">
            Bem-vindo(a) de volta 💜
          </h1>

          {mensagem && (
            <p
              role={mensagem.includes("❌") ? "alert" : "status"}
              className={`mt-3 font-bold ${mensagem.includes("❌") ? "text-red-600" : "text-green-600"}`}
            >
              {mensagem}
            </p>
          )}

          {emailNaoVerificado && (
            <button
              type="button"
              onClick={handleReenviar}
              disabled={reenviando}
              className="mt-2 text-sm font-bold text-purple-900 underline hover:text-purple-700 disabled:opacity-50 cursor-pointer"
            >
              {reenviando ? "Reenviando..." : "Reenviar e-mail de confirmação"}
            </button>
          )}

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="login-email"
              className="font-semibold block mt-4 text-purple-900"
            >
              E-mail:
            </label>
            <input
              id="login-email"
              autoComplete="email"
              className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-purple-600"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loadingRequisicao}
            />

            <label
              htmlFor="login-senha"
              className="font-semibold block mt-4 text-purple-900"
            >
              Senha:
            </label>
            <div className="relative">
              <input
                id="login-senha"
                autoComplete="current-password"
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg text-black focus:outline-purple-600"
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={handleSenhaChange}
                onKeyDown={bloquearEspaco}
                required
                disabled={loadingRequisicao}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-gray-500 hover:text-purple-700 cursor-pointer"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Link Esqueceu a Senha em Negrito e Destacado */}
            <div className="text-right mt-2">
              <button
                type="button"
                className="text-sm font-black text-purple-900 cursor-pointer hover:underline"
                onClick={() => navigate("/esqueci-senha")}
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              className="w-full mt-6 bg-purple-900 text-white py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition disabled:opacity-50"
              disabled={loadingRequisicao}
            >
              {loadingRequisicao ? "VERIFICANDO..." : "ENTRAR"}
            </button>
          </form>

          {/* Botão de Cadastre-se com Super Destaque Visual */}
          <p className="mt-6 text-center text-gray-700">
            Não tem conta?{" "}
            <button
              type="button"
              className="text-purple-900 cursor-pointer font-black text-lg underline tracking-wide hover:text-purple-700 transition"
              onClick={() => navigate("/cadastro")}
            >
              Cadastre-se
            </button>
          </p>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/visitante")}
              className="text-sm font-bold text-purple-900 underline hover:text-purple-700 transition cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
            >
              Entrar como visitante
            </button>
          </div>
        </div>

        {/* No celular a logo aparece agora em cima do formulário (order-first);
            a partir de md volta para a direita (md:order-last). */}
        <div className="order-first md:order-last flex-1 pt-6 px-6 pb-0 md:p-8 flex justify-center items-center">
          <img
            src="/logo.png"
            alt="Logo MindUp"
            className="w-40 sm:w-48 md:w-auto max-w-[280px] object-contain animate-fadeIn"
          />
        </div>
      </div>
    </main>
  );
}
