import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../service/api";

export default function CriarVideo() {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e) {
    e.preventDefault();

    if (!arquivo) {
      alert("Selecione um arquivo de vídeo.");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("arquivo", arquivo);

    try {
      setSalvando(true);

      await api.post("/videosapi", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/dashboard/videos");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar vídeo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">

      <h1 className="text-3xl font-bold text-[#ffb300] mb-6">
        Criar Novo Vídeo
      </h1>

      <form onSubmit={salvar} className="space-y-4">

        {/* TÍTULO */}
        <div>
          <label className="block mb-1 font-medium">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md text-black"
            required
          />
        </div>

        {/* DESCRIÇÃO */}
        <div>
          <label className="block mb-1 font-medium">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md h-32 text-black"
          />
        </div>

        {/* ARQUIVO */}
        <div>
          <label className="block mb-1 font-medium">Arquivo de Vídeo</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setArquivo(e.target.files[0])}
            className="w-full bg-white text-black p-2 rounded-md"
            required
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={salvando}
            className="bg-[#ff3d00] px-6 py-3 rounded-lg font-bold
                       hover:bg-[#ff5722] transition disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar Vídeo"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/videos")}
            className="bg-gray-500 px-6 py-3 rounded-lg font-bold
                       hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
