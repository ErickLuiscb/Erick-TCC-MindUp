import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../../service/api";
import { infoTipoSugestao } from "../../../utils/sugestoes";
import {
  Plus,
  Edit3,
  Trash2,
  Lightbulb,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

export default function MinhasSugestoes() {
  const navigate = useNavigate();
  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // ============================
  // CARREGAR SUGESTÕES DO AUTOR
  // ============================
  async function carregarSugestoes() {
    try {
      setCarregando(true);
      const resp = await api.get("/dashboard/sugestoes");
      setSugestoes(resp.data.data ?? resp.data ?? []);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar suas sugestões.");
    } finally {
      setCarregando(false);
    }
  }

  // ============================
  // EXCLUIR SUGESTÃO
  // ============================
  async function excluirSugestao(id, titulo) {
    const ok = window.confirm(
      `⚠️ ATENÇÃO: Tem certeza absoluta que deseja excluir permanentemente a sugestão:\n\n"${titulo}"?`,
    );

    if (!ok) return;

    try {
      await api.delete(`/sugestoes/${id}`);
      setSugestoes((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar remover a sugestão do servidor.");
    }
  }

  useEffect(() => {
    carregarSugestoes();
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
            Gerenciar Sugestões 💡
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
            Gerencie, modifique a visibilidade ou remova suas indicações
            culturais.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/sugestoes/criar")}
          className="bg-[#ff3d00] hover:bg-[#ff5722] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 text-sm tracking-wide cursor-pointer"
        >
          <Plus size={18} />
          <span>Criar Sugestão</span>
        </button>
      </div>

      {sugestoes.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto mt-12 shadow-xl text-white">
          <p className="text-2xl mb-2">💡</p>
          <h3 className="font-bold text-lg">Nenhuma sugestão publicada</h3>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Você ainda não indicou nenhum livro, filme ou outro conteúdo
            cultural. Clique no botão superior para começar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {sugestoes.map((sugestao) => {
          const tipo = infoTipoSugestao(sugestao.tipo);
          return (
            <div
              key={sugestao.id}
              className="bg-white rounded-2xl shadow-2xl border border-teal-50 overflow-hidden flex flex-col justify-between transition-all hover:shadow-teal-950/20 hover:scale-[1.02] duration-300 group"
            >
              <div>
                <div className="w-full aspect-video bg-teal-950 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                  {sugestao.capa ? (
                    <img
                      src={sugestao.capa}
                      alt={sugestao.titulo}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <Lightbulb
                      size={32}
                      className="text-teal-300/30 absolute z-10 group-hover:scale-110 transition-transform"
                    />
                  )}

                  <div
                    className={`absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white ${
                      sugestao.ativo
                        ? "bg-emerald-600 border border-emerald-500"
                        : "bg-gray-600 border border-gray-500"
                    }`}
                  >
                    {sugestao.ativo ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{sugestao.ativo ? "No Ar" : "Oculto"}</span>
                  </div>

                  <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 text-white bg-teal-700/90">
                    <span>{tipo.emoji}</span>
                    <span>{tipo.label}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black text-purple-950 tracking-wide line-clamp-1 group-hover:text-teal-700 transition">
                    {sugestao.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {sugestao.descricao || "Sem descrição informada."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {sugestao.categorias?.map((c) => (
                      <span
                        key={c.id}
                        className="text-[9px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100"
                      >
                        {c.nome}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex justify-end gap-3">
                <Link
                  to={`/dashboard/sugestoes/editar/${sugestao.id}`}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-100"
                >
                  <Edit3 size={12} />
                  <span>Editar</span>
                </Link>

                <button
                  onClick={() => excluirSugestao(sugestao.id, sugestao.titulo)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-100 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
