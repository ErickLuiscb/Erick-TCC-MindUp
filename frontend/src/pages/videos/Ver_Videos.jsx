import { useParams, Link } from "react-router";
import { useVideos } from "../../context/VideosContext";
import { ArrowLeft, Film, Calendar } from "lucide-react";

export default function VerVideo() {
  const { id } = useParams();
  const { buscarVideoPorId, carregando } = useVideos();

  const video = buscarVideoPorId(id);

  if (carregando) {
    return (
      <div className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Carregando player de vídeo...
        </p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl text-white">
        <p className="text-xl font-bold">❌ Vídeo não encontrado</p>
        <p className="text-purple-200 text-xs mt-2">
          O conteúdo solicitado pode ter sido desativado pelo autor ou removido.
        </p>
        <Link
          to="/videos"
          className="inline-block mt-4 text-xs font-bold text-[#ffb300] uppercase tracking-wider hover:underline"
        >
          Voltar para a galeria
        </Link>
      </div>
    );
  }

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-2 text-black animate-fadeIn">
      {/* Botão Superior de Voltar */}
      <Link
        to="/videos"
        className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar para a Galeria</span>
      </Link>

      {/* Container Principal do Player com Linguagem Moderna */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100 flex flex-col">
        {/* PLAYER DE VÍDEO COMPACTADO (Proporção 16:9 Estrita) */}
        <div className="w-full aspect-video bg-black relative flex items-center justify-center shadow-inner">
          <video
            className="w-full h-full object-contain focus:outline-none"
            controls
            controlsList="nodownload" // bloqueia o download nativo do vídeo
            preload="auto"
          >
            <source src={video.arquivo} type="video/mp4" />
            Seu navegador não suporta a reprodução de vídeos HTML5.
          </video>
        </div>

        {/* DETALHES TEXTUAIS DO CONTEÚDO */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div>
            {/* Categoria Badges e Data */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {video.categorias?.map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100"
                  >
                    {c.nome}
                  </span>
                ))}
                {(!video.categorias || video.categorias.length === 0) && (
                  <span className="text-[10px] font-bold uppercase text-gray-400">
                    Geral
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                <Calendar size={13} className="text-purple-500" />
                <span>Publicado em: {formatarData(video.created_at)}</span>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-black text-purple-950 tracking-wide leading-tight mb-4 flex items-center gap-2">
              <Film size={22} className="text-purple-700 shrink-0" />
              <span>{video.titulo}</span>
            </h1>

            {/* Descrição em Bloco Acolhedor com scroll controlado */}
            <p className="whitespace-pre-wrap text-sm md:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {video.descricao ||
                "Este vídeo não possui uma descrição fornecida pelo autor."}
            </p>
          </div>

          {/* Rodapé com botão secundário de fechamento rápido */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
            <Link
              to="/videos"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              Fechar Player
            </Link>

            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              MindUp Psicoeducação
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
