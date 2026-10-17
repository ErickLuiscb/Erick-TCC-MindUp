import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../service/api";
import { useAuth } from "../../context/AuthContext";
import { REGIOES_CRP, formatarCpf } from "../../utils/crp";
import {
  ArrowLeft,
  Check,
  X,
  Copy,
  ExternalLink,
  Search,
  Clock,
  Mail,
  AlertTriangle,
  RotateCw,
  UserCheck,
} from "lucide-react";

const URL_CONSULTA_CFP = "https://cadastro.cfp.org.br/";
const MAX_MOTIVO = 500;

const BADGES_STATUS = {
  pendente: {
    texto: "Pendente",
    classe: "bg-amber-50 text-amber-700 border-amber-100",
  },
  aprovado: {
    texto: "Aprovado",
    classe: "bg-green-50 text-green-700 border-green-100",
  },
  rejeitado: {
    texto: "Rejeitado",
    classe: "bg-red-50 text-red-600 border-red-100",
  },
};

// ============================
// HELPERS
// ============================
const rotuloRegiao = (n) =>
  REGIOES_CRP.find((r) => r.valor === Number(n))?.rotulo ?? null;

// 3 + 31253 -> "03/31253" (psicólogos antigos não têm região)
const formatarCrp = (p) =>
  p.crp_regiao
    ? `${String(p.crp_regiao).padStart(2, "0")}/${p.crp}`
    : (p.crp ?? "—");

const formatarData = (iso) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

// Busca sem diferenciar acento nem maiúscula
const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const mensagemDeErro = (error, padrao) =>
  error?.foiTimeout
    ? "O servidor demorou para responder. Ele pode estar iniciando; tente novamente em instantes."
    : error?.response?.data?.message || padrao;

