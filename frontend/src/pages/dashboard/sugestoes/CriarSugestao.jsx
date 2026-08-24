import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../../service/api";
import { useVideos } from "../../../context/VideosContext";
import { TIPOS_SUGESTAO } from "../../../utils/sugestoes";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  Search,
  X,
} from "lucide-react";

export default function CriarSugestao() {
  const navigate = useNavigate();
  const { categorias = [] } = useVideos();

  const [tipo, setTipo] = useState("livro");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [linkExterno, setLinkExterno] = useState("");
  const [capa, setCapa] = useState(null);
  const [ativo, setAtivo] = useState(true);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [buscaCategoria, setBuscaCategoria] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nome.toLowerCase().includes(buscaCategoria.toLowerCase()),
  );

  const handleCheckboxChange = (id) => {
    setErro("");
    setCategoriasSelecionadas((prev) => {
      if (prev.includes(id)) return prev.filter((catId) => catId !== id);
      if (prev.length >= 5) {
        setErro(
          "⚠️ Limite atingido: Você só pode selecionar no máximo 5 categorias por conteúdo.",
        );
        return prev;
      }
      return [...prev, id];
    });
  };

  async function salvar(e) {
    e.preventDefault();
    setErro("");

    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    if (linkExterno) formData.append("link_externo", linkExterno);
    if (capa) formData.append("capa", capa);
    formData.append("ativo", ativo ? "1" : "0");
    categoriasSelecionadas.forEach((id) => formData.append("categorias[]", id));

    try {
      setSalvando(true);
      await api.post("/sugestoes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard/sugestoes");
    } catch (error) {
      console.error(error);
      setErro(
        "❌ " +
          (error.response?.data?.message ||
            "Erro ao tentar salvar a sugestão no servidor."),
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-2 text-black animate-fadeIn">
      <button
        type="button"
        onClick={() => navigate("/dashboard/sugestoes")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
        disabled={salvando}
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar para Minhas Sugestões</span>
      </button>

      {erro && (
        <div className="p-4 bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl mb-6 shadow-xs animate-fadeIn flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-teal-100">
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-black text-purple-950 tracking-wide">
            Nova Sugestão Cultural 💡
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Indique um livro, filme, série, música ou outro conteúdo que possa
            ajudar seus pacientes.
          </p>
        </header>

        <form onSubmit={salvar} className="space-y-5">
          {/* TIPO */}
          <div>
            <label className="block mb-2 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Tipo de Conteúdo:
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_SUGESTAO.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  onClick={() => setTipo(t.valor)}
                  disabled={salvando}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer flex items-center gap-1.5 ${
                    tipo === t.valor
                      ? "bg-[#13b5a2] border-teal-500 text-white shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Título:
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:outline-teal-600 text-black font-semibold"
              placeholder="Nome do livro, filme, série, música..."
              required
              maxLength={150}
              disabled={salvando}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Descrição / Por que recomendar:
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm h-28 focus:outline-teal-600 text-black leading-relaxed"
              placeholder="Explique brevemente do que se trata e por que essa indicação pode ajudar..."
              disabled={salvando}
              maxLength={5000}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider items-center gap-1.5">
              <Link2 size={13} />
              Link Externo (opcional):
            </label>
            <input
              type="url"
              value={linkExterno}
              onChange={(e) => setLinkExterno(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:outline-teal-600 text-black"
              placeholder="https://... (streaming, loja, plataforma de música, etc.)"
              disabled={salvando}
            />
          </div>

          {/* STATUS */}
          <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1">
                {ativo ? (
                  <Eye size={14} className="text-emerald-600" />
                ) : (
                  <EyeOff size={14} className="text-gray-500" />
                )}
                <span>Status de Visibilidade Inicial</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Defina se a sugestão entra direto no ar ou nasce arquivada como
                rascunho.
              </p>
            </div>
            <select
              value={ativo ? "1" : "0"}
              onChange={(e) => setAtivo(e.target.value === "1")}
              className="p-2 border border-gray-300 rounded-lg bg-white text-xs font-bold text-gray-700 focus:outline-teal-600 cursor-pointer"
              disabled={salvando}
            >
              <option value="1">🟢 Disponibilizar "No Ar"</option>
              <option value="0">⚪ Manter Oculto (Rascunho)</option>
            </select>
          </div>

          {/* CATEGORIAS */}
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
              <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md w-fit shrink-0">
                {categoriasSelecionadas.length} / 5 selecionadas
              </span>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Pesquisar categoria... (ex: Ansiedade, Luto)"
                value={buscaCategoria}
                onChange={(e) => setBuscaCategoria(e.target.value)}
                disabled={salvando}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-black focus:outline-teal-600 placeholder-gray-400"
              />
              <Search
                size={14}
                className="absolute left-3 top-3 text-teal-500"
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
                        ? "bg-teal-100 border-teal-300 text-teal-900 font-black"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={categoriasSelecionadas.includes(cat.id)}
                      onChange={() => handleCheckboxChange(cat.id)}
                      disabled={salvando}
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span className="truncate">{cat.nome}</span>
                  </label>
                ))
              )}
            </div>

            {categoriasSelecionadas.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5">
                {categoriasSelecionadas.map((id) => {
                  const cat = categorias.find((c) => c.id === id);
                  return cat ? (
                    <span
                      key={id}
                      className="flex items-center gap-1 bg-teal-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg"
                    >
                      {cat.nome}
                      <button
                        type="button"
                        onClick={() => handleCheckboxChange(id)}
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

          {/* CAPA */}
          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Imagem de Capa (opcional):
            </label>
            <div className="flex items-center gap-3 border border-gray-200 p-3 rounded-xl bg-white">
              <ImagePlus size={24} className="text-teal-500 shrink-0" />
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => setCapa(e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 cursor-pointer"
                disabled={salvando}
              />
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/dashboard/sugestoes")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="bg-[#13b5a2] hover:bg-[#0fa190] text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-md shadow-teal-950/10 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{salvando ? "Salvando..." : "Publicar Sugestão"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
