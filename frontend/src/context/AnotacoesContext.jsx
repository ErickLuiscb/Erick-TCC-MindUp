import { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";
import { useAuth } from "./AuthContext";

const AnotacoesContext = createContext();

export function AnotacoesProvider({ children }) {
  const { autenticado } = useAuth();

  const [anotacoes, setAnotacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // ======================
  // LISTAR
  // ======================
  const carregarAnotacoes = async () => {
    try {
      const resp = await api.get("/anotacoesapi");
     setAnotacoes(resp.data.data ?? []);
    } catch (error) {
      console.error("Erro ao carregar anotações:", error);
    } finally {
      setCarregando(false);
    }
  };

  // ======================
  // CRIAR
  // ======================
  async function criarAnotacao({ titulo, texto }) {
  const resp = await api.post("/anotacoesapi", { titulo, texto });

  // Laravel Resource → resp.data.data
  setAnotacoes((prev) => [...prev, resp.data.data]);
}


  // ======================
  // EDITAR
  // ======================
  const editarAnotacao = async (id, dados) => {
    const resp = await api.put(`/anotacoesapi/${id}`, dados);
    setAnotacoes((prev) =>
      prev.map((a) => (a.id === id ? resp.data : a))
    );
  };

  // ======================
  // DELETAR
  // ======================
  const deletarAnotacao = async (id) => {
    await api.delete(`/anotacoesapi/${id}`);
    setAnotacoes((prev) => prev.filter((a) => a.id !== id));
  };

  // ======================
  // BUSCAR LOCAL
  // ======================
  const buscarAnotacaoPorId = (id) =>
    anotacoes.find((a) => a.id == id);

  // ======================
  // CARREGAR AO LOGAR
  // ======================
  useEffect(() => {
    if (autenticado) {
      carregarAnotacoes();
    }
  }, [autenticado]);

  return (
    <AnotacoesContext.Provider
      value={{
        anotacoes,
        carregando,
        criarAnotacao,
        editarAnotacao,
        deletarAnotacao,
        buscarAnotacaoPorId,
      }}
    >
      {children}
    </AnotacoesContext.Provider>
  );
}

export function useAnotacoes() {
  return useContext(AnotacoesContext);
}
