import { useParams } from "react-router";
import { useVideos } from "../../context/VideosContext";
import { Link } from "react-router";

export default function VerVideo() {
  const { id } = useParams();
  const { buscarVideoPorId } = useVideos();

  const video = buscarVideoPorId(id);

  if (!video) {
    return <p className="text-center text-red-300 mt-10">Vídeo não encontrado.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-[#1e1e1e] p-8 rounded-xl shadow-lg text-white mt-8">

      <h1 className="text-3xl font-bold text-[#ffb300] mb-6">{video.titulo}</h1>

      <video className="rounded-lg mb-6 w-full" controls>
      <source src={video.arquivo} type="video/mp4" />
      </video>

      <p className="whitespace-pre-wrap text-gray-300 mb-8 leading-relaxed">
        {video.descricao}
      </p>

      <Link
        to="/videos"
        className="inline-block px-6 py-3 rounded-full font-bold bg-[#ff914d] text-white hover:bg-[#ff6d00]"
      >
        ← Voltar aos Vídeos
      </Link>
    </div>
  );
}
