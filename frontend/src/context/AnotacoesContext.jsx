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
      setCarregando(true);
      const resp = await api.get("/anotacoes");
      // Mapeia de forma segura capturando a estrutura do JsonResource do Laravel
      setAnotacoes(resp.data.data ?? resp.data ?? []);
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
    try {
      const resp = await api.post("/anotacoes", { titulo, texto });
      const novaAnotacao = resp.data.data || resp.data;

      setAnotacoes((prev) => [...prev, novaAnotacao]);
      return { sucesso: true };
    } catch (error) {
      console.error("Erro ao criar anotação:", error);
      return {
        sucesso: false,
        mensagem: error.response?.data?.message || "Erro ao salvar anotação.",
      };
    }
  }

  // ======================
  // EDITAR
  // ======================
  const editarAnotacao = async (id, dados) => {
    try {
      const resp = await api.put(`/anotacoes/${id}`, dados);
      const anotacaoAtualizada = resp.data.data || resp.data;

      // Corrige o bug de mapeamento injetando o objeto extraído do Resource do Laravel
      setAnotacoes((prev) =>
        prev.map((a) => (a.id === id ? anotacaoAtualizada : a)),
      );
      return { sucesso: true };
    } catch (error) {
      console.error("Erro ao editar anotação:", error);
      return {
        sucesso: false,
        mensagem:
          error.response?.data?.message || "Erro ao atualizar anotação.",
      };
    }
  };

  // ======================
  // DELETAR
  // ======================
  const deletarAnotacao = async (id) => {
    try {
      await api.delete(`/anotacoes/${id}`);
      setAnotacoes((prev) => prev.filter((a) => a.id !== id));
      return { sucesso: true };
    } catch (error) {
      console.error("Erro ao deletar anotação:", error);
      return {
        sucesso: false,
        mensagem: error.response?.data?.message || "Erro ao excluir anotação.",
      };
    }
  };

  // ======================
  // BUSCAR LOCAL
  // ======================
  const buscarAnotacaoPorId = (id) => anotacoes.find((a) => a.id == id);

  // ======================
  // CARREGAR AO LOGAR
  // ======================
  useEffect(() => {
    if (autenticado) {
      carregarAnotacoes();
    } else {
      setAnotacoes([]);
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
        carregarAnotacoes,
      }}
    >
      {children}
    </AnotacoesContext.Provider>
  );
}

export function useAnotacoes() {
  return useContext(AnotacoesContext);
}