// ============================
// BOTÃO COPIAR (o admin cola no site do CFP)
// ============================
function CopiarBotao({ texto, rotulo }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // sem permissão de área de transferência: o texto continua visível
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={`Copiar ${rotulo}`}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 transition cursor-pointer"
    >
      {copiado ? <Check size={11} /> : <Copy size={11} />}
      <span>{copiado ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

// ============================
// MODAL DE MOTIVO (rejeitar / revogar)
// ============================
function ModalMotivo({ alvo, acao, enviando, erro, onCancelar, onConfirmar }) {
  const [motivo, setMotivo] = useState("");

  const revogando = acao === "revogar";
  const titulo = revogando
    ? "Revogar permissão de publicação"
    : "Rejeitar solicitação";
  const explicacao = revogando
    ? "O psicólogo perderá a permissão de publicar e será desconectado. Ele verá o motivo no painel dele."
    : "O psicólogo será desconectado e verá o motivo no painel dele.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="bg-white text-black rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <h2 className="text-lg font-black text-purple-950">{titulo}</h2>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-bold">{alvo.nome}</span> — CRP{" "}
          {formatarCrp(alvo)}
        </p>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          {explicacao}
        </p>

        <label
          htmlFor="motivo-admin"
          className="block mt-4 text-sm font-bold text-purple-900"
        >
          Motivo (obrigatório):
        </label>
        <textarea
          id="motivo-admin"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={MAX_MOTIVO}
          rows={4}
          disabled={enviando}
          placeholder="Ex.: Não localizamos o registro informado no Cadastro Nacional."
          className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-sm focus:outline-purple-600 resize-none"
        />
        <p className="text-[11px] text-gray-400 text-right">
          {motivo.length}/{MAX_MOTIVO}
        </p>

        {erro && (
          <p className="mt-2 text-sm text-red-600 font-semibold" role="alert">
            {erro}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onCancelar}
            disabled={enviando}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar(motivo)}
            disabled={enviando || !motivo.trim()}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? "Enviando..." : revogando ? "Revogar" : "Rejeitar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================
// AVATAR (foto ou inicial)
// ============================
function Avatar({ p }) {
  if (p.imagem_perfil) {
    return (
      <img
        src={p.imagem_perfil}
        alt=""
        className="w-12 h-12 rounded-full object-cover border border-purple-100 shrink-0"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center shrink-0">
      {(p.nome ?? "?").trim().charAt(0).toUpperCase()}
    </div>
  );
}

// ============================
// PÁGINA
// ============================
export default function PainelPsicologos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [psicologos, setPsicologos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);

  const [aba, setAba] = useState("pedidos"); // pedidos | psicologos
  const [filtroStatus, setFiltroStatus] = useState("todos"); // todos | aprovado | rejeitado
  const [busca, setBusca] = useState("");

  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "erro", texto }
  const [processandoId, setProcessandoId] = useState(null);
  const [modal, setModal] = useState(null); // { psicologo, acao: "rejeitar" | "revogar" }
  const [erroModal, setErroModal] = useState("");

  // ============================
  // CARREGAR
  // ============================
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);

    try {
      const resp = await api.get("/admin/psicologos");
      setPsicologos(resp.data.data ?? []);
    } catch (error) {
      setErroCarga(
        mensagemDeErro(error, "Não foi possível carregar os psicólogos."),
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O aviso some sozinho
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(t);
  }, [aviso]);

  // ============================
  // LISTAS DERIVADAS
  // ============================
  const correspondeBusca = useCallback(
    (p) => {
      const termo = normalizar(busca.trim());
      if (!termo) return true;
      return [p.nome, p.email, p.crp].some((campo) =>
        normalizar(campo).includes(termo),
      );
    },
    [busca],
  );

  // Pedidos: o mais antigo primeiro (fila)
  const pedidos = useMemo(
    () =>
      psicologos
        .filter((p) => (p.crp_status ?? "pendente") === "pendente")
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [psicologos],
  );

  const cadastrados = useMemo(
    () =>
      psicologos.filter(
        (p) => p.crp_status === "aprovado" || p.crp_status === "rejeitado",
      ),
    [psicologos],
  );

  const totalAprovados = cadastrados.filter(
    (p) => p.crp_status === "aprovado",
  ).length;
  const totalRejeitados = cadastrados.length - totalAprovados;

  const pedidosVisiveis = pedidos.filter(correspondeBusca);
  const cadastradosVisiveis = cadastrados
    .filter((p) => filtroStatus === "todos" || p.crp_status === filtroStatus)
    .filter(correspondeBusca);

  // ============================
  // AÇÕES
  // ============================
  async function enviarStatus(p, status, motivo) {
    setProcessandoId(p.id);

    try {
      const resp = await api.patch(`/admin/psicologos/${p.id}/status`, {
        status,
        ...(motivo ? { motivo } : {}),
      });

      setPsicologos((prev) =>
        prev.map((x) => (x.id === p.id ? resp.data.data : x)),
      );
      // A decisão foi gravada; só o e-mail de aviso pode ter falhado
      setAviso(
        resp.data.email_enviado === false
          ? {
              tipo: "erro",
              texto: `${resp.data.message} Atenção: não foi possível enviar o e-mail de aviso ao psicólogo.`,
            }
          : { tipo: "ok", texto: resp.data.message },
      );
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        mensagem: mensagemDeErro(error, "Não foi possível concluir a ação."),
      };
    } finally {
      setProcessandoId(null);
    }
  }

  async function aprovar(p, reativando = false) {
    const ok = window.confirm(
      reativando
        ? `Reativar a permissão de publicação de ${p.nome}?\n\nEle será desconectado e, ao entrar de novo, poderá publicar conteúdos.`
        : `Aprovar ${p.nome} (CRP ${formatarCrp(p)})?\n\nEle será desconectado e, ao entrar de novo, poderá publicar conteúdos.`,
    );
    if (!ok) return;

    const r = await enviarStatus(p, "aprovado");
    if (!r.ok) setAviso({ tipo: "erro", texto: r.mensagem });
  }

  function abrirModal(psicologo, acao) {
    setErroModal("");
    setModal({ psicologo, acao });
  }

  async function confirmarModal(motivo) {
    setErroModal("");
    const r = await enviarStatus(modal.psicologo, "rejeitado", motivo.trim());

    if (r.ok) {
      setModal(null);
    } else {
      setErroModal(r.mensagem);
    }
  }

  // ============================
  // ESTADOS DE TELA
  // ============================
  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-pulse">
        <div className="text-xl font-bold text-white tracking-wide">
          Carregando psicólogos...
        </div>
      </div>
    );
  }

  if (erroCarga) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-red-900/80 border border-red-500 p-6 rounded-2xl shadow-xl text-center text-white">
        <AlertTriangle size={28} className="mx-auto mb-2" />
        <p className="font-bold">{erroCarga}</p>
        <button
          onClick={carregar}
          className="mt-4 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer"
        >
          <RotateCw size={12} />
          Tentar novamente
        </button>
      </div>
    );
  }

  const ehEuMesmo = (p) => usuario?.id === p.id;

  return (
    <div className="text-black max-w-5xl mx-auto animate-fadeIn p-2">
      <button
        onClick={() => navigate("/inicial")}
        className="flex items-center gap-2 text-purple-200 hover:text-white font-semibold text-sm mb-6 group transition-colors cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Voltar ao Início</span>
      </button>

      {/* TOPO */}
      <div className="mb-8 pb-4 border-b border-purple-300/30 text-white">
        <h1 className="text-3xl font-black tracking-wide drop-shadow-md text-[#ffb300]">
          Gerenciar Psicólogos 🛡️
        </h1>
        <p className="text-purple-200 text-xs md:text-sm mt-1 font-medium">
          Analise os pedidos de cadastro e controle quem pode publicar na
          plataforma.
        </p>
      </div>

      {/* AVISO (sucesso / erro) */}
      {aviso && (
        <div
          role="status"
          className={`mb-6 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between gap-3 border ${
            aviso.tipo === "ok"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span>{aviso.texto}</span>
          <button
            onClick={() => setAviso(null)}
            aria-label="Fechar aviso"
            className="cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ABAS + BUSCA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div role="tablist" className="flex gap-2">
          <button
            role="tab"
            aria-selected={aba === "pedidos"}
            onClick={() => setAba("pedidos")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              aba === "pedidos"
                ? "bg-white text-purple-900 shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Clock size={15} />
            <span>Pedidos</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                pedidos.length > 0
                  ? "bg-[#ff3d00] text-white"
                  : "bg-purple-200/60 text-purple-900"
              }`}
            >
              {pedidos.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={aba === "psicologos"}
            onClick={() => setAba("psicologos")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              aba === "psicologos"
                ? "bg-white text-purple-900 shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <UserCheck size={15} />
            <span>Psicólogos</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-black bg-purple-200/60 text-purple-900">
              {cadastrados.length}
            </span>
          </button>
        </div>

        <div className="relative md:w-72">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CRP"
            aria-label="Buscar psicólogo"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 focus:outline-purple-600"
          />
        </div>
      </div>

      {/* ============ ABA: PEDIDOS ============ */}
      {aba === "pedidos" && (
        <>
          {pedidosVisiveis.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto mt-8 shadow-xl text-white">
              <p className="text-2xl mb-2">✅</p>
              <h3 className="font-bold text-lg">
                {pedidos.length === 0
                  ? "Nenhum pedido pendente"
                  : "Nenhum pedido encontrado"}
              </h3>
              <p className="text-purple-200 text-xs mt-1 leading-relaxed">
                {pedidos.length === 0
                  ? "Quando um psicólogo se cadastrar, o pedido aparecerá aqui para análise."
                  : "Nenhum pedido corresponde à sua busca."}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {pedidosVisiveis.map((p) => {
              const processando = processandoId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-2xl border border-purple-50 p-6"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar p={p} />
                      <div className="min-w-0">
                        <h3 className="text-lg font-black text-purple-950 tracking-wide truncate">
                          {p.nome}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {p.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${
                        p.email_verificado
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      <Mail size={11} />
                      {p.email_verificado
                        ? "E-mail confirmado"
                        : "E-mail não confirmado"}
                    </span>
                  </div>

                  {/* DADOS PARA CONFERÊNCIA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Registro (CRP)
                      </p>
                      <p className="text-sm font-bold text-purple-950 mt-1">
                        CRP {formatarCrp(p)}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {rotuloRegiao(p.crp_regiao) ?? "Região não informada"}
                      </p>
                      <div className="mt-2">
                        <CopiarBotao
                          texto={p.crp ?? ""}
                          rotulo="número do CRP"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        CPF
                      </p>
                      <p className="text-sm font-bold text-purple-950 mt-1">
                        {p.cpf ? formatarCpf(p.cpf) : "Indisponível"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Apagado após a decisão
                      </p>
                      {p.cpf && (
                        <div className="mt-2">
                          <CopiarBotao
                            texto={formatarCpf(p.cpf)}
                            rotulo="CPF"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Solicitado em
                      </p>
                      <p className="text-sm font-bold text-purple-950 mt-1">
                        {formatarData(p.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* COMO CONFERIR */}
                  <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <p className="text-xs text-purple-900 leading-relaxed">
                      <span className="font-bold">Como conferir:</span> abra a
                      consulta do CFP, escolha a região, informe o número de
                      registro (e o CPF) e confirme se o{" "}
                      <span className="font-bold">nome</span> e a situação{" "}
                      <span className="font-bold">ATIVO</span> batem com os
                      dados acima.
                    </p>
                    <a
                      href={URL_CONSULTA_CFP}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
                    >
                      <ExternalLink size={12} />
                      Abrir consulta do CFP
                    </a>
                  </div>

                  {!p.email_verificado && (
                    <p className="mt-3 text-[11px] text-amber-700">
                      Você pode aprovar mesmo assim: ele só conseguirá entrar
                      depois de confirmar o e-mail.
                    </p>
                  )}

                  {/* AÇÕES */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end gap-3">
                    {ehEuMesmo(p) ? (
                      <span className="text-xs text-gray-400 font-semibold">
                        Você não pode analisar o seu próprio pedido.
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => abrirModal(p, "rejeitar")}
                          disabled={processando}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-100 cursor-pointer disabled:opacity-50"
                        >
                          <X size={12} />
                          <span>Rejeitar</span>
                        </button>
                        <button
                          onClick={() => aprovar(p)}
                          disabled={processando}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Check size={12} />
                          <span>{processando ? "Enviando..." : "Aprovar"}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============ ABA: PSICÓLOGOS CADASTRADOS ============ */}
      {aba === "psicologos" && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: "todos", texto: "Todos", total: cadastrados.length },
              { id: "aprovado", texto: "Aprovados", total: totalAprovados },
              { id: "rejeitado", texto: "Rejeitados", total: totalRejeitados },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltroStatus(f.id)}
                aria-pressed={filtroStatus === f.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filtroStatus === f.id
                    ? "bg-[#ffb300] text-purple-950"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {f.texto} ({f.total})
              </button>
            ))}
          </div>

          {cadastradosVisiveis.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto mt-8 shadow-xl text-white">
              <p className="text-2xl mb-2">👥</p>
              <h3 className="font-bold text-lg">Nenhum psicólogo encontrado</h3>
              <p className="text-purple-200 text-xs mt-1 leading-relaxed">
                Ajuste o filtro ou a busca para ver outros resultados.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {cadastradosVisiveis.map((p) => {
              const processando = processandoId === p.id;
              const badge = BADGES_STATUS[p.crp_status];

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-xl border border-purple-50 p-5"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar p={p} />
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-purple-950 tracking-wide truncate">
                          {p.nome}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {p.email}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          CRP {formatarCrp(p)}
                          {rotuloRegiao(p.crp_regiao) &&
                            ` · ${rotuloRegiao(p.crp_regiao)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span
                          className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${badge.classe}`}
                        >
                          {badge.texto}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Decisão em {formatarData(p.crp_analisado_em)}
                        </p>
                      </div>

                      {ehEuMesmo(p) ? (
                        <span className="text-xs text-gray-400 font-semibold">
                          Você
                        </span>
                      ) : p.crp_status === "aprovado" ? (
                        <button
                          onClick={() => abrirModal(p, "revogar")}
                          disabled={processando}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-100 cursor-pointer disabled:opacity-50"
                        >
                          <X size={12} />
                          <span>Revogar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => aprovar(p, true)}
                          disabled={processando}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Check size={12} />
                          <span>
                            {processando ? "Enviando..." : "Reativar"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {p.crp_motivo && (
                    <p
                      className={`mt-3 text-xs rounded-lg px-3 py-2 border ${
                        p.crp_status === "rejeitado"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-gray-50 text-gray-500 border-gray-100"
                      }`}
                    >
                      <span className="font-bold">
                        {p.crp_status === "rejeitado" ? "Motivo: " : "Obs.: "}
                      </span>
                      {p.crp_motivo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL DE MOTIVO (rejeitar / revogar) */}
      {modal && (
        <ModalMotivo
          alvo={modal.psicologo}
          acao={modal.acao}
          enviando={processandoId === modal.psicologo.id}
          erro={erroModal}
          onCancelar={() => setModal(null)}
          onConfirmar={confirmarModal}
        />
      )}
    </div>
  );
}
