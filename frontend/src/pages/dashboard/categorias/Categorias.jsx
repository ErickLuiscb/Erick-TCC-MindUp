import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../../service/api";
import { AlertTriangle, ArrowLeft, RotateCw, Search, Tags } from "lucide-react";

// Remove acentos e ignora maiúsculas, para "depressao" achar "Depressão"
const normalizar = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function Categorias() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState("");

  // ============================
  // CARREGAR CATEGORIAS DO SISTEMA
  // ============================
  async function carregarCategorias() {
    try {
      setCarregando(true);
      setErro(false);
      const resp = await api.get("/categorias");
      setCategorias(resp.data.data ?? resp.data ?? []);
    } catch (error) {
      console.error(error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  const filtradas = useMemo(() => {
    const termo = normalizar(busca);
    return categorias
      .filter((c) => normalizar(c.nome).includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [categorias, busca]);

  if (carregando) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center pt-20 animate-pulse"
      >
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
        type="button"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-4 sm:mb-6 group transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300] rounded-lg"
      >
        <ArrowLeft
          size={16}
          aria-hidden="true"
          className="transform group-hover:-translate-x-1 motion-reduce:transform-none transition-transform"
        />
        <span>Voltar ao Painel</span>
      </button>

      {/* TOPO */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pb-4 border-b border-purple-300/30 text-white">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300] flex items-center gap-3">
            <Tags size={28} aria-hidden="true" className="shrink-0" />
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
      </header>

      {/* ERRO AO CARREGAR (antes caía no "Nenhuma categoria encontrada") */}
      {erro && (
        <div
          role="alert"
          className="bg-red-900/80 border border-red-500 rounded-2xl p-5 sm:p-6 max-w-md mx-auto mt-6 shadow-xl text-white text-center"
        >
          <p className="flex items-center justify-center gap-2 font-bold">
            <AlertTriangle size={18} aria-hidden="true" className="shrink-0" />
            Não foi possível carregar as categorias.
          </p>
          <p className="text-xs opacity-80 mt-1">
            O servidor pode estar iniciando. Tente novamente em instantes.
          </p>
          <button
            type="button"
            onClick={carregarCategorias}
            className="mt-4 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
          >
            <RotateCw size={12} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      )}

      {!erro && (
        <>
          {/* BUSCA */}
          <div className="relative w-full sm:max-w-md mb-6 sm:mb-8">
            <label htmlFor="busca-categoria" className="sr-only">
              Buscar categoria
            </label>
            <input
              id="busca-categoria"
              type="search"
              placeholder="Buscar categoria..."
              className="w-full pl-5 pr-12 py-3 bg-white border border-purple-100 rounded-2xl shadow-xl text-sm font-semibold text-black focus:outline-3 focus:outline-[#ffb300] placeholder-gray-500 transition"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search
              size={18}
              aria-hidden="true"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-700 pointer-events-none"
            />
          </div>

          {/* Quantidade de resultados, lida por leitores de tela quando a busca muda */}
          <p role="status" className="sr-only">
            {filtradas.length}{" "}
            {filtradas.length === 1
              ? "categoria encontrada"
              : "categorias encontradas"}
          </p>

          {/* ESTADO VAZIO */}
          {filtradas.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 sm:p-12 text-center max-w-md mx-auto mt-6 shadow-xl text-white">
              <p aria-hidden="true" className="text-2xl mb-2">
                🏷️
              </p>
              <h2 className="font-bold text-lg">
                Nenhuma categoria encontrada
              </h2>
              <p className="text-purple-200 text-xs mt-1 leading-relaxed">
                Tente buscar por outro termo.
              </p>
            </div>
          )}

          {/* LISTA EM "CHIPS" (só aparece quando há resultado) */}
          {filtradas.length > 0 && (
            <div className="bg-white rounded-2xl shadow-2xl border border-purple-50 p-4 sm:p-6">
              <ul className="flex flex-wrap gap-2" aria-label="Categorias">
                {filtradas.map((cat) => (
                  <li
                    key={cat.id}
                    className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 select-none"
                  >
                    {cat.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
