import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../../service/api";
import { useVideos } from "../../../context/VideosContext";
import { TIPOS_MIDIA_AUTOAJUDA } from "../../../utils/autoajuda";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  UploadCloud,
  Search,
  X,
} from "lucide-react";

export default function EditarAutoajuda() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categorias = [] } = useVideos();

  const [tipoMidia, setTipoMidia] = useState("imagem");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [midiaAtual, setMidiaAtual] = useState(null);
  const [midia, setMidia] = useState(null);
  const [ativo, setAtivo] = useState(true);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [buscaCategoria, setBuscaCategoria] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const tipoAtual = TIPOS_MIDIA_AUTOAJUDA.find((t) => t.valor === tipoMidia);

  useEffect(() => {
    async function carregarConteudo() {
      try {
        setCarregando(true);
        const resp = await api.get(`/autoajudas/${id}`);
        const item = resp.data.data ?? resp.data;

        setTipoMidia(item.tipo_midia || "imagem");
        setTitulo(item.titulo || "");
        setDescricao(item.descricao ?? "");
        setMidiaAtual(item.midia ?? null);
        setAtivo(item.ativo === undefined ? true : Boolean(item.ativo));

        if (item.categorias && Array.isArray(item.categorias)) {
          setCategoriasSelecionadas(item.categorias.map((c) => c.id));
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados do conteúdo.");
        navigate("/dashboard/autoajuda");
      } finally {
        setCarregando(false);
      }
    }
    carregarConteudo();
  }, [id, navigate]);

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nome.toLowerCase().includes(buscaCategoria.toLowerCase()),
  );

  const handleCheckboxChange = (catId) => {
    setErro("");
    setCategoriasSelecionadas((prev) => {
      if (prev.includes(catId)) return prev.filter((id) => id !== catId);
      if (prev.length >= 5) {
        setErro(
          "⚠️ Limite atingido: Você só pode selecionar no máximo 5 categorias por conteúdo.",
        );
        return prev;
      }
      return [...prev, catId];
    });
  };

  const handleArquivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extensao = file.name.split(".").pop().toLowerCase();
    if (!tipoAtual.extensoes.includes(extensao)) {
      setErro(
        `❌ O tipo de mídia selecionado é "${tipoAtual.label}", mas o arquivo enviado (.${extensao}) não corresponde. Formatos aceitos: ${tipoAtual.extensoes.join(", ")}.`,
      );
      e.target.value = "";
      setMidia(null);
      return;
    }

    setErro("");
    setMidia(file);
  };

  async function salvar(e) {
    e.preventDefault();
    setErro("");

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("tipo_midia", tipoMidia);
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    if (midia) formData.append("midia", midia);
    formData.append("ativo", ativo ? "1" : "0");
    categoriasSelecionadas.forEach((cid) =>
      formData.append("categorias[]", cid),
    );

    try {
      setSalvando(true);
      await api.post(`/autoajudas/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard/autoajuda");
    } catch (error) {
      console.error(error);

      if (error.foiTimeout) {
        setErro(
          "⏱️ O servidor demorou mais que o esperado. Confira em 'Gerenciar Autoajuda' se a alteração já foi salva antes de tentar de novo.",
        );
      } else {
        setErro(
          "❌ " +
            (error.response?.data?.errors?.midia?.[0] ||
              error.response?.data?.message ||
              "Erro ao tentar atualizar o conteúdo no servidor."),
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
        <div className="text-xl font-bold text-white tracking-wide">
          Carregando dados do conteúdo...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-2 text-black animate-fadeIn">
      <button
        type="button"
        onClick={() => navigate("/dashboard/autoajuda")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors"
        disabled={salvando}
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar para Minhas Publicações</span>
      </button>

      {erro && (
        <div className="p-4 bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl mb-6 shadow-xs animate-fadeIn flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-sky-100">
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-black text-purple-950 tracking-wide">
            Editar Conteúdo de Autoajuda 🌱
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Atualize as informações deste conteúdo.
          </p>
        </header>

        <form onSubmit={salvar} className="space-y-5">
          <div>
            <label className="block mb-2 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Tipo de Mídia:
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_MIDIA_AUTOAJUDA.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  onClick={() => {
                    setTipoMidia(t.valor);
                    setMidia(null);
                    setErro("");
                  }}
                  disabled={salvando}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer flex items-center gap-1.5 ${
                    tipoMidia === t.valor
                      ? "bg-[#1599cd] border-sky-500 text-white shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            {midiaAtual && (
              <p className="text-[10px] text-amber-600 mt-1.5">
                ⚠️ Mudar o tipo de mídia exige enviar um novo arquivo
                compatível.
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Título:
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:outline-sky-600 text-black font-semibold"
              required
              maxLength={150}
              disabled={salvando}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Descrição (opcional):
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm h-24 focus:outline-sky-600 text-black leading-relaxed"
              disabled={salvando}
              maxLength={5000}
            />
          </div>

          <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1">
                {ativo ? (
                  <Eye size={14} className="text-emerald-600" />
                ) : (
                  <EyeOff size={14} className="text-gray-500" />
                )}
                <span>Status de Visibilidade</span>
              </p>
            </div>
            <select
              value={ativo ? "1" : "0"}
              onChange={(e) => setAtivo(e.target.value === "1")}
              className="p-2 border border-gray-300 rounded-lg bg-white text-xs font-bold text-gray-700 focus:outline-sky-600 cursor-pointer"
              disabled={salvando}
            >
              <option value="1">🟢 No Ar</option>
              <option value="0">⚪ Oculto (Rascunho)</option>
            </select>
          </div>

          {/* CATEGORIAS */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 mb-4 gap-1">
              <label className="text-xs font-black text-purple-950 uppercase tracking-wider block">
                Categorias Temáticas:
              </label>
              <span className="text-[10px] font-black uppercase text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md w-fit shrink-0">
                {categoriasSelecionadas.length} / 5 selecionadas
              </span>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Pesquisar categoria..."
                value={buscaCategoria}
                onChange={(e) => setBuscaCategoria(e.target.value)}
                disabled={salvando}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-black focus:outline-sky-600 placeholder-gray-400"
              />
              <Search
                size={14}
                className="absolute left-3 top-3 text-sky-500"
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
              {categoriasFiltradas.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer select-none transition ${
                    categoriasSelecionadas.includes(cat.id)
                      ? "bg-sky-100 border-sky-300 text-sky-900 font-black"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={categoriasSelecionadas.includes(cat.id)}
                    onChange={() => handleCheckboxChange(cat.id)}
                    disabled={salvando}
                    className="rounded text-sky-700 focus:ring-sky-600"
                  />
                  <span className="truncate">{cat.nome}</span>
                </label>
              ))}
            </div>

            {categoriasSelecionadas.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5">
                {categoriasSelecionadas.map((catId) => {
                  const cat = categorias.find((c) => c.id === catId);
                  return cat ? (
                    <span
                      key={catId}
                      className="flex items-center gap-1 bg-sky-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg"
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

          {/* ARQUIVO DE MÍDIA */}
          <div>
            <label className="block mb-1 text-xs font-bold text-purple-950 uppercase tracking-wider">
              Arquivo ({tipoAtual.label}):
            </label>

            {midiaAtual && !midia && (
              <div className="mb-2 flex items-center gap-3">
                {tipoMidia === "imagem" ? (
                  <img
                    src={midiaAtual}
                    alt="Mídia atual"
                    className="w-20 h-14 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <video
                    src={midiaAtual}
                    className="w-20 h-14 object-cover rounded-lg border border-gray-200"
                    muted
                  />
                )}
                <span className="text-[11px] text-gray-400">
                  Mídia atual — envie um novo arquivo abaixo para substituir.
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 border border-gray-200 p-3 rounded-xl bg-white">
              <UploadCloud size={24} className="text-sky-500 shrink-0" />
              <input
                type="file"
                accept={tipoAtual.accept}
                onChange={handleArquivo}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 cursor-pointer"
                disabled={salvando}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Formatos aceitos para {tipoAtual.label.toLowerCase()}:{" "}
              {tipoAtual.extensoes.join(", ")}. Máximo 50MB.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/dashboard/autoajuda")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="bg-[#1599cd] hover:bg-[#1287b5] text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-md shadow-sky-950/10 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{salvando ? "Salvando..." : "Salvar Alterações"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
