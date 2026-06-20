// src/context/AuthContext.jsx - VERSÃO ATUALIZADA E ALINHADA COM O BACKEND
import api from "../service/api";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [abilities, setAbilities] = useState([]); // Nova linha: Armazena as permissões vindas do token do Sanctum
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");
    const abilitiesSalvas = localStorage.getItem("abilities");

    if (tokenSalvo && usuarioSalvo) {
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${tokenSalvo}`;
        setUsuario(JSON.parse(usuarioSalvo));
        setToken(tokenSalvo);
        setAbilities(abilitiesSalvas ? JSON.parse(abilitiesSalvas) : []);
        setAutenticado(true);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("abilities");
      }
    }

    // Valida token com backend
    if (tokenSalvo) {
      api
        .get("/me")
        .then((res) => {
          const userData = res.data.data || res.data;
          setUsuario(userData);
          localStorage.setItem("usuario", JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
  }, []);

  const login = async (email, senha) => {
    try {
      // 1. Faz login
      const res = await api.post("/login", { email, senha });
      // Captura o token, user e as abilities que configuramos no AuthController
      const { token, user, abilities: userAbilities } = res.data;

      if (!token) {
        throw new Error("Token não recebido");
      }

      // 2. Configura token globalmente
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 3. Se já tem user na resposta, usa ele
      if (user) {
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(user));
        localStorage.setItem("abilities", JSON.stringify(userAbilities || []));

        setUsuario(user);
        setToken(token);
        setAbilities(userAbilities || []);
        setAutenticado(true);

        return { sucesso: true };
      }

      // 4. Se não tem user, busca com /me
      const meRes = await api.get("/me");
      const userCompleto = meRes.data.data || meRes.data;

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(userCompleto));
      localStorage.setItem("abilities", JSON.stringify(userAbilities || []));

      setUsuario(userCompleto);
      setToken(token);
      setAbilities(userAbilities || []);
      setAutenticado(true);

      return { sucesso: true };
    } catch (err) {
      console.error("Erro login:", err.response?.data || err.message);
      return {
        sucesso: false,
        mensagem:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Credenciais inválidas",
      };
    }
  };

  // =========================
  // REGISTRO QUE FUNCIONOU
  // =========================
  const registrar = async (formData) => {
    try {
      const res = await api.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Se o seu registro no AuthController fizesse login automático (atualmente o seu retorna 201 com o UserResource)
      if (res.data.token) {
        const user = res.data.user || res.data;
        const token = res.data.token;
        const userAbilities = res.data.abilities || [];

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(user));
        localStorage.setItem("abilities", JSON.stringify(userAbilities));

        setUsuario(user);
        setToken(token);
        setAbilities(userAbilities);
        setAutenticado(true);
      }

      return { sucesso: true };
    } catch (err) {
      return {
        sucesso: false,
        mensagem:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao cadastrar",
      };
    }
  };

  // =========================
  // ATUALIZAR DADOS DO USUÁRIO (ALINHADO COM /api/usuarios/{id})
  // =========================
  const updateUser = async (formData) => {
    try {
      // Corrigido a rota de /users para /usuarios para bater com o Laravel
      const res = await api.post(`/usuarios/${usuario.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // O seu UserApiController retorna os dados dentro de res.data.data
      const atualizado = res.data.data || res.data.user;

      if (atualizado) {
        setUsuario(atualizado);
        localStorage.setItem("usuario", JSON.stringify(atualizado));
      }

      return { sucesso: true };
    } catch (err) {
      return {
        sucesso: false,
        mensagem:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao atualizar perfil",
      };
    }
  };

  // =========================
  // UPLOAD FOTO PERFIL (Unificado para a rota oficial)
  // =========================
  const uploadFotoPerfil = async (file) => {
    try {
      const fd = new FormData();
      fd.append("_method", "PUT"); // Method Spoofing obrigatório no Laravel para arquivos físicos via PUT/MULTIPART
      fd.append("imagem_perfil", file);

      // Aponta para a única rota oficial de atualização: /api/usuarios/{id}
      const res = await api.post(`/usuarios/${usuario.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const atualizado = res.data.data || res.data.user;

      if (atualizado) {
        setUsuario(atualizado);
        localStorage.setItem("usuario", JSON.stringify(atualizado));
      }

      return { sucesso: true };
    } catch (err) {
      return {
        sucesso: false,
        mensagem:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao enviar foto",
      };
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("abilities");
    delete api.defaults.headers.common["Authorization"];

    setUsuario(null);
    setToken(null);
    setAbilities([]);
    setAutenticado(false);

    try {
      await api.post("/logout");
    } catch (err) {
      console.log("Token já revogado ou expirado no servidor.");
    }
  };

  // =========================
  // DELETAR CONTA (Com o parâmetro do teste especial)
  // =========================
  const deleteAccount = async (manterConteudos = true) => {
    try {
      // Rota corrigida para /usuarios e injetando o parâmetro que o seu backend espera ler
      await api.delete(
        `/usuarios/${usuario.id}?manter_conteudos=${manterConteudos}`,
      );

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("abilities");
      delete api.defaults.headers.common["Authorization"];

      setUsuario(null);
      setToken(null);
      setAbilities([]);
      setAutenticado(false);

      return { sucesso: true };
    } catch (err) {
      return {
        sucesso: false,
        mensagem:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao excluir conta",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        abilities, // Compartilha o array de habilidades com o app para as travas de Rota do Psicólogo e Admin
        autenticado,
        carregando,
        login,
        registrar,
        updateUser,
        uploadFotoPerfil,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
