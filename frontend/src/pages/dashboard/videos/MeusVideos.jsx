import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import {
  Plus,
  Edit3,
  Trash2,
  Film,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

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
      setVideos(resp.data.data ?? resp.data ?? []);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar seus vídeos.");
    } finally {
      setCarregando(false);
    }
  }

  // ============================
  // EXCLUIR VÍDEO
  // ============================
  async function excluirVideo(id, titulo) {
    const ok = window.confirm(
      `⚠️ ATENÇÃO: Tem certeza absoluta que deseja excluir permanentemente o vídeo:\n\n"${titulo}"?\n\nEsta ação apagará o arquivo físico do servidor.`,
    );

    if (!ok) return;

    try {
      await api.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar remover o vídeo do servidor.");
    }
  }

  useEffect(() => {
    carregarVideos();
  }, []);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
        <div className="text-xl font-bold text-white tracking-wide">
          Buscando suas publicações...
        </div>
      </div>
    );
  }

  return (
    <div className="text-black max-w-7xl mx-auto animate-fadeIn p-2">
      {/* Botão de voltar ao painel principal */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar ao Painel</span>
      </button>

      {/* TOPO DO CRUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-4 border-b border-purple-300/30 text-white">
        <div>
          <h1 className="text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300]">
            Gerenciar Vídeos 🎬
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Gerencie, modifique a visibilidade ou remova suas publicações de
            psicoeducação.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/videos/criar")}
          className="bg-[#ff3d00] hover:bg-[#ff5722] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 text-sm tracking-wide cursor-pointer"
        >
          <Plus size={18} />
          <span>Criar Vídeo</span>
        </button>
      </div>

      {/* ESTADO VAZIO */}
      {videos.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto mt-12 shadow-xl text-white">
          <p className="text-2xl mb-2">📹</p>
          <h3 className="font-bold text-lg">Nenhum vídeo publicado</h3>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Você ainda não criou nenhum conteúdo em vídeo. Clique no botão
            superior para fazer sua primeira publicação.
          </p>
        </div>
      )}

      {/* GRID DE CARDS RESPONSIVOS (Proporção de Tela de Cinema Fixa) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-2xl shadow-2xl border border-purple-50 overflow-hidden flex flex-col justify-between transition-all hover:shadow-purple-950/20 hover:scale-[1.02] duration-300 group"
          >
            <div>
              {/* Thumbnail com aspecto de tela fixo 16:9 */}
              <div className="w-full aspect-video bg-purple-950 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                <Film
                  size={32}
                  className="text-purple-300/30 absolute z-10 group-hover:scale-110 transition-transform"
                />

                {/* Badge de Status: Ativo/Inativo Dinâmico (Excelente para regras de negócio no TCC) */}
                <div
                  className={`absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white ${
                    video.ativo
                      ? "bg-emerald-600 border border-emerald-500"
                      : "bg-gray-600 border border-gray-500"
                  }`}
                >
                  {video.ativo ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{video.ativo ? "No Ar" : "Oculto"}</span>
                </div>

                <video
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  muted
                  preload="metadata"
                >
                  <source src={video.arquivo} type="video/mp4" />
                </video>
              </div>

              {/* Informações de Texto */}
              <div className="p-5">
                <h3 className="text-lg font-black text-purple-950 tracking-wide line-clamp-1 group-hover:text-purple-700 transition">
                  {video.titulo}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {video.descricao || "Sem descrição informada."}
                </p>

                {/* Exibe as Categorias Vinculadas ao Vídeo */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {video.categorias?.map((c) => (
                    <span
                      key={c.id}
                      className="text-[9px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100"
                    >
                      {c.nome}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* BARRA DE AÇÕES DO CRUD COM DESIGN WEB LIMPO */}
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex justify-end gap-3">
              <Link
                to={`/dashboard/videos/editar/${video.id}`}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-100"
              >
                <Edit3 size={12} />
                <span>Editar</span>
              </Link>

              <button
                onClick={() => excluirVideo(video.id, video.titulo)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-100 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
