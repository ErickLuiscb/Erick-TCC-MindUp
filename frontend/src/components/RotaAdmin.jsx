import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

// Só administrador entra. A proteção de verdade é o backend
// (abilities:admin); aqui é só para não mostrar tela vazia/erro.
export default function RotaAdmin() {
  const { autenticado, carregando, abilities } = useAuth();

  if (carregando) {
    return <p className="text-white text-center mt-10">Carregando...</p>;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (!abilities.includes("admin")) {
    return <Navigate to="/inicial" replace />;
  }

  return <Outlet />;
}
