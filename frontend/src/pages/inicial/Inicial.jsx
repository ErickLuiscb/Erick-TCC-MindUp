import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function Inicial() {
  const navigate = useNavigate();
  const { usuario, autenticado } = useAuth();
  const nome = usuario?.nome || "Visitante";

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
    <div className="flex flex-col items-center justify-center w-full animate-fadeIn pb-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide drop-shadow-md">
          Olá, {nome}! 💜
        </h1>
        <p className="text-purple-200 text-sm md:text-base mt-2 font-medium">
          Escolha uma das áreas abaixo para cuidar do seu bem-estar hoje.
        </p>
      </div>

      {/*Grid Responsivo Inteligente */}
      <main className="flex justify-center items-stretch flex-wrap gap-8 max-w-[1200px] w-full mx-auto">
        {/* VIDEOS */}
        <div
          onClick={() => handleNavigation("/videos", true)}
          className="cursor-pointer bg-[#7a00c1] rounded-2xl shadow-xl w-full sm:w-[260px] flex flex-col overflow-hidden
                     hover:scale-105 hover:outline-3 hover:outline-[#ffb300] 
                     transition duration-300 transform"
        >
          <img
            src="/videos.png"
            alt="Vídeos"
            className="w-full h-40 object-cover"
          />
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-[22px] font-black tracking-wide text-white mb-2">
                Vídeos
              </h2>
              <p className="text-xs leading-relaxed opacity-90 text-purple-100">
                Explore vídeos terapêuticos, motivacionais e educativos que
                ajudam a promover o bem-estar emocional e psicológico.
              </p>
            </div>
          </div>
        </div>

        {/* ARTIGOS */}
        <div
          onClick={() => handleNavigation("/artigos", true)}
          className="cursor-pointer bg-[#ff7300] rounded-2xl shadow-xl w-full sm:w-[260px] flex flex-col overflow-hidden
                     hover:scale-105 hover:outline-3 hover:outline-[#ffb300] 
                     transition duration-300 transform"
        >
          <img
            src="/artigos.png"
            alt="Artigos"
            className="w-full h-40 object-cover"
          />
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-[22px] font-black tracking-wide text-white mb-2">
                Artigos
              </h2>
              <p className="text-xs leading-relaxed opacity-90 text-orange-50">
                Leia artigos escritos por profissionais da saúde mental com
                dicas, informações e orientações sobre equilíbrio emocional.
              </p>
            </div>
          </div>
        </div>

        {/* SUGESTÕES */}
        <div
          onClick={() => handleNavigation("/sugestoes", true)}
          className="cursor-pointer bg-[#13b5a2] rounded-2xl shadow-xl w-full sm:w-[260px] flex flex-col overflow-hidden
                     hover:scale-105 hover:outline-3 hover:outline-[#ffb300] 
                     transition duration-300 transform"
        >
          <img
            src="/sugestoes.png"
            alt="Sugestões"
            className="w-full h-40 object-cover"
          />
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-[22px] font-black tracking-wide text-white mb-2">
                Sugestões
              </h2>
              <p className="text-xs leading-relaxed opacity-90 text-teal-50">
                Descubra livros, músicas e filmes cuidadosamente selecionados
                para te inspirar, relaxar e refletir sobre si mesmo.
              </p>
            </div>
          </div>
        </div>

        {/* AUTOAJUDA */}
        <div
          onClick={() => handleNavigation("/autoajuda", true)}
          className="cursor-pointer bg-[#1599cd] rounded-2xl shadow-xl w-full sm:w-[260px] flex flex-col overflow-hidden
                     hover:scale-105 hover:outline-3 hover:outline-[#ffb300] 
                     transition duration-300 transform"
        >
          <img
            src="/autoajuda.png"
            alt="Autoajuda"
            className="w-full h-40 object-cover"
          />
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-[22px] font-black tracking-wide text-white mb-2">
                Autoajuda
              </h2>
              <p className="text-xs leading-relaxed opacity-90 text-sky-50">
                Acesse práticas de meditação, técnicas de respiração e rotinas
                saudáveis para fortalecer sua saúde mental e autocuidado.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
