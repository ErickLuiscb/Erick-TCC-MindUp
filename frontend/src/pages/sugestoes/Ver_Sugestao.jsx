import React from "react";
import { useParams, useNavigate } from "react-router";
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
      <div role="status" className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Carregando detalhes da sugestão...
        </p>
      </div>
    );
  }

  if (!sugestao) {
    return (
      <div
        role="alert"
        className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl text-white"
      >
        <p className="text-xl font-bold">❌ Sugestão não encontrada</p>
        <p className="text-purple-200 text-xs mt-2">
          O conteúdo solicitado está inacessível ou foi ocultado pelo
          profissional.
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

      {/*
        TELA REMODELADA — "ficha da obra"
        Celular: capa em cima, inteira (sem cortar), texto embaixo.
        md em diante: duas colunas — capa à esquerda (20rem), texto à direita.
      */}
      <article className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-teal-100 md:grid md:grid-cols-[20rem_1fr]">
        {/* COLUNA DA CAPA */}
        <div className="relative bg-teal-950 flex items-center justify-center md:items-start p-6 md:p-8 overflow-hidden">
          {sugestao.capa ? (
            <>
              {/* Fundo desfocado com a própria capa (decorativo) */}
              <img
                src={sugestao.capa}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40"
              />
              {/* Capa inteira, na proporção original (nada é cortado) */}
              <img
                src={sugestao.capa}
                alt={`Capa de ${sugestao.titulo}`}
                className="relative h-auto w-auto max-w-full max-h-[55vh] md:w-full md:max-h-none object-contain rounded-xl shadow-2xl"
              />
            </>
          ) : (
            <div aria-hidden="true" className="relative py-8 md:py-16 text-7xl">
              {tipo.emoji}
            </div>
          )}
        </div>

        {/* COLUNA DO CONTEÚDO */}
        <div className="p-5 sm:p-6 md:p-8 min-w-0 flex flex-col">
          {/* Cabeçalho */}
          <header className="border-b border-gray-100 pb-5 mb-6">
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {/* Tipo da obra (antes ficava como selo sobre a capa) */}
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-teal-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                <span aria-hidden="true">{tipo.emoji}</span>
                <span>{tipo.label}</span>
              </span>

              {sugestao.categorias?.map((c) => (
                <span
                  key={c.id}
                  className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100"
                >
                  {c.nome}
                </span>
              ))}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-purple-950 uppercase tracking-wide leading-tight wrap-break-words">
              {sugestao.titulo}
            </h1>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 font-bold tracking-wide">
              <Calendar
                size={14}
                className="text-teal-600"
                aria-hidden="true"
              />
              <span>
                Publicado em{" "}
                <time dateTime={sugestao.created_at}>
                  {formatarData(sugestao.created_at)}
                </time>
              </span>
            </p>
          </header>

          {/* Descrição */}
          <p className="whitespace-pre-wrap text-sm md:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-100">
            {sugestao.descricao ||
              "Este conteúdo foi disponibilizado sem uma descrição prévia pelo autor."}
          </p>

          {/* Autor (mesmo conteúdo de antes; só ficou responsivo) */}
          <div className="mt-6 flex items-center gap-3 bg-teal-50/50 border border-teal-100 p-3 sm:p-4 rounded-xl w-full sm:w-fit max-w-full">
            <img
              src={sugestao.autor?.imagem_perfil || "/default_perfil.png"}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-teal-300 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-black text-purple-950 truncate">
                Por {sugestao.autor?.nome || "Profissional Cadastrado"}
              </p>
              <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                CRP: {sugestao.autor?.crp || "Verificado"}
              </p>
            </div>
          </div>

          {/* Ações: no celular o link externo (ação principal) vem primeiro e os
              dois botões ocupam a largura toda */}
          <footer className="mt-8 pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => alternarFavoritoSugestao(sugestao.id)}
              className={`w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition cursor-pointer ${
                sugestao.favoritado
                  ? "bg-teal-100 border-teal-300 text-teal-800"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart
                size={16}
                aria-hidden="true"
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
                className="w-full sm:w-auto bg-[#13b5a2] hover:bg-[#0fa190] text-white font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-teal-950/20 transition-all transform hover:scale-105 motion-reduce:transform-none cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} aria-hidden="true" />
                <span>{acaoExternaLabel(sugestao.tipo)}</span>
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            )}
          </footer>
        </div>
      </article>
    </div>
  );
}
