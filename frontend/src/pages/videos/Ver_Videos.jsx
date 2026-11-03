import { useParams, useNavigate, Link } from "react-router";
import { useVideos } from "../../context/VideosContext";
import { ArrowLeft, Film, Calendar, Heart } from "lucide-react";

export default function VerVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { buscarVideoPorId, carregando, alternarFavoritoVideo } = useVideos();

  const video = buscarVideoPorId(id);

  if (carregando) {
    return (
      <div role="status" className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Carregando player de vídeo...
        </p>
      </div>
    );
  }

  if (!video) {
    return (
      <div
        role="alert"
        className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl text-white"
      >
        <p className="text-xl font-bold">❌ Vídeo não encontrado</p>
        <p className="text-purple-200 text-xs mt-2">
          O conteúdo solicitado pode ter sido desativado pelo autor ou removido.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-block mt-4 text-xs font-bold text-[#ffb300] uppercase tracking-wider hover:underline cursor-pointer"
        >
          Voltar
        </button>
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
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-4 sm:mb-6 group transition-colors cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar</span>
      </button>

      {/* Container Principal do Player com Linguagem Moderna */}
      <article className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100 flex flex-col">
        {/* PLAYER DE VÍDEO COMPACTADO (Proporção 16:9 Estrita) */}
        <div className="w-full aspect-video bg-black relative flex items-center justify-center shadow-inner">
          <video
            className="w-full h-full object-contain focus:outline-none"
            controls
            playsInline
            aria-label={`Vídeo: ${video.titulo}`}
            controlsList="nodownload" // bloqueia o download nativo do vídeo
            preload="auto"
          >
            <source src={video.arquivo} type="video/mp4" />
            Seu navegador não suporta a reprodução de vídeos HTML5.
          </video>
        </div>

        {/* DETALHES TEXTUAIS DO CONTEÚDO */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col justify-between">
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

              <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                <Calendar size={13} className="text-purple-500" />
                <span>
                  Publicado em:{" "}
                  <time dateTime={video.created_at}>
                    {formatarData(video.created_at)}
                  </time>
                </span>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-black text-purple-950 tracking-wide leading-tight mb-4 flex items-center gap-2">
              <Film size={22} className="text-purple-700 shrink-0" />
              <span className="min-w-0 wrap-break-words">{video.titulo}</span>
            </h1>

            {/* Descrição em Bloco Acolhedor com scroll controlado */}
            <p className="whitespace-pre-wrap text-sm md:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {video.descricao ||
                "Este vídeo não possui uma descrição fornecida pelo autor."}
            </p>

            {/* Identificação do Autor (mesmo padrão de Artigo e Sugestão) */}
            <div className="mt-6 flex items-center gap-3 bg-purple-50/50 border border-purple-100 p-3 sm:p-4 rounded-xl w-full sm:w-fit max-w-full">
              <img
                src={video.autor?.imagem_perfil || "/default_perfil.png"}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-purple-300 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-black text-purple-950 truncate">
                  Por {video.autor?.nome || "Profissional Cadastrado"}
                </p>
                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                  CRP: {video.autor?.crp || "Verificado"}
                </p>
              </div>
            </div>
          </div>

          {/* Rodapé com botão secundário de fechamento rápido */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
            <Link
              to="/videos"
              className="flex-1 sm:flex-none text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              Fechar Player
            </Link>

            <span className="order-last w-full text-center sm:order-0 sm:w-auto text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              MindUp Psicoeducação
            </span>

            <button
              type="button"
              aria-pressed={!!video.favoritado}
              onClick={() => alternarFavoritoVideo(video.id)}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition cursor-pointer ${
                video.favoritado
                  ? "bg-orange-100 border-orange-300 text-orange-800"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart
                size={16}
                aria-hidden="true"
                className={
                  video.favoritado ? "fill-[#ff7300] text-[#ff7300]" : ""
                }
              />
              <span>
                {video.favoritado ? "Salvo nos Favoritos" : "Favoritar"}
              </span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
