import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, autenticado, carregando } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [mensagem, setMensagem] = useState("");

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

    const resp = await login(form.email, form.senha);

    if (!resp.sucesso) {
      setMensagem("❌ " + resp.mensagem);
      return;
    }

    setMensagem("✅ Login realizado!");
    setTimeout(() => navigate(from, { replace: true }), 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full flex flex-col md:flex-row">
        
        <div className="flex-1 p-12">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            Bem-vindo(a) de volta 💜
          </h1>

          {mensagem && (
            <p className={`mt-3 font-bold ${mensagem.includes("❌") ? "text-red-600" : "text-green-600"}`}>
              {mensagem}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            
            <label className="font-semibold block mt-4">E-mail:</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label className="font-semibold block mt-4">Senha:</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg"
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              required
            />

            <button className="w-full mt-8 bg-purple-900 text-white py-3 rounded-full font-bold">
              ENTRAR
            </button>
          </form>

          <p className="mt-4 text-center">
            Não tem conta?{" "}
            <span
              className="text-purple-800 cursor-pointer font-bold"
              onClick={() => navigate("/cadastro")}
            >
              Cadastre-se
            </span>
          </p>
        </div>

        <div className="flex-1 p-8 flex justify-center items-center">
          <img src="/LogoPossivel.png" alt="Logo MindUp" className="max-w-full" />
        </div>
      </div>
    </div>
  );
}
