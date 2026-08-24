import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../../service/api";
import { ArrowLeft, Search, Tags } from "lucide-react";

export default function Categorias() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  // ============================
  // CARREGAR CATEGORIAS DO SISTEMA
  // ============================
  async function carregarCategorias() {
    try {
      setCarregando(true);
      const resp = await api.get("/categorias");
      setCategorias(resp.data.data ?? resp.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  const filtradas = useMemo(() => {
    return categorias
      .filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [categorias, busca]);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
        <div className="text-xl font-bold text-white tracking-wide">
          Buscando categorias do sistema...
        </div>
      </div>
    );
  }

  return (
    <div className="text-black max-w-5xl mx-auto animate-fadeIn p-2">
      {/* Botão de voltar ao painel principal */}
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

      {/* TOPO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-purple-300/30 text-white">
        <div>
          <h1 className="text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300] flex items-center gap-3">
            <Tags size={28} />
            Categorias do Sistema
          </h1>
          <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium max-w-lg">
            Estas são as categorias usadas para classificar vídeos, artigos,
            sugestões e conteúdos de autoajuda. Elas são gerenciadas pela equipe
            do sistema — esta tela é apenas para consulta.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-center shrink-0">
          <div className="text-2xl font-black text-white">
            {categorias.length}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-purple-200 font-bold">
            categorias
          </div>
        </div>
      </div>

      {/* BUSCA */}
      <div className="relative max-w-md mb-8">
        <input
          type="text"
          placeholder="Buscar categoria..."
          className="w-full pl-5 pr-12 py-3 bg-white border border-purple-100 rounded-2xl shadow-xl text-sm font-semibold text-black focus:outline-3 focus:outline-[#ffb300] placeholder-gray-400 transition"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="absolute right-4 top-3 text-purple-700">
          <Search size={18} />
        </div>
      </div>

      {/* ESTADO VAZIO */}
      {filtradas.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto mt-6 shadow-xl text-white">
          <p className="text-2xl mb-2">🏷️</p>
          <h3 className="font-bold text-lg">Nenhuma categoria encontrada</h3>
          <p className="text-purple-200 text-xs mt-1 leading-relaxed">
            Tente buscar por outro termo.
          </p>
        </div>
      )}

      {/* LISTA EM "CHIPS" */}
      <div className="bg-white rounded-2xl shadow-2xl border border-purple-50 p-6">
        <div className="flex flex-wrap gap-2">
          {filtradas.map((cat) => (
            <span
              key={cat.id}
              className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 hover:bg-purple-100 transition select-none"
            >
              {cat.nome}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
