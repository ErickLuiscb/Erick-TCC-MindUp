import { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";
import { useAuth } from "./AuthContext";

const SugestoesContext = createContext();

export function SugestoesProvider({ children }) {
  const { autenticado, carregando: carregandoAuth } = useAuth();

  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // ==========================================
  // LISTAR SUGESTÕES (Rota oficial: /api/sugestoes)
  // ==========================================
  const carregarSugestoes = async () => {
    try {
      setCarregando(true);
      const resp = await api.get("/sugestoes");
      setSugestoes(resp.data.data ?? resp.data ?? []);
    } catch (err) {
      console.error("Erro ao carregar sugestões:", err);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // LÓGICA DE FAVORITAR / DESFAVORITAR SUGESTÃO (Instantânea via Polimorfismo)
  // ==========================================
  const alternarFavoritoSugestao = async (sugestaoId) => {
    const alvo = sugestoes.find((s) => s.id === sugestaoId);
    if (!alvo) return;

    const statusOriginal = alvo.favoritado;
    const contagemOriginal = alvo.quantidade_favoritos || 0;
    setSugestoes((prev) =>
      prev.map((s) =>
        s.id === sugestaoId
          ? {
              ...s,
              favoritado: !statusOriginal,
              quantidade_favoritos: statusOriginal
                ? contagemOriginal - 1
                : contagemOriginal + 1,
            }
          : s,
      ),
    );

    try {
      await api.post("/favoritos", {
        tipo: "sugestao",
        favoritavel_id: sugestaoId,
      });
    } catch (err) {
      console.error("Erro ao alternar favorito da sugestão:", err);
      // Rollback automático caso a rede falhe
      setSugestoes((prev) =>
        prev.map((s) =>
          s.id === sugestaoId
            ? {
                ...s,
                favoritado: statusOriginal,
                quantidade_favoritos: contagemOriginal,
              }
            : s,
        ),
      );
    }
  };

  // ==========================================
  // BUSCAR LOCAL POR ID
  // ==========================================
  const buscarSugestaoPorId = (id) => sugestoes.find((s) => s.id == id);

  // ==========================================
  // LIMPEZA AO DESLOGAR
  // (o carregamento inicial agora é feito pelo BootstrapContext,
  // que preenche este context via setSugestoes)
  // ==========================================
  useEffect(() => {
    if (!carregandoAuth && !autenticado) {
      setSugestoes([]);
    }
  }, [autenticado, carregandoAuth]);

  return (
    <SugestoesContext.Provider
      value={{
        sugestoes,
        carregando,
        setSugestoes,
        setCarregando,
        carregarSugestoes,
        buscarSugestaoPorId,
        alternarFavoritoSugestao,
      }}
    >
      {children}
    </SugestoesContext.Provider>
  );
}

export function useSugestoes() {
  return useContext(SugestoesContext);
}
