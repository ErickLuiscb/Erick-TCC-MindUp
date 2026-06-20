import React from "react";
import { useParams, Link } from "react-router";
import { useArtigos } from "../../context/ArtigosContext";
import { ArrowLeft, BookOpen, Calendar, ShieldCheck } from "lucide-react";

export default function VerArtigo() {
  const { id } = useParams();
  const { buscarArtigoPorId, carregando } = useArtigos();

  const artigo = buscarArtigoPorId(id);

  if (carregando) {
    return (
      <div className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Carregando detalhes do artigo...
        </p>
      </div>
    );
  }

  if (!artigo) {
    return (
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center mt-12 shadow-xl text-white">
        <p className="text-xl font-bold">❌ Artigo não encontrado</p>
        <p className="text-purple-200 text-xs mt-2">
          O arquivo solicitado está inacessível ou foi ocultado pelo
          profissional.
        </p>
        <Link
          to="/artigos"
          className="inline-block mt-4 text-xs font-bold text-[#ffb300] uppercase tracking-wider hover:underline"
        >
          Voltar para listagem
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

  // ✅ SOLUÇÃO TÉCNICA CONTRA DOWNLOADS: Aplica o parâmetro #toolbar=0 ocultando botões nativos na nova aba
  const handleAbrirPdf = () => {
    if (artigo.arquivo_pdf) {
      const urlProtegida = `${artigo.arquivo_pdf}#toolbar=0`;
      window.open(urlProtegida, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 text-black animate-fadeIn">
      {/* Botão de Voltar */}
      <Link
        to="/artigos"
        className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar para as Leituras</span>
      </Link>

      {/* Caixa do Artigo */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100 p-6 md:p-8 flex flex-col justify-between min-h-[450px]">
        <div>
          {/* Cabeçalho Técnico */}
          <header className="border-b border-gray-100 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {artigo.categorias?.map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100"
                  >
                    {c.nome.includes("-")
                      ? c.nome.split("-")[1]?.trim()
                      : c.nome}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-purple-950 uppercase tracking-wide leading-tight">
                {artigo.titulo}
              </h1>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold tracking-wide shrink-0">
              <Calendar size={14} className="text-purple-500" />
              <span>{formatarData(artigo.created_at)}</span>
            </div>
          </header>

          {/* Resumo do Artigo */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-purple-500 tracking-widest flex items-center gap-1">
              <BookOpen size={14} />
              <span>Resumo do Material Acadêmico:</span>
            </h3>
            <p className="whitespace-pre-wrap text-sm md:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
              {artigo.descricao ||
                "Este material foi disponibilizado sem um resumo prévio pelo autor."}
            </p>
          </div>

          {/* Identificação do Autor */}
          <div className="mt-8 flex items-center gap-3 bg-purple-50/50 border border-purple-100 p-4 rounded-xl w-fit">
            <img
              src={artigo.autor?.imagem_perfil || "/default_perfil.png"}
              alt="Avatar Autor"
              className="w-10 h-10 rounded-full object-cover border border-purple-300"
            />
            <div>
              <p className="text-sm font-black text-purple-950">
                Por {artigo.autor?.nome || "Profissional Cadastrado"}
              </p>
              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                CRP: {artigo.autor?.crp || "Verificado"}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé com Ação de Abertura Segura */}
        <footer className="mt-12 pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <ShieldCheck size={16} />
            <span>Visualização Protegida Contra Downloads Ativa</span>
          </div>

          <button
            onClick={handleAbrirPdf}
            className="w-full sm:w-auto bg-[#ff7300] hover:bg-[#ff8c00] text-white font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-orange-950/20 transition-all transform hover:scale-105 cursor-pointer text-center"
          >
            📖 Ler Artigo Completo
          </button>
        </footer>
      </div>
    </div>
  );
}
