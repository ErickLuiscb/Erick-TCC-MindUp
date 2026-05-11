import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function Inicial() {
  const navigate = useNavigate();
  const { usuario, autenticado, logout } = useAuth();
  const nome = usuario?.nome || "Visitante";

  const [menuAberto, setMenuAberto] = useState(false);

  const handleNavigation = (path, restrita = false) => {
    if (restrita && !autenticado) {
      navigate("/login", {
        state: { from: path, message: "Faça login para continuar." },
      });
      return;
    }
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center text-white px-8 py-16 w-full">

      {/* TOPO */}
      <header className="w-full max-w-[1200px] flex justify-between items-center mb-12">
        {/* Bem-vindo */}
        <h1 className="text-3xl font-bold">
          Bem-vindo, {nome}!
        </h1>
      </header>

      {/* CARDS */}
      <main className="flex justify-center flex-wrap gap-10 max-w-[1200px] mx-auto mt-8">

        {/* VIDEOS */}
        <div
          onClick={() => handleNavigation("/videos", true)}
          className="cursor-pointer bg-[#7a00c1] rounded-xl shadow-xl w-[260px]
                     hover:scale-105 hover:outline-2 hover:outline-orange-400 
                     transition duration-300"
        >
          <img src="/videos.png" className="w-full h-40 object-cover" />
          <div className="p-5">
            <h2 className="text-[22px] font-bold mb-2">Vídeos</h2>
            <p className="text-sm opacity-80">Explore vídeos...</p>
          </div>
        </div>

        {/* ARTIGOS */}
        <div
          onClick={() => handleNavigation("/artigos", true)}
          className="cursor-pointer bg-[#ff7300] rounded-xl shadow-xl w-[260px]
                     hover:scale-105 hover:outline-2 hover:outline-orange-400 
                     transition duration-300"
        >
          <img src="/artigos.png" className="w-full h-40 object-cover" />
          <div className="p-5">
            <h2 className="text-[22px] font-bold mb-2">Artigos</h2>
            <p className="text-sm opacity-80">Leia artigos...</p>
          </div>
        </div>

        {/* SUGESTÕES */}
        <div
          onClick={() => handleNavigation("/sugestoes", true)}
          className="cursor-pointer bg-[#13b5a2] rounded-xl shadow-xl w-[260px]
                     hover:scale-105 hover:outline-2 hover:outline-orange-400 
                     transition duration-300"
        >
          <img src="/sugestoes.png" className="w-full h-40 object-cover" />
          <div className="p-5">
            <h2 className="text-[22px] font-bold mb-2">Sugestões</h2>
            <p className="text-sm opacity-80">Descubra livros...</p>
          </div>
        </div>

        {/* AUTOAJUDA */}
        <div
          onClick={() => handleNavigation("/autoajuda", true)}
          className="cursor-pointer bg-[#1599cd] rounded-xl shadow-xl w-[260px]
                     hover:scale-105 hover:outline-2 hover:outline-orange-400 
                     transition duration-300"
        >
          <img src="/autoajuda.png" className="w-full h-40 object-cover" />
          <div className="p-5">
            <h2 className="text-[22px] font-bold mb-2">Autoajuda</h2>
            <p className="text-sm opacity-80">Pratique meditação...</p>
          </div>
        </div>

      </main>
    </div>
  );
}
