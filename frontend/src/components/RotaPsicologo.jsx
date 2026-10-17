import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/*
REGRA DE NEGOCIO E DE ACESSO PARA ROTAS DE PSICOLOGO.

 Guarda das rotas de profissional.

 - Quem pode publicar (ability publicador/admin) passa sempre.
 - Psicólogo ainda NÃO aprovado (em análise ou rejeitado):
     * com `permitirNaoAprovado` (usado só no /dashboard) entra, para ver
       o aviso de status;
     * nas demais rotas é devolvido ao /dashboard.
 - Qualquer outra pessoa vai para o /inicial.

 A proteção de verdade é o backend (ability:admin,publicador nas rotas de
 publicação); isto aqui só evita telas quebradas.
*/
export default function RotaPsicologo({ permitirNaoAprovado = false }) {
  const { autenticado, carregando, abilities, usuario } = useAuth();

  if (carregando) {
    return <p className="text-white text-center mt-10">Carregando...</p>;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  const podePublicar =
    abilities.includes("publicador") || abilities.includes("admin");

  if (podePublicar) {
    return <Outlet />;
  }

  if (usuario?.tipo === "psicologo") {
    return permitirNaoAprovado ? (
      <Outlet />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  return <Navigate to="/inicial" replace />;
}
