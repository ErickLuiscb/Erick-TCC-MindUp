import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../../service/api";
import { useVideos } from "../../../context/VideosContext";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  Search,
  X,
} from "lucide-react";

export default function EditarArtigo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categorias = [] } = useVideos();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivoPdf, setArquivoPdf] = useState(null);
  const [ativo, setAtivo] = useState(true);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [buscaCategoria, setBuscaCategoria] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarArtigo() {
      try {
        setCarregando(true);
        const resp = await api.get(`/artigos/${id}`);
        const artigo = resp.data.data ?? resp.data;

        setTitulo(artigo.titulo || "");
        setDescricao(artigo.descricao ?? "");
        setAtivo(artigo.ativo === undefined ? true : Boolean(artigo.ativo));

        if (artigo.categorias && Array.isArray(artigo.categorias)) {
          setCategoriasSelecionadas(artigo.categorias.map((c) => c.id));
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados do artigo.");
        navigate("/dashboard/artigos");
      } finally {
        setCarregando(false);
      }
    }
    carregarArtigo();
  }, [id, navigate]);

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nome.toLowerCase().includes(buscaCategoria.toLowerCase()),
  );

  const handleCheckboxChange = (catId) => {
    setErro("");
    setCategoriasSelecionadas((prev) => {
      if (prev.includes(catId)) return prev.filter((c) => c !== catId);
      if (prev.length >= 5) {
        setErro(
          "⚠️ Limite atingido: Você só pode selecionar no máximo 5 categorias por conteúdo.",
        );
        return prev;
      }
      return [...prev, catId];
    });
  };

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("ativo", ativo ? "1" : "0");
    if (arquivoPdf) formData.append("arquivo_pdf", arquivoPdf);
    categoriasSelecionadas.forEach((catId) =>
      formData.append("categorias[]", catId),
    );

    try {
      await api.post(`/artigos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard/artigos");
    } catch (error) {
      console.error(error);
      setErro(
        "❌ " +
          (error.response?.data?.message ||
            "Erro ao tentar salvar as alterações do artigo."),
      );
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center pt-20 animate-pulse">
        <p className="text-xl font-bold text-white tracking-wide">
          Recuperando dados do artigo...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-2 text-black animate-fadeIn">
      <button
        type="button"
        onClick={() => navigate("/dashboard/artigos")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
        disabled={salvando}
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Cancelar Modificação</span>
      </button>

      {erro && (
        <div className="p-4 bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl mb-6 shadow-xs animate-fadeIn flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-black text-purple-950 tracking-wide">
            Modificar Artigo Publicado 📄
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Altere as informações necessárias. Caso envie um novo PDF, o
            anterior será limpo do servidor automaticamente.
          </p>
        </header>

        <form onSubmit={salvar} className="space-y-5">
          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Título do Artigo:
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:outline-purple-600 text-black font-semibold"
              required
              maxLength={150}
              disabled={salvando}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Resumo Acadêmico / Apresentação:
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm h-32 focus:outline-purple-600 text-black leading-relaxed"
              disabled={salvando}
            />
          </div>

          <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1">
                {ativo ? (
                  <Eye size={14} className="text-emerald-600" />
                ) : (
                  <EyeOff size={14} className="text-gray-500" />
                )}
                <span>Status de Visibilidade atual</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Defina se a publicação fica disponível ("No Ar") ou oculta dos
                pacientes.
              </p>
            </div>
            <select
              value={ativo ? "1" : "0"}
              onChange={(e) => setAtivo(e.target.value === "1")}
              className="p-2 border border-gray-300 rounded-lg bg-white text-xs font-bold text-gray-700 focus:outline-purple-600 cursor-pointer"
              disabled={salvando}
            >
              <option value="1">🟢 Disponibilizar "No Ar"</option>
              <option value="0">⚪ Manter Oculto (Rascunho)</option>
            </select>
          </div>

          {/* SELETOR DE CATEGORIAS COM BUSCADOR */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 mb-4 gap-1">
              <div>
                <label className="text-xs font-black text-purple-950 uppercase tracking-wider block">
                  Vincular Categorias Temáticas:
                </label>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Pesquise e marque os temas relacionados ao conteúdo.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md w-fit shrink-0">
                {categoriasSelecionadas.length} / 5 selecionadas
              </span>
            </div>

            {/* Barra de pesquisa */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Pesquisar categoria... (ex: Ansiedade, Luto)"
                value={buscaCategoria}
                onChange={(e) => setBuscaCategoria(e.target.value)}
                disabled={salvando}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-black focus:outline-purple-600 placeholder-gray-400"
              />
              <Search
                size={14}
                className="absolute left-3 top-3 text-purple-400"
              />
              {buscaCategoria && (
                <button
                  type="button"
                  onClick={() => setBuscaCategoria("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Lista filtrada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {categoriasFiltradas.length === 0 ? (
                <p className="col-span-full text-xs text-center text-gray-400 py-4">
                  Nenhuma categoria encontrada com esse termo.
                </p>
              ) : (
                categoriasFiltradas.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer select-none transition ${
                      categoriasSelecionadas.includes(cat.id)
                        ? "bg-purple-100 border-purple-300 text-purple-950 font-black"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={categoriasSelecionadas.includes(cat.id)}
                      onChange={() => handleCheckboxChange(cat.id)}
                      disabled={salvando}
                      className="rounded text-purple-700 focus:ring-purple-600"
                    />
                    <span className="truncate">{cat.nome}</span>
                  </label>
                ))
              )}
            </div>

            {/* Tags das selecionadas */}
            {categoriasSelecionadas.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5">
                {categoriasSelecionadas.map((catId) => {
                  const cat = categorias.find((c) => c.id === catId);
                  return cat ? (
                    <span
                      key={catId}
                      className="flex items-center gap-1 bg-purple-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg"
                    >
                      {cat.nome}
                      <button
                        type="button"
                        onClick={() => handleCheckboxChange(catId)}
                        className="hover:text-red-300 cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* TROCA DE ARQUIVO OPCIONAL */}
          <div>
            <label className="block mb-2 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Substituir Documento Digital (Opcional):
            </label>
            <div className="flex items-center gap-3 border border-gray-200 p-3 rounded-xl bg-white">
              <FileText size={24} className="text-red-500 shrink-0" />
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setArquivoPdf(e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                disabled={salvando}
              />
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/dashboard/artigos")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="bg-[#ff7300] hover:bg-[#ff8c00] text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-md shadow-orange-950/10 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{salvando ? "Sincronizando..." : "Salvar Alterações"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
