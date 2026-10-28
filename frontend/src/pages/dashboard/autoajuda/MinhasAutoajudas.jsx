import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import { Plus, Edit3, Trash2, HeartPulse, ArrowLeft, Play } from "lucide-react";

export default function MinhasAutoajudas() {
  const navigate = useNavigate();
  const [conteudos, setConteudos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarMeusConteudos() {
    try {
      setCarregando(true);
      const resp = await api.get("/dashboard/autoajudas");
      setConteudos(resp.data.data ?? resp.data ?? []);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar seus conteúdos de autoajuda.");
    } finally {
      setCarregando(false);
    }
  }

  async function excluirConteudo(id, titulo) {
    const ok = window.confirm(
      `⚠️ ATENÇÃO: Tem certeza absoluta que deseja excluir permanentemente:\n\n"${titulo}"?`,
    );
    if (!ok) return;

    try {
      await api.delete(`/autoajudas/${id}`);
      setConteudos((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar remover o conteúdo do servidor.");
    }
  }

  useEffect(() => {
    carregarMeusConteudos();
  }, []);

  if (carregando) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center pt-20 animate-pulse"
      >
        <div className="text-xl font-bold text-white tracking-wide">
          Buscando suas publicações...
        </div>
      </div>
    );
  }

  return (
    <div className="text-black max-w-7xl mx-auto animate-fadeIn p-2">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-4 sm:mb-6 group transition-colors cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar ao Painel</span>
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10 pb-4 border-b border-purple-300/30 text-white">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300]">
            Gerenciar Autoajuda 🌱
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Publique imagens e vídeos curtos de apoio rápido para os usuários.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/autoajuda/criar")}
          className="w-full sm:w-auto justify-center bg-[#ff3d00] hover:bg-[#ff5722] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 motion-reduce:transform-none flex items-center gap-2 text-sm tracking-wide cursor-pointer"
        >
          <Plus size={18} />
          <span>Criar Conteúdo</span>
        </button>
      </div>

      {conteudos.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-md mx-auto mt-8 sm:mt-12 shadow-xl text-white">
          <p className="text-2xl mb-2" aria-hidden="true">
            🌱
          </p>
          <h2 className="font-bold text-lg">Nenhum conteúdo publicado</h2>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Você ainda não publicou nenhuma imagem ou vídeo de autoajuda. Clique
            no botão superior para começar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 items-stretch">
        {/* CARD DE AUTOAJUDA
            Celular (< sm): layout HORIZONTAL compacto — miniatura à esquerda,
            texto e ações à direita (flex-row).
            sm em diante: layout VERTICAL de sempre. */}
        {conteudos.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-2xl shadow-2xl border border-sky-50 overflow-hidden flex flex-row sm:flex-col sm:justify-between transition-all hover:shadow-sky-950/20 hover:scale-[1.02] motion-reduce:hover:scale-100 duration-300 group"
          >
            {/* Miniatura: coluna fixa de 7rem no celular; largura total + 16:9 a partir de sm */}
            <div className="relative shrink-0 w-28 sm:w-full sm:aspect-video bg-sky-950 flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-gray-100">
              {item.tipo_midia === "imagem" ? (
                <img
                  src={item.midia}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <>
                  <Play
                    size={26}
                    className="w-5 h-5 sm:w-[26px] sm:h-[26px] text-white/90 absolute z-10 fill-white/90"
                  />
                  <video
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-70"
                    muted
                    preload="metadata"
                  >
                    <source src={item.midia} type="video/mp4" />
                  </video>
                </>
              )}

              {/* Selo do tipo: no celular menor; o texto fica só para leitores de tela */}
              <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-20 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white bg-sky-700/90">
                <span aria-hidden="true">
                  {item.tipo_midia === "imagem" ? "🖼️" : "🎬"}
                </span>
                <span className="sr-only">
                  {item.tipo_midia === "imagem" ? "Imagem" : "Vídeo"}
                </span>
              </div>
            </div>

            {/* Coluna de texto: título + descrição + categorias em cima, ações embaixo */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="p-3 sm:p-5">
                <h2 className="text-base sm:text-lg font-black text-purple-950 tracking-wide line-clamp-2 sm:line-clamp-1 group-hover:text-sky-700 transition">
                  {item.titulo}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3 sm:bg-gray-50 sm:p-3 sm:rounded-xl sm:border sm:border-gray-100">
                  {item.descricao || "Sem descrição informada."}
                </p>

                {/* (no celular, só as 2 primeiras categorias + contador; de sm em diante, todas) */}
                <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
                  {item.categorias?.map((c, i) => (
                    <span
                      key={c.id}
                      className={`max-w-full truncate text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 ${
                        i >= 2 ? "hidden sm:inline" : ""
                      }`}
                    >
                      {c.nome}
                    </span>
                  ))}
                  {item.categorias?.length > 2 && (
                    <span className="sm:hidden self-center text-[10px] font-bold text-gray-500">
                      +{item.categorias.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* (no celular, só os ícones; de sm em diante, ícone + texto) */}
              <div className="px-3 pb-3 pt-2 sm:px-5 sm:pb-5 sm:pt-3 border-t border-gray-100 flex justify-end gap-2 sm:gap-3">
                <Link
                  to={`/dashboard/autoajuda/editar/${item.id}`}
                  title="Editar conteúdo"
                  aria-label={`Editar conteúdo: ${item.titulo}`}
                  className="px-3 py-3 sm:px-4 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-amber-100"
                >
                  <Edit3 size={14} />
                  <span className="hidden sm:inline">Editar</span>
                </Link>

                <button
                  type="button"
                  onClick={() => excluirConteudo(item.id, item.titulo)}
                  title="Excluir conteúdo"
                  aria-label={`Excluir conteúdo: ${item.titulo}`}
                  className="px-3 py-3 sm:px-4 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-red-100 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Excluir</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
