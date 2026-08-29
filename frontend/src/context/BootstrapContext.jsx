//Este context foi criado com o proposito de no deploy do render, netlify, cloudnary e supabase
// de trazer todos os dados de uma vez só, para que o backend não fique acordando a cada requisição,
//  e sim apenas uma vez no login do usuário, dessa forma o usuario não terá que sempre dar uma F5 na pagina
// para que o conteudo que ele deseja ver seja entregue pra ele.

import { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";
import { useAuth } from "./AuthContext";
import { useVideos } from "./VideosContext";
import { useArtigos } from "./ArtigosContext";
import { useSugestoes } from "./SugestoesContext";
import { useAutoajuda } from "./AutoajudaContext";

const BootstrapContext = createContext();

// Quantas tentativas extras fazer se a requisição falhar
// (cobre casos de backend "acordando" no Render logo após o login)
const TENTATIVAS_PADRAO = 2;

export function BootstrapProvider({ children }) {
  const { autenticado, carregando: carregandoAuth } = useAuth();

  const {
    setVideos,
    setCategorias,
    setCarregando: setCarregandoVideos,
  } = useVideos();
  const { setArtigos, setCarregando: setCarregandoArtigos } = useArtigos();
  const { setSugestoes, setCarregando: setCarregandoSugestoes } =
    useSugestoes();
  const { setAutoajudas, setCarregando: setCarregandoAutoajuda } =
    useAutoajuda();

  // Favoritos ainda não tem um context próprio (é o próximo módulo do plano),
  // então continua guardado aqui até termos a tela pra ele.
  const [favoritos, setFavoritos] = useState([]);

  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(false);

  const ligarLoadings = () => {
    setCarregandoVideos(true);
    setCarregandoArtigos(true);
    setCarregandoSugestoes(true);
    setCarregandoAutoajuda(true);
  };

  const desligarLoadings = () => {
    setCarregandoVideos(false);
    setCarregandoArtigos(false);
    setCarregandoSugestoes(false);
    setCarregandoAutoajuda(false);
  };

  // ==========================================
  // CARREGAMENTO ÚNICO DE TODOS OS DADOS INICIAIS
  // ==========================================
  const carregarTudo = async (tentativas = TENTATIVAS_PADRAO) => {
    ligarLoadings();
    setErro(false);

    try {
      const resp = await api.get("/bootstrap");
      const dados = resp.data ?? {};

      setCategorias(dados.categorias ?? []);
      setVideos(dados.videos ?? []);
      setArtigos(dados.artigos ?? []);
      setSugestoes(dados.sugestoes ?? []);
      setAutoajudas(dados.autoajudas ?? []);
      setFavoritos(dados.favoritos ?? []);

      setPronto(true);
      desligarLoadings();
    } catch (err) {
      console.error("Erro ao carregar dados iniciais (/bootstrap):", err);

      if (tentativas > 0) {
        // Mantém os "carregando" ligados durante a nova tentativa
        setTimeout(() => carregarTudo(tentativas - 1), 2000);
        return;
      }

      setErro(true);
      desligarLoadings();
    }
  };

  // ==========================================
  // DISPARA NO LOGIN / LIMPA NO LOGOUT
  // ==========================================
  useEffect(() => {
    if (!carregandoAuth && autenticado) {
      carregarTudo();
    } else if (!autenticado) {
      setAutoajudas([]);
      setFavoritos([]);
      setPronto(false);
      setErro(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado, carregandoAuth]);

  return (
    <BootstrapContext.Provider
      value={{
        favoritos,
        setFavoritos,
        pronto,
        erro,
        recarregarTudo: carregarTudo,
      }}
    >
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap() {
  return useContext(BootstrapContext);
}
