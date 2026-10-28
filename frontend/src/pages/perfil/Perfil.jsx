import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { semEspacos, bloquearEspaco } from "../../utils/senha";

export default function Perfil() {
  const { usuario, updateUser, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário unificado
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState("");
  const [manterConteudos, setManterConteudos] = useState(true);

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || "");
      setPreview(usuario.imagem_perfil || "/default_perfil.png");
    }
  }, [usuario]);

  if (!usuario) {
    return (
      <p className="text-center text-white mt-10 text-xl">
        Carregando dados do perfil...
      </p>
    );
  }

  // Captura e validação da foto
  const handleImagemChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMensagem("❌ A imagem deve ter no máximo 2MB");
      return;
    }

    setImagem(file);
    if (preview && !preview.includes("storage")) {
      URL.revokeObjectURL(preview); // Limpa lixo de memória
    }
    setPreview(URL.createObjectURL(file));
  };

  // Salva as alterações de Nome, Senha ou Foto
  const handleSalvarAlteracoes = async (e) => {
    e.preventDefault();
    setCarregando(false);
    setMensagem("");

    if (senha && senha !== confirmarSenha) {
      setMensagem("❌ As senhas informadas não coincidem.");
      return;
    }

    setCarregando(true);

    const fd = new FormData();
    fd.append("_method", "PUT"); // 👈 Method Spoofing obrigatório no Laravel para updates com arquivos
    fd.append("nome", nome);

    if (senha) fd.append("senha", senha);
    if (imagem) fd.append("imagem_perfil", imagem);

    const resp = await updateUser(fd);

    if (resp?.sucesso) {
      setMensagem("✅ Perfil atualizado com sucesso!");
      setSenha("");
      setConfirmarSenha("");
      setImagem(null);
    } else {
      setMensagem("❌ " + (resp?.mensagem || "Erro ao atualizar dados."));
    }
    setCarregando(false);
  };

  // Executa o Teste Especial de Exclusão de Conta
  const handleExcluirConta = async () => {
    if (
      !window.confirm(
        "⚠️ ATENÇÃO: Tem certeza absoluta que deseja excluir sua conta? Esta ação é irreversível!",
      )
    )
      return;

    // Passa o parâmetro dinâmico para o backend saber se limpa ou mantém as mídias no servidor
    const resp = await deleteAccount(manterConteudos);

    if (resp.sucesso) {
      alert("Conta removida do sistema com sucesso.");
      navigate("/login");
    } else {
      alert(resp.mensagem);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <h1 className="sr-only">Meu perfil</h1>

      {/* Alerta de Feedback */}
      {mensagem && (
        <div
          role={mensagem.includes("❌") ? "alert" : "status"}
          className={`p-4 rounded-xl font-bold mb-6 border shadow-xs ${mensagem.includes("❌") ? "bg-red-100 border-red-200 text-red-700" : "bg-green-100 border-green-200 text-green-700"}`}
        >
          {mensagem}
        </div>
      )}

      {/* Caixa Branca em Grid Duplo (Acessível no Mobile, Lindo no Desktop) */}
      {/* Celular: uma coluna na ordem Identificação -> Formulário -> Zona de perigo
            (o botão de excluir conta fica por ÚLTIMO).
            md em diante: 2 colunas; a zona de perigo volta para o pé da coluna da esquerda. */}
      <div className="bg-white rounded-2xl shadow-2xl text-gray-800 flex flex-col md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:grid-rows-[1fr_auto] overflow-hidden border border-purple-100">
        {/* COLUNA DA ESQUERDA: Identificação Visual */}
        <div className="md:col-start-1 md:row-start-1 bg-purple-50 p-5 sm:p-8 md:pb-0 flex flex-col items-center border-b md:border-b-0 md:border-r border-purple-100">
          <div className="text-center w-full flex flex-col items-center">
            <h2 className="text-xs font-black tracking-widest text-purple-600 uppercase mb-4">
              Identificação
            </h2>

            {/* Bloco da Imagem */}
            <button
              type="button"
              aria-label="Alterar foto de perfil"
              className="relative group cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
              onClick={() => document.getElementById("input-foto").click()}
            >
              <img
                src={preview}
                alt=""
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-purple-600 shadow-md group-hover:opacity-80 transition"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-2 right-2 bg-purple-700 text-white p-2.5 rounded-full shadow-lg hover:bg-purple-800 transition"
              >
                📷
              </span>
            </button>

            <input
              id="input-foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImagemChange}
              className="hidden"
              disabled={carregando}
            />
            <p className="text-xs text-gray-500 mt-2">
              Clique na foto para alterar
            </p>

            {/* Badges de Tipo */}
            <div className="mt-4 px-4 py-1.5 rounded-full bg-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs">
              {usuario?.tipo}
            </div>

            {/* Informações Fixas Bloqueadas */}
            <div className="w-full mt-6 space-y-3 text-left">
              <div>
                <label
                  htmlFor="perfil-email"
                  className="text-[11px] font-bold uppercase tracking-wider text-purple-700"
                >
                  E-mail de Cadastro
                </label>
                <input
                  id="perfil-email"
                  type="text"
                  value={usuario?.email || ""}
                  disabled
                  className="w-full p-2.5 mt-1 bg-gray-100 border border-gray-200 text-gray-500 rounded-lg text-sm font-semibold opacity-80 cursor-not-allowed select-none"
                />
              </div>

              {usuario?.crp && (
                <div className="animate-fadeIn">
                  <label
                    htmlFor="perfil-crp"
                    className="text-[11px] font-bold uppercase tracking-wider text-purple-700"
                  >
                    Registro Profissional (CRP)
                  </label>
                  <input
                    id="perfil-crp"
                    type="text"
                    value={usuario?.crp || ""}
                    disabled
                    className="w-full p-2.5 mt-1 bg-gray-100 border border-gray-200 text-gray-500 rounded-lg text-sm font-semibold opacity-80 cursor-not-allowed select-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: Formulário de Atualização Dados */}
        <form
          onSubmit={handleSalvarAlteracoes}
          className="md:col-start-2 md:row-start-1 md:row-span-2 p-5 sm:p-8 flex flex-col justify-between gap-6"
        >
          <div>
            <h2 className="text-xs font-black tracking-widest text-purple-600 uppercase mb-6">
              Configurações Cadastrais
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="perfil-nome"
                  className="text-xs font-bold text-purple-950"
                >
                  Nome Completo:
                </label>
                <input
                  id="perfil-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 mt-1 border border-gray-300 rounded-xl focus:outline-purple-600 text-sm text-black"
                  required
                  disabled={carregando}
                />
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-purple-600 mb-2">
                  🛡️ Alteração de Credenciais de Acesso
                </p>
                <p className="text-[11px] text-gray-500 mb-4">
                  Caso não queira alterar sua senha atual, basta deixar os
                  campos abaixo vazios.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="perfil-senha"
                      className="text-xs font-bold text-purple-950"
                    >
                      Nova Senha (mín. 6):
                    </label>
                    <div className="relative">
                      <input
                        id="perfil-senha"
                        autoComplete="new-password"
                        type={mostrarSenha ? "text" : "password"}
                        value={senha}
                        onChange={(e) => setSenha(semEspacos(e.target.value))}
                        onKeyDown={bloquearEspaco}
                        className="w-full p-3 pr-12 mt-1 border border-gray-300 rounded-xl focus:outline-purple-600 text-sm text-black"
                        placeholder="••••••••"
                        minLength={6}
                        disabled={carregando}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha((v) => !v)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-purple-700 cursor-pointer"
                        aria-label={
                          mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {mostrarSenha ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="perfil-confirmar-senha"
                      className="text-xs font-bold text-purple-950"
                    >
                      Confirmar Nova Senha:
                    </label>
                    <div className="relative">
                      <input
                        id="perfil-confirmar-senha"
                        autoComplete="new-password"
                        type={mostrarConfirmarSenha ? "text" : "password"}
                        value={confirmarSenha}
                        onChange={(e) =>
                          setConfirmarSenha(semEspacos(e.target.value))
                        }
                        onKeyDown={bloquearEspaco}
                        className="w-full p-3 pr-12 mt-1 border border-gray-300 rounded-xl focus:outline-purple-600 text-sm text-black"
                        placeholder="••••••••"
                        disabled={carregando}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmarSenha((v) => !v)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-purple-700 cursor-pointer"
                        aria-label={
                          mostrarConfirmarSenha
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                      >
                        {mostrarConfirmarSenha ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/inicial")}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition"
              disabled={carregando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition"
              disabled={carregando}
            >
              {carregando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {/* ZONA DE PERIGO / EXCLUSÃO DE CONTA
            Celular: último bloco da tela, depois do formulário.
            md em diante: rodapé da coluna da esquerda (mesma aparência de antes). */}
        <div className="md:col-start-1 md:row-start-2 md:self-end bg-purple-50 p-5 sm:p-8 border-t border-purple-100 md:border-t-0 md:border-r md:pt-0">
          <div className="md:mt-12 md:pt-6 md:border-t md:border-purple-200">
            <h2 className="text-xs font-black uppercase text-red-600 tracking-wider mb-2">
              Verifique antes de agir
            </h2>

            {/* Se for psicólogo, exibe o seletor do teste especial antes de deletar */}
            {usuario?.tipo === "psicologo" && (
              <label className="flex items-start gap-2 bg-red-50 p-2.5 rounded-lg border border-red-100 mb-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={manterConteudos}
                  onChange={(e) => setManterConteudos(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <p className="text-[11px] font-bold text-red-900">
                    Manter minhas postagens no app
                  </p>
                  <p className="text-[11px] text-red-700">
                    Seus vídeos e PDFs continuarão visíveis para os pacientes.
                  </p>
                </div>
              </label>
            )}

            <button
              type="button"
              onClick={handleExcluirConta}
              disabled={carregando}
              className="w-full bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 py-3 md:py-2.5 rounded-xl text-xs font-bold transition uppercase tracking-wider"
            >
              <span aria-hidden="true">🗑️</span> Excluir minha conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
