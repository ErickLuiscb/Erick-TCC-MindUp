import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import {
  Plus,
  Edit3,
  Trash2,
  HeartPulse,
  Eye,
  EyeOff,
  ArrowLeft,
  Play,
} from "lucide-react";

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
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
        <div className="text-xl font-bold text-white tracking-wide">
          Buscando suas publicações...
        </div>
      </div>
    );
  }

  return (
    <div className="text-black max-w-7xl mx-auto animate-fadeIn p-2">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar ao Painel</span>
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-4 border-b border-purple-300/30 text-white">
        <div>
          <h1 className="text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300]">
            Gerenciar Autoajuda 🌱
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Publique imagens e vídeos curtos de apoio rápido para os usuários.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/autoajuda/criar")}
          className="bg-[#ff3d00] hover:bg-[#ff5722] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 text-sm tracking-wide cursor-pointer"
        >
          <Plus size={18} />
          <span>Criar Conteúdo</span>
        </button>
      </div>

      {conteudos.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto mt-12 shadow-xl text-white">
          <p className="text-2xl mb-2">🌱</p>
          <h3 className="font-bold text-lg">Nenhum conteúdo publicado</h3>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Você ainda não publicou nenhuma imagem ou vídeo de autoajuda. Clique
            no botão superior para começar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {conteudos.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-2xl border border-sky-50 overflow-hidden flex flex-col justify-between transition-all hover:shadow-sky-950/20 hover:scale-[1.02] duration-300 group"
          >
            <div>
              <div className="w-full aspect-video bg-sky-950 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                {item.tipo_midia === "imagem" ? (
                  <img
                    src={item.midia}
                    alt={item.titulo}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <>
                    <Play
                      size={26}
                      className="text-white/90 absolute z-10 fill-white/90"
                    />
                    <video
                      className="w-full h-full object-cover pointer-events-none opacity-70"
                      muted
                      preload="metadata"
                    >
                      <source src={item.midia} type="video/mp4" />
                    </video>
                  </>
                )}

                <div
                  className={`absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white ${
                    item.ativo
                      ? "bg-emerald-600 border border-emerald-500"
                      : "bg-gray-600 border border-gray-500"
                  }`}
                >
                  {item.ativo ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{item.ativo ? "No Ar" : "Oculto"}</span>
                </div>

                <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white bg-sky-700/90">
                  <span>{item.tipo_midia === "imagem" ? "🖼️" : "🎬"}</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-black text-purple-950 tracking-wide line-clamp-1 group-hover:text-sky-700 transition">
                  {item.titulo}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {item.descricao || "Sem descrição informada."}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {item.categorias?.map((c) => (
                    <span
                      key={c.id}
                      className="text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100"
                    >
                      {c.nome}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex justify-end gap-3">
              <Link
                to={`/dashboard/autoajuda/editar/${item.id}`}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-100"
              >
                <Edit3 size={12} />
                <span>Editar</span>
              </Link>

              <button
                onClick={() => excluirConteudo(item.id, item.titulo)}
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
