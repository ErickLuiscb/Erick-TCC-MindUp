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

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // ============================
  // CARREGAR DADOS DO ARTIGO ORIGINAL
  // ============================
  useEffect(() => {
    async function carregarArtigo() {
      try {
        setCarregando(true);
        const resp = await api.get(`/artigos/${id}`); // Rota oficial /api/artigos/{id}
        const artigo = resp.data.data ?? resp.data;

        setTitulo(artigo.titulo || "");
        setDescricao(artigo.descricao ?? "");
        setAtivo(artigo.ativo === undefined ? true : Boolean(artigo.ativo));

        if (artigo.categorias && Array.isArray(artigo.categorias)) {
          const idsAntigos = artigo.categorias.map((c) => c.id);
          setCategoriasSelecionadas(idsAntigos);
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

  const obterCategoriasAgrupadas = () => {
    const grupos = {};
    categorias.forEach((cat) => {
      const assunto = cat.nome.includes("-")
        ? cat.nome.split("-")[0].trim()
        : "Geral / Outros";
      if (!grupos[assunto]) {
        grupos[assunto] = [];
      }
      grupos[assunto].push(cat);
    });
    return grupos;
  };

  const categoriesAgrupadas = obterCategoriasAgrupadas();

  // Gerencia a seleção aplicando a trava estrita de máximo 5 categorias
  const handleCheckboxChange = (id) => {
    setErro("");
    setCategoriasSelecionadas((prev) => {
      if (prev.includes(id)) {
        return prev.filter((catId) => catId !== id);
      }
      if (prev.length >= 5) {
        setErro(
          "⚠️ Limite atingido: Você só pode selecionar no máximo 5 categorias por conteúdo.",
        );
        return prev;
      }
      return [...prev, id];
    });
  };

  // ============================
  // SALVAR ALTERAÇÕES
  // ============================
  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("ativo", ativo ? "1" : "0");

    if (arquivoPdf) {
      formData.append("arquivo_pdf", arquivoPdf);
    }

    categoriasSelecionadas.forEach((catId) => {
      formData.append("categorias[]", catId);
    });

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
      {/* Botão Superior de Voltar */}
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

      {/* Banner de Mensagens de Erro */}
      {erro && (
        <div className="p-4 bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl mb-6 shadow-xs animate-fadeIn flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Caixa do Formulário Unificada */}
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
          {/* TÍTULO */}
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

          {/* DESCRIÇÃO */}
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

          {/* SELETOR DE VISIBILIDADE OPERACIONAL */}
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

          {/* CHECKBOXES DE CATEGORIAS AGRUPADAS */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-2 mb-4 gap-1">
              <label className="text-xs font-black text-purple-950 uppercase tracking-wider">
                Vincular Categorias Temáticas:
              </label>
              <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md w-fit">
                {categoriasSelecionadas.length} / 5 Selecionadas
              </span>
            </div>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {Object.keys(categoriesAgrupadas).map((assunto) => (
                <div
                  key={assunto}
                  className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <h4 className="text-[11px] font-black text-purple-700 uppercase tracking-wider mb-2 bg-purple-50 px-2 py-0.5 rounded w-fit">
                    📁 {assunto}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                    {categoriesAgrupadas[assunto].map((cat) => (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-semibold cursor-pointer select-none transition ${
                          categoriasSelecionadas.includes(cat.id)
                            ? "bg-purple-100 border-purple-300 text-purple-950 font-bold"
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

                        {cat.nome.includes("-")
                          ? cat.nome.split("-")[1].trim()
                          : cat.nome}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TROCA DE ARQUIVO OPCIONAL */}
          <div>
            <label className="block mb-2 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Substituir Documento Digital (Opcional):
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setArquivoPdf(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
              disabled={salvando}
            />
          </div>

          {/* BOTÕES DE ENVIO */}
          <div className="flex justify-end gap-3 pt-4">
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
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2"
            >
              <Save size={14} />
              {salvando ? "Sincronizando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
