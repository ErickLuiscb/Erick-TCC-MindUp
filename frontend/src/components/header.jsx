import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Home,
  User,
  LogOut,
  BookOpen,
  Heart,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBootstrap } from "../context/BootstrapContext";

/*
- tamanho: "normal" (barra do desktop) ou "bloco" (menu do celular, ocupa a
  largura toda e tem altura maior, mais fácil de tocar com o dedo).
*/
const base =
  "relative rounded-lg shadow-md transition flex items-center gap-2 font-semibold text-sm " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]";

const tamanhos = {
  normal: "px-4 py-2",
  bloco: "w-full px-4 py-3",
};

const inativo = "bg-[#7a00c1] hover:bg-[#8c00db] hover:text-[#ff7300]";

const ativo = "bg-[#7a00c1] text-[#ff9a4d] ring-1 ring-[#ff9a4d]/60";

function NavBtn({ ativoQuando, onClick, icone, tamanho = "normal", children }) {
  const { pathname } = useLocation();

  const estaAtivo = ativoQuando.some(
    (rota) => pathname === rota || pathname.startsWith(rota + "/"),
  );

  return (
    <button
      onClick={onClick}
      aria-current={estaAtivo ? "page" : undefined}
      className={`${base} ${tamanhos[tamanho]} ${estaAtivo ? ativo : inativo}`}
    >
      {icone}
      <span>{children}</span>
    </button>
  );
}

export default function Header() {
  const { logout, abilities, usuario } = useAuth(); // Usando abilities do novo contexto para segurança
  const { recarregarTudo } = useBootstrap();
  const navigate = useNavigate();

  // Controla se o menu do celular está aberto
  const [menuAberto, setMenuAberto] = useState(false);

  // Esc fecha o menu (só escuta o teclado enquanto o menu estiver aberto)
  useEffect(() => {
    if (!menuAberto) return;

    const fecharComEsc = (e) => {
      if (e.key === "Escape") setMenuAberto(false);
    };

    window.addEventListener("keydown", fecharComEsc);
    return () => window.removeEventListener("keydown", fecharComEsc);
  }, [menuAberto]);

  // Toda ação de navegação fecha o menu antes de ir para a tela.
  // No desktop o menu nunca está aberto, então isso não tem efeito.
  const irPara = (rota) => {
    setMenuAberto(false);
    navigate(rota);
  };

  const handleLogout = () => {
    setMenuAberto(false);
    logout();
    navigate("/login");
  };

  const handleInicio = () => {
    recarregarTudo();
    irPara("/inicial");
  };

  // O painel aparece para quem pode publicar (publicador) e também para
  // o psicólogo ainda em análise, que vê lá o aviso do status do cadastro.
  const eProfissional =
    abilities.includes("publicador") || usuario?.tipo === "psicologo";

  // Só admin vê o painel de verificação de psicólogos
  const eAdmin = abilities.includes("admin");

  /*
  Lista ÚNICA de itens do menu. Ela é usada tanto na barra do desktop quanto
  no menu do celular, então qualquer botão novo só precisa ser adicionado aqui.
  */
  const itens = [
    {
      chave: "inicio",
      rotulo: "Início",
      Icone: Home,
      // também acende nas telas de conteúdo alcançadas a partir do Início
      ativoQuando: [
        "/inicial",
        "/videos",
        "/artigos",
        "/sugestoes",
        "/autoajuda",
      ],
      acao: handleInicio,
    },
    // MEU PAINEL (profissionais — inclui psicólogo em análise)
    ...(eProfissional
      ? [
          {
            chave: "painel",
            rotulo: "Meu Painel",
            Icone: LayoutDashboard,
            ativoQuando: ["/dashboard"],
            acao: () => irPara("/dashboard"),
          },
        ]
      : []),
    // ADMIN — verificação de psicólogos (apenas admin)
    ...(eAdmin
      ? [
          {
            chave: "admin",
            rotulo: "Admin",
            Icone: ShieldCheck,
            ativoQuando: ["/admin"],
            acao: () => irPara("/admin/psicologos"),
          },
        ]
      : []),
    {
      chave: "anotacoes",
      rotulo: "Anotações",
      Icone: BookOpen,
      ativoQuando: ["/anotacoes"],
      acao: () => irPara("/anotacoes"),
    },
    {
      chave: "favoritos",
      rotulo: "Favoritos",
      Icone: Heart,
      ativoQuando: ["/favoritos"],
      acao: () => irPara("/favoritos"),
    },
    {
      chave: "perfil",
      rotulo: "Perfil",
      Icone: User,
      ativoQuando: ["/perfil"],
      acao: () => irPara("/perfil"),
    },
  ];

  // SAIR — não é uma aba, por isso não usa o foco de navegação
  const classeSair =
    "bg-[#7a00c1] rounded-lg shadow-md hover:bg-red-700 hover:text-white " +
    "transition flex items-center gap-2 font-semibold text-sm";

  return (
    <header className="bg-[#3a0b6d] shadow-lg relative">
      {/* Barra principal: logo + (menu desktop OU botão hambúrguer) */}
      <div className="flex justify-between items-center px-4 sm:px-8 py-4">
        <div className="text-2xl font-bold text-[#ff7300] tracking-wide">
          MindUp
        </div>

        {/* MENU DESKTOP — visível a partir de 1024px (lg) */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center gap-4"
        >
          {itens.map(({ chave, rotulo, Icone, ativoQuando, acao }) => (
            <NavBtn
              key={chave}
              ativoQuando={ativoQuando}
              onClick={acao}
              icone={<Icone size={18} className="text-[#ff7300]" />}
            >
              {rotulo}
            </NavBtn>
          ))}

          <button
            onClick={handleLogout}
            className={`${classeSair} ${tamanhos.normal}`}
          >
            <LogOut size={18} className="text-[#ff7300] hover:text-white" />
            <span>Sair</span>
          </button>
        </nav>

        {/* BOTÃO HAMBÚRGUER — só aparece abaixo de 1024px */}
        <button
          type="button"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
          className="lg:hidden bg-[#7a00c1] p-2 rounded-lg shadow-md hover:bg-[#8c00db] transition
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]"
        >
          {menuAberto ? (
            <X size={24} className="text-[#ff7300]" />
          ) : (
            <Menu size={24} className="text-[#ff7300]" />
          )}
        </button>
      </div>

      {/* MENU DO CELULAR — painel em lista vertical, abaixo da barra */}
      {menuAberto && (
        <nav
          id="menu-mobile"
          aria-label="Navegação principal"
          className="lg:hidden flex flex-col gap-3 px-4 sm:px-8 pt-4 pb-5 border-t border-white/10"
        >
          {itens.map(({ chave, rotulo, Icone, ativoQuando, acao }) => (
            <NavBtn
              key={chave}
              tamanho="bloco"
              ativoQuando={ativoQuando}
              onClick={acao}
              icone={<Icone size={18} className="text-[#ff7300]" />}
            >
              {rotulo}
            </NavBtn>
          ))}

          <button
            onClick={handleLogout}
            className={`${classeSair} ${tamanhos.bloco}`}
          >
            <LogOut size={18} className="text-[#ff7300] hover:text-white" />
            <span>Sair</span>
          </button>
        </nav>
      )}
    </header>
  );
}
