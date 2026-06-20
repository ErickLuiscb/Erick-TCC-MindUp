import { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";
import { useAuth } from "./AuthContext";

const ArtigosContext = createContext();

export function ArtigosProvider({ children }) {
  const { autenticado, carregando: carregandoAuth } = useAuth();

  const [artigos, setArtigos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // ==========================================
  // LISTAR ARTIGOS (Rota oficial: /api/artigos)
  // ==========================================
  const carregarArtigos = async () => {
    try {
      setCarregando(true);
      const resp = await api.get("/artigos");
      setArtigos(resp.data.data ?? resp.data ?? []);
    } catch (err) {
      console.error("Erro ao carregar artigos:", err);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // LÓGICA DE FAVORITAR / DESFAVORITAR ARTIGO (Instantânea via Polimorfismo)
  // ==========================================
  const alternarFavoritoArtigo = async (artigoId) => {
    const artigoAlvo = artigos.find((a) => a.id === artigoId);
    if (!artigoAlvo) return;

    const statusOriginal = artigoAlvo.favoritado;
    const contagemOriginal = artigoAlvo.quantidade_favoritos || 0;
    setArtigos((prev) =>
      prev.map((a) =>
        a.id === artigoId
          ? {
              ...a,
              favoritado: !statusOriginal,
              quantidade_favoritos: statusOriginal
                ? contagemOriginal - 1
                : contagemOriginal + 1,
            }
          : a,
      ),
    );

    try {
      // Envia para o FirstOrCreate da tabela polimórica de favoritos no PostgreSQL
      await api.post("/favoritos", {
        tipo: "artigo",
        favoritavel_id: artigoId,
      });
    } catch (err) {
      console.error("Erro ao alternar favorito do artigo:", err);
      // Rollback automático caso a rede falhe
      setArtigos((prev) =>
        prev.map((a) =>
          a.id === artigoId
            ? {
                ...a,
                favoritado: statusOriginal,
                quantidade_favoritos: contagemOriginal,
              }
            : a,
        ),
      );
    }
  };

  // ==========================================
  // BUSCAR LOCAL POR ID
  // ==========================================
  const buscarArtigoPorId = (id) => artigos.find((a) => a.id == id);

  // ==========================================
  // TRIGGER AUTOMÁTICO DE SINCRO AO LOGAR
  // ==========================================
  useEffect(() => {
    if (!carregandoAuth && autenticado) {
      carregarArtigos();
    } else if (!autenticado) {
      setArtigos([]);
    }
  }, [autenticado, carregandoAuth]);

  return (
    <ArtigosContext.Provider
      value={{
        artigos,
        carregando,
        carregarArtigos,
        buscarArtigoPorId,
        alternarFavoritoArtigo,
      }}
    >
      {children}
    </ArtigosContext.Provider>
  );
}

export function useArtigos() {
  return useContext(ArtigosContext);
}
