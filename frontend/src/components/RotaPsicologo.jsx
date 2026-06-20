import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function RotaPsicologo() {
  const { autenticado, carregando, abilities } = useAuth();

  if (carregando) {
    return <p className="text-white text-center mt-10">Carregando...</p>;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  const eProfissional =
    abilities.includes("publicador") || abilities.includes("admin");

  if (!eProfissional) {
    return <Navigate to="/inicial" replace />;
  }

  return <Outlet />;
}
