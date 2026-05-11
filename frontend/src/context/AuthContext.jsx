// src/context/AuthContext.jsx - VERSÃO QUE FUNCIONOU
import api from "../service/api";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (tokenSalvo && usuarioSalvo) {
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${tokenSalvo}`;
        setUsuario(JSON.parse(usuarioSalvo));
        setToken(tokenSalvo);
        setAutenticado(true);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    }

    // Valida token com backend
    if (tokenSalvo) {
      api.get("/me")
        .then((res) => {
          // Ajuste para res.data.data OU res.data
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
      const { token, user } = res.data;

      if (!token) {
        throw new Error("Token não recebido");
      }

      // 2. Configura token globalmente
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // 3. Se já tem user na resposta, usa ele
      if (user) {
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(user));
        
        setUsuario(user);
        setToken(token);
        setAutenticado(true);
        
        return { sucesso: true };
      }

      // 4. Se não tem user, busca com /me
      const meRes = await api.get("/me");
      const userCompleto = meRes.data.data || meRes.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(userCompleto));

      setUsuario(userCompleto);
      setToken(token);
      setAutenticado(true);

      return { sucesso: true };
    } catch (err) {
      console.error("Erro login:", err.response?.data || err.message);
      return {
        sucesso: false,
        mensagem: err.response?.data?.error || "Credenciais inválidas",
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

      // Se o registro já faz login automaticamente
      if (res.data.token) {
        const user = res.data.user || res.data;
        const token = res.data.token;
        
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(user));
        
        setUsuario(user);
        setToken(token);
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
  // ATUALIZAR DADOS DO USUÁRIO
  // =========================
 const updateUser = async (formData) => {
  try {
    const res = await api.post(`/users/${usuario.id}`, formData, );

   const atualizado = res.data.user;

if (atualizado?.imagem_perfil) {
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
  // UPLOAD FOTO PERFIL
  // =========================
  const uploadFotoPerfil = async (file) => {
    try {
      const fd = new FormData();
      fd.append("imagem_perfil", file);

      const res = await api.post(
        `/users/${usuario.id}/upload-foto`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Ajuste para diferentes estruturas de resposta
      const atualizado = res.data.user;

      setUsuario(atualizado);
      localStorage.setItem("usuario", JSON.stringify(atualizado));

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
    delete api.defaults.headers.common["Authorization"];

    setUsuario(null);
    setToken(null);
    setAutenticado(false);
  };

  // =========================
  // DELETAR CONTA
  // =========================
  const deleteAccount = async () => {
    try {
      await api.delete(`/users/${usuario.id}`);

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      delete api.defaults.headers.common["Authorization"];

      setUsuario(null);
      setToken(null);
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