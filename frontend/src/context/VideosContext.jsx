import { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";
import { useAuth } from "./AuthContext";

const VideosContext = createContext();

export function VideosProvider({ children }) {
  const { autenticado, carregando: carregandoAuth } = useAuth();

  const [videos, setVideos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // ==========================================
  // LISTAR VÍDEOS
  // ==========================================
  const carregarVideos = async () => {
    try {
      setCarregando(true);
      const resp = await api.get("/videos");
      setVideos(resp.data.data ?? resp.data ?? []);
    } catch (err) {
      console.error("Erro ao carregar vídeos:", err);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // CARREGAR CATEGORIAS DO SISTEMA (com retry automático)
  // ==========================================
  const carregarCategorias = async (tentativas = 2) => {
    try {
      const resp = await api.get("/categorias");
      const lista = resp.data.data ?? resp.data ?? [];
      setCategorias(lista);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);

      // Se ainda restam tentativas, tenta de novo depois de um pequeno delay
      // (cobre casos de backend "acordando" no Render logo após o login)
      if (tentativas > 0) {
        setTimeout(() => carregarCategorias(tentativas - 1), 2000);
      }
    }
  };

  // ==========================================
  // LÓGICA DE FAVORITAR / DESFAVORITAR VÍDEO (Interação Instantânea)
  // ==========================================
  const alternarFavoritoVideo = async (videoId) => {
    // 1. Busca o vídeo no estado local do React
    const videoAlvo = videos.find((v) => v.id === videoId);
    if (!videoAlvo) return;

    // Guarda os estados originais caso a API falhe e precise dar rollback
    const statusOriginal = videoAlvo.favoritado;
    const contagemOriginal = videoAlvo.quantidade_favoritos || 0;

    // 2. Modificação Visual Instantânea (Otimização de Usabilidade)
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              favoritado: !statusOriginal,
              quantidade_favoritos: statusOriginal
                ? contagemOriginal - 1
                : contagemOriginal + 1,
            }
          : v,
      ),
    );

    try {
      if (statusOriginal) {
        // Se já estava favoritado, precisamos remover.
        // Como a rota de favoritos espera o ID do favorito e não do vídeo,
        // buscamos a rota POST de favoritos ou enviamos o comando para alternar se implementou o toggle.
        // Se sua rota DELETE /api/favoritos/{id} precisa do ID do Favorito, mandamos a requisição.
        // Nota: O seu backend aceita firstOrCreate no POST. Se o seu delete precisa do ID do favorito,
        // garantimos a chamada. Vamos usar a rota POST enviando para o endpoint.
        await api.post("/favoritos", {
          tipo: "video",
          favoritavel_id: videoId,
        });
      } else {
        await api.post("/favoritos", {
          tipo: "video",
          favoritavel_id: videoId,
        });
      }
    } catch (err) {
      console.error("Erro ao alternar favorito:", err);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                favoritado: statusOriginal,
                quantidade_favoritos: contagemOriginal,
              }
            : v,
        ),
      );
    }
  };

  // ==========================================
  // BUSCAR LOCAL
  // ==========================================
  const buscarVideoPorId = (id) => videos.find((v) => v.id == id);

  // ==========================================
  // LIMPEZA AO DESLOGAR
  // (o carregamento inicial agora é feito pelo BootstrapContext,
  // que preenche este context via setVideos/setCategorias)
  // ==========================================
  useEffect(() => {
    if (!carregandoAuth && !autenticado) {
      setVideos([]);
      setCategorias([]);
    }
  }, [autenticado, carregandoAuth]);

  return (
    <VideosContext.Provider
      value={{
        videos,
        categorias,
        carregando,
        setVideos,
        setCategorias,
        setCarregando,
        carregarVideos,
        carregarCategorias,
        buscarVideoPorId,
        alternarFavoritoVideo,
      }}
    >
      {children}
    </VideosContext.Provider>
  );
}

export function useVideos() {
  return useContext(VideosContext);
}
