import { Outlet } from "react-router";
import Header from "./header";
import Footer from "./footer";
import { useBootstrap } from "../context/BootstrapContext";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Layout() {
  const { erro, recarregarTudo } = useBootstrap();

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-[#5b1aa0] to-[#a64bf4] text-white">
      <Header />

      {erro && (
        <div className="bg-red-900/90 border-b border-red-500 px-6 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="flex items-center gap-2 text-sm font-bold">
            <AlertTriangle size={16} className="shrink-0" />
            Não conseguimos carregar seus conteúdos agora. O servidor pode estar
            iniciando, tente novamente em instantes.
          </span>
          <button
            onClick={() => recarregarTudo()}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0"
          >
            <RotateCw size={12} />
            Tentar novamente
          </button>
        </div>
      )}

      <main className="flex-1 p-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
