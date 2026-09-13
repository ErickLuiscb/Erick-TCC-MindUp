import { useSearchParams, useNavigate, Link } from "react-router";
import { CheckCircle2, XCircle } from "lucide-react";

export default function EmailVerificado() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const sucesso = status === "sucesso";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10 text-center">
        {sucesso ? (
          <>
            <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-purple-900 mb-2">
              E-mail confirmado!
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Sua conta foi ativada com sucesso. Agora você já pode fazer login
              e começar a usar o MindUp.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-purple-900 text-white py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition"
            >
              Ir para o login
            </button>
          </>
        ) : (
          <>
            <XCircle size={48} className="text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-purple-900 mb-2">
              Link inválido ou expirado
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Esse link de confirmação não é mais válido. Você pode pedir um
              novo e-mail de confirmação na tela de login.
            </p>
            <Link
              to="/login"
              className="block w-full bg-purple-900 text-white py-3 rounded-full font-bold shadow-md hover:bg-purple-950 transition"
            >
              Voltar para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
