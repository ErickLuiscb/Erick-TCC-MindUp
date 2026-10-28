import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, XCircle, Mail, Eye, EyeOff } from "lucide-react";
import { semEspacos, bloquearEspaco } from "../../utils/senha";
import {
  REGIOES_CRP,
  formatarCpf,
  cpfValido,
  crpNumeroValido,
} from "../../utils/crp";

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
    crp_regiao: "",
    cpf: "",
    tipo: "usuario", // 'usuario' ou 'psicologo'
  });

  const [mensagem, setMensagem] = useState("");
  const [preview, setPreview] = useState(null);
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  useEffect(() => {
    if (!carregando && autenticado) {
      navigate("/inicial", { replace: true });
    }
  }, [carregando, autenticado]);

  if (carregando) {
    return (
      <div
        role="status"
        className="min-h-dvh flex items-center justify-center text-purple-700 text-xl font-bold"
      >
        Carregando...
      </div>
    );
  }

  // Campos de senha: a tecla de espaço não faz nada e espaços colados são removidos
  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: semEspacos(value) }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imagem" && files && files[0]) {
      const file = files[0];

      // Validar tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMensagem("❌ A imagem deve ter no máximo 2MB");
        setModalAberto(true);
        return;
      }

      // Validar tipo
      const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
      if (!tiposPermitidos.includes(file.type)) {
        setMensagem("❌ Formato inválido. Use JPG, PNG ou WEBP");
        setModalAberto(true);
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
    } else if (name === "cpf") {
      // CPF é formatado enquanto digita (000.000.000-00)
      setForm((prev) => ({ ...prev, cpf: formatarCpf(value) }));
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
      setModalAberto(true);
      return;
    }

    if (form.senha.length < 6) {
      setMensagem("❌ A senha deve ter pelo menos 6 caracteres");
      setModalAberto(true);
      return;
    }

    if (form.tipo === "psicologo") {
      if (!form.crp_regiao) {
        setMensagem("❌ Selecione a região do seu CRP");
        setModalAberto(true);
        return;
      }

      if (!form.crp.trim()) {
        setMensagem("❌ Psicólogos devem informar o CRP");
        setModalAberto(true);
        return;
      }

      if (!crpNumeroValido(form.crp)) {
        setMensagem(
          "❌ Informe somente o número do CRP, sem a região nem símbolos",
        );
        setModalAberto(true);
        return;
      }

      if (!cpfValido(form.cpf)) {
        setMensagem("❌ CPF inválido. Confira os 11 dígitos");
        setModalAberto(true);
        return;
      }
    }

    setLoadingCadastro(true);

    // Preparar FormData
    const fd = new FormData();
    fd.append("nome", form.nome);
    fd.append("email", form.email);
    fd.append("senha", form.senha);
    fd.append("tipo", form.tipo);

    if (form.tipo === "psicologo") {
      fd.append("crp_regiao", form.crp_regiao);
      fd.append("crp", form.crp.trim());
      fd.append("cpf", form.cpf);
    }

    if (form.imagem) {
      fd.append("imagem_perfil", form.imagem);
    }

    const r = await registrar(fd);

    if (r.sucesso) {
      setMensagem(
        "Enviamos um e-mail de confirmação — verifique sua caixa de entrada (e o spam) antes de fazer login.",
      );
      setCadastroConcluido(true);
      setModalAberto(true);
      if (preview) URL.revokeObjectURL(preview);
    } else {
      setMensagem("❌ " + r.mensagem);
      setCadastroConcluido(false);
      setModalAberto(true);
      setLoadingCadastro(false);
    }
  };

  const fecharModalEIrParaLogin = () => {
    setModalAberto(false);
    navigate("/login");
  };

  return (
    <main className="flex flex-col md:flex-row bg-white rounded-2xl shadow-xl w-[calc(100%-2rem)] max-w-[900px] mx-auto my-4 sm:my-8 md:my-12 p-2 sm:p-4 text-black">
      <div className="flex-1 p-5 sm:p-8 md:p-10">
        <h1 className="text-2xl sm:text-3xl text-purple-700 font-bold">
          Cadastre-se
        </h1>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="cadastro-nome"
            className="block mt-4 font-bold text-purple-900"
          >
            Nome:
          </label>
          <input
            id="cadastro-nome"
            autoComplete="name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            disabled={loadingCadastro}
          />

          <label
            htmlFor="cadastro-email"
            className="block mt-4 font-bold text-purple-900"
          >
            Email:
          </label>
          <input
            id="cadastro-email"
            autoComplete="email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loadingCadastro}
          />

          <label
            htmlFor="cadastro-senha"
            className="block mt-4 font-bold text-purple-900"
          >
            Senha (mínimo 6 caracteres):
          </label>
          <div className="relative">
            <input
              id="cadastro-senha"
              autoComplete="new-password"
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-purple-600"
              type={mostrarSenha ? "text" : "password"}
              name="senha"
              value={form.senha}
              onChange={handleSenhaChange}
              onKeyDown={bloquearEspaco}
              required
              minLength={6}
              disabled={loadingCadastro}
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

          <label
            htmlFor="cadastro-confirmar"
            className="block mt-4 font-bold text-purple-900"
          >
            Confirmar Senha:
          </label>
          <div className="relative">
            <input
              id="cadastro-confirmar"
              autoComplete="new-password"
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-purple-600"
              type={mostrarConfirmar ? "text" : "password"}
              name="confirmar"
              value={form.confirmar}
              onChange={handleSenhaChange}
              onKeyDown={bloquearEspaco}
              required
              disabled={loadingCadastro}
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmar((v) => !v)}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-gray-500 hover:text-purple-700 cursor-pointer"
              aria-label={
                mostrarConfirmar
                  ? "Ocultar confirmação de senha"
                  : "Mostrar confirmação de senha"
              }
            >
              {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label
            htmlFor="cadastro-imagem"
            className="block mt-4 font-bold text-purple-900"
          >
            Imagem de Perfil (opcional):
          </label>

          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Pré-visualização da imagem de perfil"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-400"
              />
            </div>
          )}

          <input
            id="cadastro-imagem"
            aria-describedby="cadastro-imagem-ajuda"
            className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
            type="file"
            name="imagem"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={loadingCadastro}
          />
          <p id="cadastro-imagem-ajuda" className="text-xs text-gray-500 mt-1">
            Formatos: JPG, PNG, WEBP (máx. 2MB)
          </p>

          <label
            htmlFor="cadastro-tipo"
            className="block mt-4 font-bold text-purple-900"
          >
            Tipo de Conta:
          </label>
          <select
            id="cadastro-tipo"
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
              <div
                role="note"
                className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-900 leading-relaxed"
              >
                <p className="font-bold">
                  Confira seus dados antes de se cadastrar 💜
                </p>
                <p className="mt-1 text-xs">
                  Nossa equipe vai conferir o seu registro profissional (região,
                  número do CRP e CPF). Um erro de digitação pode atrasar a
                  aprovação, e a correção depende de contato com a equipe. Vale
                  revisar tudo antes de enviar.
                </p>
              </div>

              <label
                htmlFor="cadastro-crp-regiao"
                className="block mt-4 font-bold text-purple-900"
              >
                Região do CRP:
              </label>
              <select
                id="cadastro-crp-regiao"
                name="crp_regiao"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-purple-600 cursor-pointer"
                value={form.crp_regiao}
                onChange={handleChange}
                required={form.tipo === "psicologo"}
                disabled={loadingCadastro}
              >
                <option value="">Selecione a região</option>
                {REGIOES_CRP.map((r) => (
                  <option key={r.valor} value={r.valor}>
                    {r.rotulo}
                  </option>
                ))}
              </select>

              <label
                htmlFor="cadastro-crp"
                className="block mt-4 font-bold text-purple-900"
              >
                Número do CRP:
              </label>
              <input
                id="cadastro-crp"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
                type="text"
                inputMode="numeric"
                name="crp"
                value={form.crp}
                onChange={handleChange}
                placeholder="Somente o número, ex.: 31253"
                required={form.tipo === "psicologo"}
                disabled={loadingCadastro}
              />

              <label
                htmlFor="cadastro-cpf"
                className="block mt-4 font-bold text-purple-900"
              >
                CPF:
              </label>
              <input
                id="cadastro-cpf"
                aria-describedby="cadastro-cpf-ajuda"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-purple-600"
                type="text"
                inputMode="numeric"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                autoComplete="off"
                required={form.tipo === "psicologo"}
                disabled={loadingCadastro}
              />
              <p id="cadastro-cpf-ajuda" className="text-xs text-gray-500 mt-1">
                Usado só para conferir seu registro no Conselho; não é exibido a
                outros usuários e é apagado assim que a análise terminar. Seu
                cadastro passará por análise antes de você poder criar e
                publicar conteúdos.
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

      {/* No celular a logo aparece agora em cima do formulário (order-first), pequena e
          sem o fundo cinza; a partir de md volta para a direita, como antes. */}
      <div className="order-first md:order-last flex-1 flex items-center justify-center pt-4 pb-2 md:p-8 md:bg-gray-50 md:rounded-r-2xl">
        <img
          src="/logo.png"
          alt="Logo MindUp"
          className="w-40 sm:w-48 md:w-auto max-w-[280px] object-contain"
        />
      </div>

      {/* MODAL — fica fixo no centro da tela, visível independente
          de quanto o usuário tenha rolado o formulário, para garantir que o usuário veja a mensagem
          de sucesso e instrução de confirmar email, ou mensagem de erro */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div
            role={cadastroConcluido ? "dialog" : "alertdialog"}
            aria-modal="true"
            aria-labelledby="cadastro-modal-titulo"
            aria-describedby="cadastro-modal-descricao"
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center max-h-[90dvh] overflow-y-auto"
          >
            {cadastroConcluido ? (
              <>
                <CheckCircle2
                  size={48}
                  className="text-green-600 mx-auto mb-4"
                />
                <h2
                  id="cadastro-modal-titulo"
                  className="text-xl font-black text-purple-900 mb-2"
                >
                  Cadastro realizado!
                </h2>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
                  <Mail size={20} className="text-purple-700 shrink-0 mt-0.5" />
                  <p
                    id="cadastro-modal-descricao"
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    {mensagem}
                  </p>
                </div>
                {form.tipo === "psicologo" && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Como psicólogo, seu registro profissional será analisado.
                      Você poderá entrar depois de confirmar o e-mail, mas só
                      poderá publicar conteúdos depois da aprovação.
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  autoFocus
                  onClick={fecharModalEIrParaLogin}
                  className="w-full bg-purple-900 text-white py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition cursor-pointer"
                >
                  Entendi, ir para o login
                </button>
              </>
            ) : (
              <>
                <XCircle size={48} className="text-red-600 mx-auto mb-4" />
                <h2
                  id="cadastro-modal-titulo"
                  className="text-xl font-black text-purple-900 mb-2"
                >
                  Não foi possível cadastrar
                </h2>
                <p
                  id="cadastro-modal-descricao"
                  className="text-sm text-gray-600 leading-relaxed mb-6"
                >
                  {mensagem.replace("❌ ", "")}
                </p>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setModalAberto(false)}
                  className="w-full bg-purple-100 text-purple-900 py-3 rounded-full font-bold hover:bg-purple-200 transition cursor-pointer"
                >
                  Entendi, vou corrigir
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
