import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function RotaProtegida() {
  const { autenticado, carregando } = useAuth();

  // ainda carregando do localStorage → evita redirecionar errado
  if (carregando) {
    return (
      <div className="text-white text-center mt-10 text-xl">Carregando...</div>
    );
  }

  // se não estiver logado → manda para login
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // se estiver logado → libera rotas internas
  return <Outlet />;
}
