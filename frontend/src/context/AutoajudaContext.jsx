import { createContext, useContext, useState } from "react";
import api from "../service/api";

const AutoajudaContext = createContext();

export function AutoajudaProvider({ children }) {
  const [autoajudas, setAutoajudas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // O carregamento inicial já é feito pelo BootstrapContext.
  const carregarAutoajudas = async () => {
    try {
      setCarregando(true);
      const resp = await api.get("/autoajudas");
      setAutoajudas(resp.data.data ?? resp.data ?? []);
    } catch (err) {
      console.error("Erro ao carregar autoajuda:", err);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // FAVORITAR / DESFAVORITAR (Instantâneo, mesmo padrão dos outros módulos)
  // ==========================================
  const alternarFavoritoAutoajuda = async (autoajudaId) => {
    const alvo = autoajudas.find((a) => a.id === autoajudaId);
    if (!alvo) return;

    const statusOriginal = alvo.favoritado;
    setAutoajudas((prev) =>
      prev.map((a) =>
        a.id === autoajudaId ? { ...a, favoritado: !statusOriginal } : a,
      ),
    );

    try {
      await api.post("/favoritos", {
        tipo: "autoajuda",
        favoritavel_id: autoajudaId,
      });
    } catch (err) {
      console.error("Erro ao alternar favorito de autoajuda:", err);
      setAutoajudas((prev) =>
        prev.map((a) =>
          a.id === autoajudaId ? { ...a, favoritado: statusOriginal } : a,
        ),
      );
    }
  };

  // ==========================================
  // BUSCAR LOCAL POR ID
  // ==========================================
  const buscarAutoajudaPorId = (id) => autoajudas.find((a) => a.id == id);

  return (
    <AutoajudaContext.Provider
      value={{
        autoajudas,
        carregando,
        setAutoajudas,
        setCarregando,
        carregarAutoajudas,
        buscarAutoajudaPorId,
        alternarFavoritoAutoajuda,
      }}
    >
      {children}
    </AutoajudaContext.Provider>
  );
}

export function useAutoajuda() {
  return useContext(AutoajudaContext);
}
