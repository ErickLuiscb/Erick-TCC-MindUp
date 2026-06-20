import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function Cadastro() {
  const navigate = useNavigate();
  const { registrar, autenticado, carregando } = useAuth();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmar: "",
    imagem: null,
    crp: "",
    tipo: "usuario", // 'usuario' ou 'psicologo'
  });

  const [mensagem, setMensagem] = useState("");
  const [preview, setPreview] = useState(null);
  const [loadingCadastro, setLoadingCadastro] = useState(false);

  useEffect(() => {
    if (!carregando && autenticado) {
      navigate("/inicial", { replace: true });
    }
  }, [carregando, autenticado]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-700 text-xl font-bold">
        Carregando...
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imagem" && files && files[0]) {
      const file = files[0];

      // Validar tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMensagem("❌ A imagem deve ter no máximo 2MB");
        return;
      }

      // Validar tipo
      const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
      if (!tiposPermitidos.includes(file.type)) {
        setMensagem("❌ Formato inválido. Use JPG, PNG ou WEBP");
        return;
      }

      setForm((prev) => ({
        ...prev,
        imagem: file,
      }));

      // Limpa o preview antigo da memória antes de criar o novo
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      // Criar preview de forma limpa
      setPreview(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    // Validações
    if (form.senha !== form.confirmar) {
      setMensagem("❌ As senhas não coincidem!");
      return;
    }

    if (form.senha.length < 6) {
      setMensagem("❌ A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (form.tipo === "psicologo" && !form.crp.trim()) {
      setMensagem("❌ Psicólogos devem informar o CRP");
      return;
    }

    setLoadingCadastro(true);

    // Preparar FormData
    const fd = new FormData();
    fd.append("nome", form.nome);
    fd.append("email", form.email);
    fd.append("senha", form.senha);
    fd.append("tipo", form.tipo);

    if (form.tipo === "psicologo") {
      fd.append("crp", form.crp);
    }

    if (form.imagem) {
      fd.append("imagem_perfil", form.imagem);
    }

    const r = await registrar(fd);

    if (r.sucesso) {
      setMensagem("✅ Cadastro realizado com sucesso!");
      if (preview) URL.revokeObjectURL(preview);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setMensagem("❌ " + r.mensagem);
      setLoadingCadastro(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-xl max-w-[900px] w-full mx-auto my-12 p-4 text-black">
      <div className="flex-1 p-10">
        <h1 className="text-3xl text-purple-700 font-bold">Cadastre-se</h1>

        {mensagem && (
          <p
            className={`mt-3 font-bold ${mensagem.includes("❌") ? "text-red-600" : "text-green-600"}`}
          >
            {mensagem}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mt-4 font-bold text-purple-900">Nome:</label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            disabled={loadingCadastro}
          />

          <label className="block mt-4 font-bold text-purple-900">Email:</label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loadingCadastro}
          />

          <label className="block mt-4 font-bold text-purple-900">
            Senha (mínimo 6 caracteres):
          </label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            required
            minLength={6}
            disabled={loadingCadastro}
          />

          <label className="block mt-4 font-bold text-purple-900">
            Confirmar Senha:
          </label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
            type="password"
            name="confirmar"
            value={form.confirmar}
            onChange={handleChange}
            required
            disabled={loadingCadastro}
          />

          <label className="block mt-4 font-bold text-purple-900">
            Imagem de Perfil (opcional):
          </label>

          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-400"
              />
            </div>
          )}

          <input
            className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
            type="file"
            name="imagem"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={loadingCadastro}
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos: JPG, PNG, WEBP (máx. 2MB)
          </p>

          <label className="block mt-4 font-bold text-purple-900">
            Tipo de Conta:
          </label>
          <select
            name="tipo"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-purple-600 cursor-pointer"
            value={form.tipo}
            onChange={handleChange}
            disabled={loadingCadastro}
          >
            <option value="usuario">Usuário</option>
            <option value="psicologo">Psicólogo</option>
          </select>

          {form.tipo === "psicologo" && (
            <div className="animate-fadeIn">
              <label className="block mt-4 font-bold text-purple-900">
                CRP (Registro Profissional):
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
                type="text"
                name="crp"
                value={form.crp}
                onChange={handleChange}
                placeholder="Digite seu número de CRP"
                required={form.tipo === "psicologo"}
                disabled={loadingCadastro}
              />
              <p className="text-xs text-gray-500 mt-1">
                Apenas psicólogos podem criar e publicar conteúdos
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loadingCadastro}
            className="w-full bg-purple-800 hover:bg-purple-900 text-white p-4 mt-6 rounded-full font-bold transition duration-300 shadow-md disabled:opacity-50"
          >
            {loadingCadastro ? "CADASTRANDO..." : "FINALIZAR CADASTRO"}
          </button>

          <p className="text-center mt-4 text-gray-600">
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-purple-700 hover:text-purple-900 font-bold underline"
              disabled={loadingCadastro}
            >
              Faça login aqui
            </button>
          </p>
        </form>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 rounded-r-2xl md:rounded-l-none">
        <img
          src="/logo.png"
          alt="Logo MindUp"
          className="max-w-[280px] object-contain"
        />
      </div>
    </div>
  );
}
