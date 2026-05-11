import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function RotaPsicologo() {
  const { autenticado, carregando, usuario } = useAuth();

  if (carregando) {
    return <p className="text-white text-center mt-10">Carregando...</p>;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (usuario?.tipo !== "psicologo" && !usuario?.is_admin) {
    return <Navigate to="/inicial" replace />;
  }

  return <Outlet />;
}
