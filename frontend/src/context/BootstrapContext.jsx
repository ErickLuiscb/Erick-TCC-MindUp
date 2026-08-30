import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../service/api";
import { useAuth } from "./AuthContext";
import { useVideos } from "./VideosContext";
import { useArtigos } from "./ArtigosContext";
import { useSugestoes } from "./SugestoesContext";
import { useAutoajuda } from "./AutoajudaContext";
import { useFavoritos } from "./FavoritosContext";

const BootstrapContext = createContext();

// Quantas tentativas extras fazer se a requisição falhar
// (cobre casos de backend "acordando" no Render logo após o login)
const TENTATIVAS_PADRAO = 2;

const COOLDOWN_MS = 8000;

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
  const { setFavoritos, setCarregando: setCarregandoFavoritos } =
    useFavoritos();

  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(false);

  // Refs (não causam re-render) para controlar concorrência
  const emAndamentoRef = useRef(false);
  const ultimaBuscaRef = useRef(0);

  const ligarLoadings = () => {
    setCarregandoVideos(true);
    setCarregandoArtigos(true);
    setCarregandoSugestoes(true);
    setCarregandoAutoajuda(true);
    setCarregandoFavoritos(true);
  };

  const desligarLoadings = () => {
    setCarregandoVideos(false);
    setCarregandoArtigos(false);
    setCarregandoSugestoes(false);
    setCarregandoAutoajuda(false);
    setCarregandoFavoritos(false);
  };

  // ==========================================
  // CARREGAMENTO ÚNICO DE TODOS OS DADOS INICIAIS
  // ==========================================
  const carregarTudo = async (
    tentativas = TENTATIVAS_PADRAO,
    forcar = false,
  ) => {
    // Já existe uma busca em andamento — ignora, em vez de empilhar outra
    if (emAndamentoRef.current) return;

    // Fora do primeiro carregamento (login), respeita um intervalo mínimo
    // entre atualizações manuais, pra não martelar o servidor gratuito
    const agora = Date.now();
    if (!forcar && agora - ultimaBuscaRef.current < COOLDOWN_MS) return;

    emAndamentoRef.current = true;
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
      ultimaBuscaRef.current = Date.now();
      desligarLoadings();
      emAndamentoRef.current = false;
    } catch (err) {
      console.error("Erro ao carregar dados iniciais (/bootstrap):", err);

      if (tentativas > 0) {
        // Mantém os "carregando" ligados durante a nova tentativa
        setTimeout(() => {
          emAndamentoRef.current = false;
          carregarTudo(tentativas - 1, true);
        }, 2000);
        return;
      }

      setErro(true);
      desligarLoadings();
      emAndamentoRef.current = false;
    }
  };

  // ==========================================
  // DISPARA NO LOGIN / LIMPA NO LOGOUT
  // ==========================================
  useEffect(() => {
    if (!carregandoAuth && autenticado) {
      carregarTudo(TENTATIVAS_PADRAO, true);
    } else if (!autenticado) {
      setPronto(false);
      setErro(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado, carregandoAuth]);

  return (
    <BootstrapContext.Provider
      value={{
        pronto,
        erro,
        // "recarregarTudo" chamado pelo usuário (ex.: botão Início ou
        // "Tentar novamente") passa forcar=false, respeitando o cooldown
        recarregarTudo: () => carregarTudo(TENTATIVAS_PADRAO, false),
      }}
    >
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap() {
  return useContext(BootstrapContext);
}
