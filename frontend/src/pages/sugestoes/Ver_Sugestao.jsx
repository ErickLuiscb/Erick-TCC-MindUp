import React from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useSugestoes } from "../../context/SugestoesContext";
import { infoTipoSugestao, acaoExternaLabel } from "../../utils/sugestoes";
import { ArrowLeft, Calendar, ExternalLink, Heart } from "lucide-react";

export default function VerSugestao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { buscarSugestaoPorId, carregando, alternarFavoritoSugestao } =
    useSugestoes();

  const sugestao = buscarSugestaoPorId(id);

  if (carregando) {
    return (
      <div className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Carregando detalhes da sugestão...
        </p>
      </div>
    );
  }

  if (!sugestao) {
    return (
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl text-white">
        <p className="text-xl font-bold">❌ Sugestão não encontrada</p>
        <p className="text-purple-200 text-xs mt-2">
          O conteúdo solicitado está inacessível ou foi ocultado pelo
          profissional.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-block mt-4 text-xs font-bold text-[#ffb300] uppercase tracking-wider hover:underline cursor-pointer"
        >
          Voltar
        </button>
      </div>
    );
  }

  const tipo = infoTipoSugestao(sugestao.tipo);

  const formatarData = (dataString) => {
    if (!dataString) return "";
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-2 text-black animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar</span>
      </button>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-teal-100">
        {/* Capa */}
        <div className="w-full aspect-21/9 bg-teal-950 relative overflow-hidden">
          {sugestao.capa ? (
            <img
              src={sugestao.capa}
              alt={sugestao.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {tipo.emoji}
            </div>
          )}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 text-white bg-teal-700/90 backdrop-blur-sm">
            <span>{tipo.emoji}</span>
            <span>{tipo.label}</span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Cabeçalho */}
          <header className="border-b border-gray-100 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {sugestao.categorias?.map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100"
                  >
                    {c.nome}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-purple-950 uppercase tracking-wide leading-tight">
                {sugestao.titulo}
              </h1>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold tracking-wide shrink-0">
              <Calendar size={14} className="text-teal-500" />
              <span>{formatarData(sugestao.created_at)}</span>
            </div>
          </header>

          {/* Descrição */}
          <p className="whitespace-pre-wrap text-sm md:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
            {sugestao.descricao ||
              "Este conteúdo foi disponibilizado sem uma descrição prévia pelo autor."}
          </p>

          {/* Autor */}
          <div className="mt-8 flex items-center gap-3 bg-teal-50/50 border border-teal-100 p-4 rounded-xl w-fit">
            <img
              src={sugestao.autor?.imagem_perfil || "/default_perfil.png"}
              alt="Avatar Autor"
              className="w-10 h-10 rounded-full object-cover border border-teal-300"
            />
            <div>
              <p className="text-sm font-black text-purple-950">
                Por {sugestao.autor?.nome || "Profissional Cadastrado"}
              </p>
              <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                CRP: {sugestao.autor?.crp || "Verificado"}
              </p>
            </div>
          </div>

          {/* Rodapé com ações */}
          <footer className="mt-10 pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => alternarFavoritoSugestao(sugestao.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition cursor-pointer ${
                sugestao.favoritado
                  ? "bg-teal-100 border-teal-300 text-teal-800"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart
                size={16}
                className={sugestao.favoritado ? "fill-teal-700" : ""}
              />
              <span>
                {sugestao.favoritado ? "Salvo nos Favoritos" : "Favoritar"}
              </span>
            </button>

            {sugestao.link_externo && (
              <a
                href={sugestao.link_externo}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#13b5a2] hover:bg-[#0fa190] text-white font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-teal-950/20 transition-all transform hover:scale-105 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                <span>{acaoExternaLabel(sugestao.tipo)}</span>
              </a>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
