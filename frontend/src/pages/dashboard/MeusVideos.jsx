import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../service/api";

export default function MeusVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [carregando, setCarregando] = useState(true);

// ============================
// CARREGAR VÍDEOS DO AUTOR
// ============================
async function carregarVideos() {
  try {
    const resp = await api.get("/dashboard/videos");
    setVideos(resp.data.data ?? []);
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar vídeos.");
  } finally {
    setCarregando(false);
  }
}

  // ============================
  // EXCLUIR VÍDEO
  // ============================
  async function excluirVideo(id, titulo) {
    const ok = window.confirm(
      `Tem certeza que deseja excluir o vídeo:\n\n"${titulo}" ?`
    );

    if (!ok) return;

    try {
      await api.delete(`/videosapi/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir vídeo.");
    }
  }

  useEffect(() => {
    carregarVideos();
  }, []);

  if (carregando) {
    return <p className="text-center text-white mt-10">Carregando...</p>;
  }

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">

      {/* TOPO */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#ffb300]">
          Meus Vídeos
        </h1>

        <button
          onClick={() => navigate("/dashboard/videos/criar")}
          className="bg-[#ff3d00] px-6 py-3 rounded-full font-bold
                     hover:bg-[#ff5722] transition"
        >
          + Criar Vídeo
        </button>
      </div>

      {/* LISTA */}
      {videos.length === 0 && (
        <p className="text-center text-gray-300 mt-10">
          Você ainda não publicou nenhum vídeo.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow-lg p-4 text-black
                       hover:scale-[1.02] transition"
          >
            <video
              className="rounded-lg w-full mb-3"
              muted
              preload="metadata"
            >
              <source src={video.arquivo} type="video/mp4" />
            </video>

            <h3 className="text-lg font-bold text-[#4a0072]">
              {video.titulo}
            </h3>

            <p className="text-sm text-gray-600 mt-1 line-clamp-3">
              {video.descricao}
            </p>

            {/* AÇÕES */}
            <div className="flex justify-between items-center mt-4">
              <Link
                to={`/dashboard/videos/editar/${video.id}`}
                className="text-yellow-600 font-semibold hover:underline"
              >
                ✏️ Editar
              </Link>

              <button
                onClick={() => excluirVideo(video.id, video.titulo)}
                className="text-red-600 font-semibold hover:underline"
              >
                🗑️ Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
