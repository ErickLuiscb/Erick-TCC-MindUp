import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

export default function Editar_Perfil() {
  const { usuario, updateUser } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [crp, setCrp] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || "");
      setCrp(usuario.crp || "");
      setPreview(usuario.imagem_perfil || "/default_perfil.png");
    }
  }, [usuario]);

  const enviarImagem = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagem(file);
    setPreview(URL.createObjectURL(file));
  };

  const salvarTudo = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");

    if (senha && senha !== confirmarSenha) {
      setMensagem("❌ As senhas não coincidem");
      setCarregando(false);
      return;
    }

    const fd = new FormData();
    fd.append("nome", nome);

    if (crp) fd.append("crp", crp);
    if (senha) fd.append("senha", senha);
    if (imagem) fd.append("imagem_perfil", imagem);

    const resp = await updateUser(fd);

    if (resp?.sucesso) {
      navigate("/perfil");
    } else {
      setMensagem(resp?.mensagem || "Erro ao atualizar");
    }

    setCarregando(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900">
      <form
        onSubmit={salvarTudo}
        className="bg-purple-900 p-8 rounded-xl w-full max-w-lg text-white"
      >
        <h1 className="text-2xl mb-6 text-center">Editar Perfil</h1>

        <img
          src={preview}
          alt="Preview"
          data-cy="perfil-imagem-preview"
          className="w-32 h-32 rounded-full mx-auto mb-4"
        />

        <input
          type="file"
          data-cy="perfil-upload-imagem"
          onChange={enviarImagem}
          className="hidden"
        />

        <label
          htmlFor="upload"
          className="block text-center mb-6 cursor-pointer"
          onClick={() =>
            document.querySelector('[data-cy="perfil-upload-imagem"]').click()
          }
        >
          📁 Escolher nova imagem
        </label>

        <input
          data-cy="perfil-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          className="w-full p-3 mb-4 rounded bg-purple-800"
          required
        />

        <input
          value={usuario?.email || ""}
          disabled
          className="w-full p-3 mb-4 rounded bg-purple-800 opacity-70"
        />

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Nova senha"
          className="w-full p-3 mb-4 rounded bg-purple-800"
        />

        {senha && (
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Confirmar senha"
            className="w-full p-3 mb-4 rounded bg-purple-800"
            required
          />
        )}

        <button
          type="submit"
          data-cy="perfil-salvar"
          disabled={carregando}
          className="w-full bg-purple-600 p-3 rounded"
        >
          Salvar alterações
        </button>
      </form>
    </div>
  );
}
