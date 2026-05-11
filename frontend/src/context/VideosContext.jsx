// VideosContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";
import { useAuth } from "./AuthContext";

const VideosContext = createContext();

export function VideosProvider({ children }) {
  const { autenticado, carregando: carregandoAuth } = useAuth();

  const [videos, setVideos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregarVideos = async () => {
    try {
      setCarregando(true);
      const resp = await api.get("/videosapi");
      setVideos(resp.data.data ?? []);
    } catch (err) {
      console.error("Erro ao carregar vídeos:", err);
    } finally {
      setCarregando(false);
    }
  };

  const buscarVideoPorId = (id) =>
    videos.find((v) => v.id == id);

  useEffect(() => {
    if (!carregandoAuth && autenticado) {
      carregarVideos();
    }
  }, [autenticado, carregandoAuth]);

  return (
    <VideosContext.Provider
      value={{
        videos,
        carregando,
        carregarVideos,
        buscarVideoPorId, 
      }}
    >
      {children}
    </VideosContext.Provider>
  );
}

export function useVideos() {
  return useContext(VideosContext);
}
