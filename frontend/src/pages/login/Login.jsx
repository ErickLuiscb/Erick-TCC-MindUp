import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, autenticado, carregando } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [mensagem, setMensagem] = useState("");
  const [loadingRequisicao, setLoadingRequisicao] = useState(false);

  const from = location.state?.from || "/inicial";

  useEffect(() => {
    if (!carregando && autenticado) {
      navigate("/inicial", { replace: true });
    }
  }, [carregando, autenticado]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Carregando...
      </div>
    );
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(""); // Limpa erro antigo imediatamente ao clicar
    setLoadingRequisicao(true); // Trava o botão para evitar requisições fantasmas

    const resp = await login(form.email, form.senha);

    if (!resp.sucesso) {
      setMensagem("❌ " + resp.mensagem);
      setLoadingRequisicao(false); // Libera o formulário apenas se der erro real
      return;
    }

    setMensagem("✅ Login realizado!");
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full flex flex-col md:flex-row">
        <div className="flex-1 p-12">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            Bem-vindo(a) de volta 💜
          </h1>

          {mensagem && (
            <p
              className={`mt-3 font-bold ${mensagem.includes("❌") ? "text-red-600" : "text-green-600"}`}
            >
              {mensagem}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <label className="font-semibold block mt-4 text-purple-900">
              E-mail:
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-purple-600"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loadingRequisicao}
            />

            <label className="font-semibold block mt-4 text-purple-900">
              Senha:
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-purple-600"
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              required
              disabled={loadingRequisicao}
            />

            {/* Link Esqueceu a Senha em Negrito e Destacado */}
            <div className="text-right mt-2">
              <span
                className="text-sm font-black text-purple-900 cursor-pointer hover:underline"
                onClick={() =>
                  alert(
                    "Funcionalidade de recuperação enviada para o e-mail informado!",
                  )
                }
              >
                Esqueceu a senha?
              </span>
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
            <span
              className="text-purple-900 cursor-pointer font-black text-lg underline tracking-wide hover:text-purple-700 transition"
              onClick={() => navigate("/cadastro")}
            >
              Cadastre-se
            </span>
          </p>
        </div>

        <div className="flex-1 p-8 flex justify-center items-center">
          {/* Corrigido o caminho do arquivo para a logo oficial que ajustei no PWA */}
          <img
            src="/logo.png"
            alt="Logo MindUp"
            className="max-w-[280px] object-contain animate-fadeIn"
          />
        </div>
      </div>
    </div>
  );
}
