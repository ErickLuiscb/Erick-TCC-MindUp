import { useState } from "react";
import { Link } from "react-router";
import { useVideos } from "../../context/VideosContext";

export default function Videos() {
  const { videos, carregando } = useVideos();
  const [busca, setBusca] = useState("");

  const filtrados = videos.filter((v) =>
    v.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) return <p className="text-center text-white mt-10">Carregando vídeos...</p>;

  return (
    <div className="text-white">

      {/* BARRA DE BUSCA */}
      <div className="flex justify-center mb-6">
        <div className="flex w-full max-w-xl">
          <input
            type="text"
            placeholder="Buscar por título..."
            className="flex-1 p-3 rounded-l-full border border-gray-300 text-black"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <button type="button" className="px-6 bg-[#4a0072] text-white rounded-r-full">
            🔍
          </button>
        </div>
      </div>

      {/* GRID DE VÍDEOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-8">

        {filtrados.length === 0 && (
          <p className="text-center col-span-full text-white">Nenhum vídeo encontrado.</p>
        )}

        {filtrados.map((video) => (
          <Link
            key={video.id}
            to={`/videos/${video.id}`}
            className="transition-transform duration-200 hover:scale-105"
          >
            <div className="bg-white rounded-xl shadow-lg p-4 text-black">
              <video className="rounded-lg w-full" muted preload="metadata">
              <source src={video.arquivo} type="video/mp4" />
               </video>

              <h3 className="text-lg font-bold text-[#4a0072] mt-3">{video.titulo}</h3>

              <p className="text-sm text-gray-600 mt-2">{video.descricao}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
