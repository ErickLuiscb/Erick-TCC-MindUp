<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminPsicologoResource;
use App\Mail\ResultadoVerificacaoMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * Painel do admin: análise e gestão de psicólogos.
 * Todas as rotas daqui exigem a ability `admin` (ver routes/api.php).
 */
class AdminPsicologoApiController extends Controller
{
    private const STATUS = ['pendente', 'aprovado', 'rejeitado'];

    /*
    Transições que o admin pode fazer (o admin nunca devolve para "pendente"):
      pendente  -> aprovado   (aprovar)
      pendente  -> rejeitado  (rejeitar)
      aprovado  -> rejeitado  (revogar)
      rejeitado -> aprovado   (reativar)
    */
    private const TRANSICOES = [
        'pendente' => ['aprovado', 'rejeitado'],
        'aprovado' => ['rejeitado'],
        'rejeitado' => ['aprovado'],
    ];

    /**
     * LISTAR PSICÓLOGOS (filtro por status e busca opcional)
     * GET /admin/psicologos?status=pendente&busca=maria
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pendente,aprovado,rejeitado',
            'busca' => 'nullable|string|max:100',
        ]);

        $query = User::where('tipo', 'psicologo');

        if ($request->filled('status')) {
            $query->where('crp_status', $request->status);
        }

        if ($request->filled('busca')) {
            $termo = '%' . mb_strtolower($request->busca) . '%';

            $query->where(function ($q) use ($termo) {
                $q->whereRaw('LOWER(nome) LIKE ?', [$termo])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$termo])
                    ->orWhere('crp', 'like', $termo);
            });
        }

        // Fila de pedidos: o mais antigo primeiro. Demais listas: por nome.
        if ($request->status === 'pendente') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('nome', 'asc');
        }

        // Contagem por status (independe dos filtros) para os contadores das abas
        $porStatus = User::where('tipo', 'psicologo')
            ->selectRaw('crp_status, COUNT(*) as total')
            ->groupBy('crp_status')
            ->pluck('total', 'crp_status');

        $contagens = collect(self::STATUS)
            ->mapWithKeys(fn ($status) => [$status => (int) ($porStatus[$status] ?? 0)]);

        return response()->json([
            'data' => AdminPsicologoResource::collection($query->get()),
            'contagens' => $contagens,
        ]);
    }

    /**
     * APROVAR / REJEITAR / REVOGAR / REATIVAR
     * PATCH /admin/psicologos/{user}/status
     * Body: { "status": "aprovado" | "rejeitado", "motivo": "..." }
     */
    public function atualizarStatus(Request $request, User $user)
    {
        $dados = $request->validate([
            'status' => 'required|in:aprovado,rejeitado',
            'motivo' => 'required_if:status,rejeitado|nullable|string|max:500',
        ], [
            'status.required' => 'Informe o novo status.',
            'status.in' => 'Status inválido. Use aprovado ou rejeitado.',
            'motivo.required_if' => 'Informe o motivo da rejeição ou revogação.',
            'motivo.max' => 'O motivo deve ter no máximo 500 caracteres.',
        ]);

        // Evita o admin se trancar para fora (os tokens dele seriam apagados)
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Você não pode alterar o seu próprio status.',
            ], 403);
        }

        if ($user->tipo !== 'psicologo') {
            return response()->json([
                'message' => 'Este usuário não é psicólogo.',
            ], 422);
        }

        // Status nulo (não deveria existir) é tratado como pendente
        $atual = $user->crp_status ?? 'pendente';
        $novo = $dados['status'];

        if (!in_array($novo, self::TRANSICOES[$atual] ?? [], true)) {
            return response()->json([
                'message' => "Não é possível mudar o status de \"{$atual}\" para \"{$novo}\".",
            ], 422);
        }

        DB::transaction(function () use ($request, $user, $novo, $dados) {
            $user->forceFill([
                'crp_status' => $novo,
                'crp_motivo' => $novo === 'rejeitado' ? trim($dados['motivo']) : null,
                'crp_analisado_por' => $request->user()->id,
                'crp_analisado_em' => now(),

                // A decisão encerra a finalidade do CPF: apagamos.
                'cpf' => null,
            ])->save();

            /*
            As abilities ficam "congeladas" no token (definidas no login).
            Apagar os tokens força novo login, e só assim a permissão
            de publicar é concedida (aprovação) ou retirada (rejeição/revogação).
            */
            $user->tokens()->delete();
        });

        $decisao = match (true) {
            $atual === 'pendente' && $novo === 'aprovado' => 'aprovado',
            $atual === 'pendente' && $novo === 'rejeitado' => 'rejeitado',
            $atual === 'aprovado' => 'revogado',
            default => 'reativado',
        };

        $mensagem = [
            'aprovado' => 'Psicólogo aprovado.',
            'rejeitado' => 'Solicitação rejeitada.',
            'revogado' => 'Permissão de publicação revogada.',
            'reativado' => 'Permissão de publicação reativada.',
        ][$decisao];

        return response()->json([
            'message' => $mensagem,
            // false => a decisão foi gravada, mas o e-mail de aviso falhou
            'email_enviado' => $this->avisarPorEmail($user, $decisao),
            'data' => new AdminPsicologoResource($user->fresh()),
        ]);
    }

    /**
     * Avisa o psicólogo por e-mail (Brevo). Roda DEPOIS de a decisão estar
     * gravada: se o envio falhar, a decisão continua valendo — o admin só
     * é avisado de que o e-mail não saiu.
     */
    private function avisarPorEmail(User $user, string $decisao): bool
    {
        try {
            $urlLogin = rtrim(config('app.frontend_url'), '/') . '/login';

            Mail::to($user->email)->send(
                new ResultadoVerificacaoMail(
                    $user->nome,
                    $decisao,
                    $user->crp_motivo,
                    $urlLogin
                )
            );

            return true;
        } catch (\Throwable $e) {
            report($e);

            return false;
        }
    }
}
