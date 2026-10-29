/**
 * EXPORTAR ANOTAÇÕES — salvar o diário em PDF.
 *
 * Funciona 100% no navegador: usa as anotações que a tela já carregou, monta
 * uma área só para impressão e abre a janela de impressão, onde o usuário
 * escolhe "Salvar como PDF". Nenhuma requisição ao servidor, e o texto do
 * diário não passa por nenhum caminho novo.
 *
 * O PDF segue a ordem do array recebido (nas telas: a mesma da listagem).
 * Fica de fora: e-mail, nome e qualquer dado técnico — só título, data,
 * humor e texto.
 *
 * Uso:
 *   <ExportarAnotacoes anotacoes={lista} className="...">Exportar</ExportarAnotacoes>
 *
 * Visual do PDF: classes Tailwind (variante print:) aqui mesmo. O CSS em
 * exportar-anotacoes.css só cuida da margem da folha e de esconder o app.
 * Para remover: ver o comentário no topo de exportar-anotacoes.css.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";
import { infoHumor } from "../../utils/humores";
import "./exportar-anotacoes.css";

const formatarData = (dataString) => {
  if (!dataString) return "";
  return new Date(dataString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ExportarAnotacoes({
  anotacoes,
  className = "",
  tituloDocumento = "MindUp - Meu diario",
  children = "Exportar anotações",
}) {
  const [avisoAberto, setAvisoAberto] = useState(false);
  const [areaMontada, setAreaMontada] = useState(false);
  const [disparo, setDisparo] = useState(0);

  const botaoRef = useRef(null);
  const dialogRef = useRef(null);
  const gerarRef = useRef(null);
  const tituloPendenteRef = useRef(tituloDocumento);
  const tituloOriginalRef = useRef(null);

  const total = anotacoes.length;
  const vazio = total === 0;
  const plural = total !== 1;

  // ----------------------------
  // AVISO (modal acessível)
  // ----------------------------
  useEffect(() => {
    if (!avisoAberto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    gerarRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [avisoAberto]);

  const fecharAviso = () => {
    setAvisoAberto(false);
    botaoRef.current?.focus();
  };

  const handleKeyDownAviso = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      fecharAviso();
      return;
    }

    if (e.key !== "Tab") return;

    const botoes = dialogRef.current?.querySelectorAll("button");
    if (!botoes || botoes.length === 0) return;

    const primeiro = botoes[0];
    const ultimo = botoes[botoes.length - 1];

    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  };

  // ----------------------------
  // GERAR PDF
  // ----------------------------
  const gerar = () => {
    tituloPendenteRef.current = tituloDocumento;
    setAvisoAberto(false);
    botaoRef.current?.focus();
    setAreaMontada(true);
    setDisparo((d) => d + 1); // contador: permite exportar de novo depois
  };

  // Espera a área de impressão aparecer no DOM e abre a impressão.
  // O título da aba vira o nome sugerido do arquivo e é restaurado depois.
  useEffect(() => {
    if (disparo === 0) return;

    const restaurarTitulo = () => {
      if (tituloOriginalRef.current !== null) {
        document.title = tituloOriginalRef.current;
        tituloOriginalRef.current = null;
      }
    };

    const aoTerminar = () => {
      restaurarTitulo();
      setAreaMontada(false);
    };

    window.addEventListener("afterprint", aoTerminar);

    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (tituloOriginalRef.current === null) {
          tituloOriginalRef.current = document.title;
        }
        document.title = tituloPendenteRef.current;
        window.print();
      }),
    );

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("afterprint", aoTerminar);
      restaurarTitulo();
    };
  }, [disparo]);

  return (
    <>
      <button
        type="button"
        ref={botaoRef}
        onClick={() => setAvisoAberto(true)}
        disabled={vazio}
        aria-haspopup="dialog"
        title={vazio ? "Você ainda não tem anotações para exportar" : undefined}
        className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb300]`}
      >
        <Download size={16} aria-hidden="true" />
        <span>{children}</span>
      </button>

      {avisoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) fecharAviso();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-exportar-anotacoes"
            aria-describedby="texto-exportar-anotacoes"
            onKeyDown={handleKeyDownAviso}
            className="bg-white text-black rounded-2xl shadow-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto p-5 sm:p-6"
          >
            <h2
              id="titulo-exportar-anotacoes"
              className="text-lg sm:text-xl font-black text-purple-950 leading-snug mb-3"
            >
              Exportar {plural ? "anotações" : "anotação"} em PDF
            </h2>

            <div
              id="texto-exportar-anotacoes"
              className="text-sm text-gray-600 leading-relaxed space-y-2"
            >
              <p>
                O arquivo gerado contém{" "}
                {plural ? "suas anotações pessoais" : "sua anotação pessoal"}.
                Guarde-o com cuidado, principalmente se este dispositivo for
                compartilhado.
              </p>
              <p>
                Na janela que vai abrir, escolha{" "}
                <strong>“Salvar como PDF”</strong> como destino.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={fecharAviso}
                className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
              >
                Cancelar
              </button>
              <button
                type="button"
                ref={gerarRef}
                onClick={gerar}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-white bg-purple-900 hover:bg-purple-950 shadow-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
              >
                <Download size={16} aria-hidden="true" />
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área só para impressão (invisível na tela, direto no <body>).
          O visual é Tailwind; "hidden print:block" mostra só ao imprimir. */}
      {areaMontada &&
        createPortal(
          <div
            id="impressao-anotacoes"
            className="hidden print:block font-sans text-[11pt] leading-[1.55] text-neutral-800"
          >
            <header className="pb-[8pt] mb-6 border-b-2 border-[#5b1aa0]">
              <p className="text-[22pt] font-extrabold leading-tight tracking-wide text-[#5b1aa0]">
                MindUp
              </p>
              <p className="mt-[2pt] text-[13pt] font-semibold text-neutral-700">
                Meu diário
              </p>
              <p className="mt-[4pt] text-[9.5pt] text-neutral-500">
                Exportado em {new Date().toLocaleDateString("pt-BR")} · {total}{" "}
                {plural ? "anotações" : "anotação"}
              </p>
            </header>

            {anotacoes.map((a) => {
              const humor = infoHumor(a.humor);
              return (
                <article
                  key={a.id}
                  className="pb-4 mb-[14pt] border-b border-neutral-300 break-inside-avoid last:mb-0 last:border-b-0"
                >
                  <h2 className="mb-1 text-[14pt] font-bold leading-snug text-[#2d0a52] wrap-anywhere break-after-avoid">
                    {a.titulo}
                  </h2>
                  <p className="mb-[7pt] text-[9.5pt] text-neutral-500">
                    Escrito em{" "}
                    <time dateTime={a.created_at}>
                      {formatarData(a.created_at)}
                    </time>
                    {humor && (
                      <>
                        {" "}
                        · Humor: <span aria-hidden="true">
                          {humor.emoji}
                        </span>{" "}
                        {humor.label}
                      </>
                    )}
                  </p>
                  <p className="whitespace-pre-wrap wrap-anywhere [orphans:3] [widows:3]">
                    {a.texto}
                  </p>
                </article>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
