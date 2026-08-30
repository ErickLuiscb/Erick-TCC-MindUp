import { useState } from "react";
import { HeartHandshake, Phone, X, MessageCircleHeart } from "lucide-react";

export default function Footer() {
  const [aberto, setAberto] = useState(false);

  return (
    <footer className="bg-[#3a0b6d] text-white text-sm shadow-inner relative">
      {/* Painel expandido de apoio */}
      {aberto && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[92vw] max-w-md bg-white text-black rounded-2xl shadow-2xl border border-purple-100 p-5 animate-fadeIn z-50">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <HeartHandshake size={20} className="text-[#7a00c1] shrink-0" />
              <h3 className="text-sm font-black text-purple-950 uppercase tracking-wide">
                Você não está sozinho(a)
              </h3>
            </div>
            <button
              onClick={() => setAberto(false)}
              className="text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            O MindUp reúne conteúdos de apoio, mas{" "}
            <strong>não substitui acompanhamento profissional</strong>. Se você
            está passando por um momento difícil, considere conversar com alguém
            de confiança ou buscar ajuda especializada.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
              <MessageCircleHeart
                size={18}
                className="text-[#7a00c1] shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-black text-purple-950">
                  CVV — Centro de Valorização da Vida
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Apoio emocional gratuito, 24h por dia, todos os dias.
                </p>
                <p className="text-xs font-bold text-purple-800 mt-1">
                  Ligue <span className="text-sm">188</span> · chat e e-mail em{" "}
                  <a
                    href="https://www.cvv.org.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-purple-950"
                  >
                    cvv.org.br
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
              <Phone size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-red-800">
                  Risco imediato à vida
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Em uma emergência, ligue para o SAMU ou vá ao pronto-socorro
                  mais próximo.
                </p>
                <p className="text-xs font-bold text-red-700 mt-1">
                  SAMU <span className="text-sm">192</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 py-3 px-4 text-center">
        <button
          onClick={() => setAberto((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#ffb300] hover:text-white transition cursor-pointer"
        >
          <HeartHandshake size={14} />
          <span>Precisa de apoio? Estamos aqui</span>
        </button>

        <span className="hidden sm:inline text-white/20">•</span>

        <p className="text-[11px] text-white/60">
          © 2025 <strong>MindUp</strong> — Todos os direitos reservados a Érick
          Luis Capera Barneche
        </p>
      </div>
    </footer>
  );
}
