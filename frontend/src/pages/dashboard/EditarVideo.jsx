import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../service/api";

export default function EditarVideo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // ============================
  // CARREGAR VÍDEO
  // ============================
  useEffect(() => {
    async function carregarVideo() {
      try {
        const resp = await api.get(`/videosapi/${id}`);
        const video = resp.data.data ?? resp.data;

        setTitulo(video.titulo);
        setDescricao(video.descricao ?? "");
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar vídeo.");
        navigate("/dashboard/videos");
      } finally {
        setCarregando(false);
      }
    }

    carregarVideo();
  }, [id, navigate]);

  // ============================
  // SALVAR ALTERAÇÕES
  // ============================
  async function salvar(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);

    if (arquivo) {
      formData.append("arquivo", arquivo);
    }

    try {
      setSalvando(true);

      await api.post(`/videosapi/${id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/dashboard/videos");
    } catch (error) {
      console.error(error);
      alert("Erro ao editar vídeo.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="text-center text-white mt-10">Carregando...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">

      <h1 className="text-3xl font-bold text-[#ffb300] mb-6">
        Editar Vídeo
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

        {/* NOVO ARQUIVO (OPCIONAL) */}
        <div>
          <label className="block mb-1 font-medium">
            Trocar Arquivo de Vídeo (opcional)
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setArquivo(e.target.files[0])}
            className="w-full bg-white text-black p-2 rounded-md"
          />
          <p className="text-sm text-gray-300 mt-1">
            Se não selecionar um arquivo, o vídeo atual será mantido.
          </p>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={salvando}
            className="bg-[#ff3d00] px-6 py-3 rounded-lg font-bold
                       hover:bg-[#ff5722] transition disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
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
