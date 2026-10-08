import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000, // 20 segundos (era 10s — curto demais para o plano gratuito do Render)
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Requisições com upload de arquivo (cadastro com foto, vídeos, artigos em
    // PDF, sugestões, autoajuda) podem demorar bem mais — o arquivo precisa
    // chegar ao Render e, de lá, ser reenviado ao Cloudinary antes da resposta
    // voltar. Damos mais tempo especificamente para essas.
    const ehUpload =
      config.data instanceof FormData ||
      config.headers["Content-Type"] === "multipart/form-data";

    if (ehUpload) {
      config.timeout = 120000; // 2 minutos para uploads (vídeos podem ser grandes)
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Um 401 vindo da própria tentativa de login significa "credenciais
    // inválidas", e não "sessão expirada". Nesse caso NÃO recarregamos a
    // página: a tela de Login precisa continuar montada para exibir a
    // mensagem de erro ao usuário.
    const ehTentativaDeLogin = error.config?.url?.includes("/login");

    if (error.response?.status === 401 && !ehTentativaDeLogin) {
      // Token expirado ou inválido
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    }

    // Marca especificamente erros de timeout, para as telas poderem
    // mostrar uma mensagem mais precisa ("pode ter sido salvo mesmo
    // assim") em vez de um erro genérico de falha.
    if (error.code === "ECONNABORTED" && error.message?.includes("timeout")) {
      error.foiTimeout = true;
    }

    return Promise.reject(error);
  },
);

export default api;
