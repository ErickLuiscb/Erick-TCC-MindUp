<?php

namespace App\Http\Controllers\api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Mail\RedefinirSenhaMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Quantos minutos o token de redefinição continua válido.
     */
    private const MINUTOS_EXPIRACAO = 60;

    /**
     * PASSO 1 — Usuário pede a redefinição informando o e-mail.
     * Gera um token, salva (com hash) no banco e envia o e-mail.
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $usuario = User::where('email', $request->email)->first();

        /*
        Por segurança, sempre respondemos com a mesma mensagem de
        sucesso, exista ou não o e-mail cadastrado — assim ninguém
        consegue "descobrir" quais e-mails têm conta no sistema
        só testando esse formulário.
        */
        $mensagemPadrao = [
            'message' => 'Se o e-mail informado estiver cadastrado, você receberá um link de redefinição em instantes.',
        ];

        if (!$usuario) {
            return response()->json($mensagemPadrao);
        }

        // Gera um token aleatório e seguro
        $tokenBruto = Str::random(64);

        // Guarda só o hash do token no banco (nunca o valor real)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $usuario->email],
            [
                'token' => Hash::make($tokenBruto),
                'created_at' => now(),
            ]
        );

        // Monta o link que aponta para o FRONTEND (não para o Laravel)
        $urlFrontend = rtrim(config('app.frontend_url'), '/');
        $urlRedefinicao = "{$urlFrontend}/redefinir-senha?token={$tokenBruto}&email=" . urlencode($usuario->email);

        Mail::to($usuario->email)->send(
            new RedefinirSenhaMail($usuario->nome, $urlRedefinicao)
        );

        return response()->json($mensagemPadrao);
    }

    /**
     * PASSO 2 — Usuário chega pelo link do e-mail e envia a nova senha.
     * Valida o token e, se estiver certo e dentro do prazo, atualiza a senha.
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        $registro = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$registro) {
            return response()->json([
                'message' => 'Link de redefinição inválido ou já utilizado.',
            ], 422);
        }

        // Verifica se o token expirou
        $expirado = now()->diffInMinutes($registro->created_at) > self::MINUTOS_EXPIRACAO;

        if ($expirado) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'message' => 'Este link de redefinição expirou. Solicite um novo.',
            ], 422);
        }

        // Verifica se o token enviado bate com o hash salvo
        if (!Hash::check($request->token, $registro->token)) {
            return response()->json([
                'message' => 'Link de redefinição inválido ou já utilizado.',
            ], 422);
        }

        $usuario = User::where('email', $request->email)->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuário não encontrado.',
            ], 404);
        }

        $usuario->senha = Hash::make($request->senha);
        $usuario->save();

        // Invalida o token pra não poder ser reutilizado
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Por segurança, revoga todos os tokens de acesso (Sanctum) antigos
        $usuario->tokens()->delete();

        return response()->json([
            'message' => 'Senha redefinida com sucesso. Você já pode fazer login com a nova senha.',
        ]);
    }
}
