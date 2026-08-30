import { createContext, useContext, useState } from "react";
import api from "../service/api";

const FavoritosContext = createContext();

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // ==========================================
  // CARREGAR (usado pelo BootstrapContext no login, e também
  // sempre que a tela de Favoritos é visitada, pra garantir que
  // a lista está atualizada mesmo se algo mudou em outra tela)
  // ==========================================
  const carregarFavoritos = async () => {
    try {
      setCarregando(true);
      const resp = await api.get("/favoritos");
      setFavoritos(resp.data.data ?? resp.data ?? []);
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // ALTERNAR FAVORITO DIRETO DA TELA DE FAVORITOS
  // (aqui é sempre "desfavoritar", já que só aparecem itens
  // já favoritados nessa lista — mas a rota é a mesma de toggle)
  // ==========================================
  const alternarFavorito = async (tipo, conteudoId) => {
    // Remoção mais otimista: some da lista imediatamente
    const favoritosAnteriores = favoritos;
    setFavoritos((prev) =>
      prev.filter((f) => !(f.tipo === tipo && f.conteudo?.id === conteudoId)),
    );

    try {
      await api.post("/favoritos", { tipo, favoritavel_id: conteudoId });
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
      // Reverte em caso de falha de rede
      setFavoritos(favoritosAnteriores);
    }
  };

  return (
    <FavoritosContext.Provider
      value={{
        favoritos,
        carregando,
        setFavoritos,
        setCarregando,
        carregarFavoritos,
        alternarFavorito,
      }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  return useContext(FavoritosContext);
}
