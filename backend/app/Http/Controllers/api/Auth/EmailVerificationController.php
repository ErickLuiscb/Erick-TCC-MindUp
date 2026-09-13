<?php

namespace App\Http\Controllers\api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerificarEmailMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    /**
     * Gera a URL assinada de verificação e envia o e-mail.
     * Reaproveitado tanto no cadastro quanto no reenvio.
     */
    public static function enviarEmailVerificacao(User $user): void
    {
        $urlVerificacao = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->email),
            ]
        );

        Mail::to($user->email)->send(
            new VerificarEmailMail($user->nome, $user->tipo, $urlVerificacao)
        );
    }

    /**
     * PASSO 1 — Usuário clica no link do e-mail.
     * A rota já vem protegida pelo middleware "signed", que garante
     * que a URL não foi alterada e ainda está dentro da validade.
     */
    public function verify(Request $request, int $id, string $hash)
    {
        $user = User::find($id);

        $urlFrontend = rtrim(config('app.frontend_url'), '/');

        if (!$user || !hash_equals(sha1($user->email), $hash)) {
            return redirect("{$urlFrontend}/email-verificado?status=erro");
        }

        if (is_null($user->email_verified_at)) {
            $user->email_verified_at = now();
            $user->save();
        }

        return redirect("{$urlFrontend}/email-verificado?status=sucesso");
    }

    /**
     * PASSO 2 (opcional) — Reenviar o e-mail de verificação.
     * Rota pública: o usuário ainda não tem token (login bloqueado
     * até verificar), então identificamos só pelo e-mail informado.
     */
    public function reenviar(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $mensagemPadrao = [
            'message' => 'Se o e-mail informado estiver cadastrado e ainda não confirmado, reenviamos o link de verificação.',
        ];

        $user = User::where('email', $request->email)->first();

        if (!$user || !is_null($user->email_verified_at)) {
            // Mesma resposta genérica por segurança, evita confirmar
            // quais e-mails existem ou já estão verificados.
            return response()->json($mensagemPadrao);
        }

        self::enviarEmailVerificacao($user);

        return response()->json($mensagemPadrao);
    }
}
