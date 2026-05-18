import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

export default function Perfil() {
  const { usuario, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    return <p className="text-center text-white mt-10">Carregando perfil...</p>;
  }

  const imagemFinal = usuario?.imagem_perfil || "/default_perfil.png";

  console.log("Dados do usuário:", usuario);
  console.log("URL da imagem de perfil:", imagemFinal);
  const excluirConta = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação é irreversível!",
      )
    )
      return;

    const resp = await deleteAccount();
    if (resp.sucesso) {
      alert("Conta excluída com sucesso!");
      navigate("/login");
    } else {
      alert(resp.mensagem);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-10 bg-purple-900">
      <div className="max-w-md w-full bg-purple-900 p-8 rounded-2xl shadow-xl text-white">
        <h1 className="text-3xl font-bold text-center text-purple-300 mb-6">
          Meu Perfil
        </h1>

        {/* Foto de Perfil */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              data-cy="perfil-imagem"
              src={imagemFinal}
              alt="Foto de perfil"
              className="w-40 h-40 rounded-full object-cover border-4 border-purple-500"
            />
            <button
              onClick={() => navigate("/perfil/editar")}
              className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700"
              title="Alterar foto"
            >
              📷
            </button>
          </div>
        </div>

        {/* Informações Básicas (Simplificado) */}
        <div className="space-y-4 text-left mb-8">
          <div className="bg-purple-800 p-4 rounded-lg">
            <p className="text-sm text-purple-300">Nome</p>
            <p className="text-lg font-semibold">{usuario.nome}</p>
          </div>

          <div className="bg-purple-800 p-4 rounded-lg">
            <p className="text-sm text-purple-300">Email</p>
            <p className="text-lg font-semibold">{usuario.email}</p>
          </div>

          {/* Mostra CRP apenas se existir */}
          {usuario.crp && (
            <div className="bg-purple-800 p-4 rounded-lg">
              <p className="text-sm text-purple-300">CRP</p>
              <p className="text-lg font-semibold">{usuario.crp}</p>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="mt-8 space-y-3">
          <button
            data-cy="btn-editar-perfil"
            onClick={() => navigate("/perfil/editar")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2"
          >
            <span>✏️</span> Editar Perfil
          </button>

          <button
            data-cy="btn-excluir-conta"
            onClick={excluirConta}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2"
          >
            <span>🗑️</span> Excluir Conta
          </button>

          <button
            onClick={() => navigate("/inicial")}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2"
          >
            <span>←</span> Voltar para Início
          </button>
        </div>
      </div>
    </div>
  );
}
