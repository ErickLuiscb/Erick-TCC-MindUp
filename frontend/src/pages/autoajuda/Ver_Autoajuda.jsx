import React from "react";
import { useParams, Link } from "react-router";
import { useAutoajuda } from "../../context/AutoajudaContext";
import { ArrowLeft, Heart } from "lucide-react";

export default function VerAutoajuda() {
  const { id } = useParams();
  const { buscarAutoajudaPorId, carregando, alternarFavoritoAutoajuda } =
    useAutoajuda();

  const item = buscarAutoajudaPorId(id);

  if (carregando) {
    return (
      <div className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Carregando conteúdo...
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl text-white">
        <p className="text-xl font-bold">❌ Conteúdo não encontrado</p>
        <p className="text-purple-200 text-xs mt-2">
          O conteúdo solicitado está inacessível ou foi ocultado pelo
          profissional.
        </p>
        <Link
          to="/autoajuda"
          className="inline-block mt-4 text-xs font-bold text-[#ffb300] uppercase tracking-wider hover:underline"
        >
          Voltar para listagem
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-2 text-black animate-fadeIn">
      <Link
        to="/autoajuda"
        className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar para Autoajuda</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-sky-100">
        {/* Mídia */}
        <div className="w-full bg-sky-950 relative overflow-hidden">
          {item.tipo_midia === "imagem" ? (
            <img
              src={item.midia}
              alt={item.titulo}
              className="w-full max-h-[70vh] object-contain bg-sky-950"
            />
          ) : (
            <video
              src={item.midia}
              controls
              className="w-full max-h-[70vh] bg-black"
            />
          )}

          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 text-white bg-sky-700/90 backdrop-blur-sm">
            <span>{item.tipo_midia === "imagem" ? "🖼️" : "🎬"}</span>
            <span>{item.tipo_midia === "imagem" ? "Imagem" : "Vídeo"}</span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.categorias?.map((c) => (
              <span
                key={c.id}
                className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100"
              >
                {c.nome}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-purple-950 uppercase tracking-wide leading-tight">
            {item.titulo}
          </h1>

          <p className="whitespace-pre-wrap text-sm md:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/70 p-5 rounded-2xl border border-gray-100 mt-6">
            {item.descricao ||
              "Este conteúdo foi disponibilizado sem uma descrição prévia pelo autor."}
          </p>

          <footer className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Por {item.autor?.nome || "Profissional MindUp"}
            </span>

            <button
              type="button"
              onClick={() => alternarFavoritoAutoajuda(item.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition cursor-pointer ${
                item.favoritado
                  ? "bg-sky-100 border-sky-300 text-sky-800"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart
                size={16}
                className={item.favoritado ? "fill-sky-700" : ""}
              />
              <span>
                {item.favoritado ? "Salvo nos Favoritos" : "Favoritar"}
              </span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
