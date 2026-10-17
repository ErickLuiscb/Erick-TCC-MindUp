<?php

namespace App\Http\Controllers\api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * LOGIN
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'senha' => 'required|string'
        ]);

        $user = User::where(
            'email',
            $request->email
        )->first();

        if (
            !$user ||
            !Hash::check($request->senha, $user->senha)
        ) {
            return response()->json([
                'message' => 'E-mail ou senha incorretos.'
            ], 401);
        }

        if (is_null($user->email_verified_at)) {
            return response()->json([
                'message' => 'Você precisa confirmar seu e-mail antes de entrar. Verifique sua caixa de entrada (e o spam).',
                'email_nao_verificado' => true,
            ], 403);
        }

        $abilities = [];

        // Só psicólogo APROVADO publica. Qualquer outro status (inclusive
        // nulo) fica sem a ability — na dúvida, bloqueia.
        if ($user->tipo === 'psicologo' && $user->crp_status === 'aprovado') {
            $abilities[] = 'publicador';
        }

        if ($user->is_admin) {
            $abilities[] = 'admin';
        }

        $token = $user->createToken(
            'auth_token',
            $abilities
        )->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'token' => $token,
            'abilities' => $abilities,
            'user' => new UserResource($user)
        ]);
    }

    /**
     * LOGOUT
     */
    public function logout(Request $request)
    {
        if ($request->user()?->currentAccessToken()) {

            $request->user()
                ->currentAccessToken()
                ->delete();
        }

        return response()->json([
            'message' => 'Logout realizado com sucesso.'
        ]);
    }

    /**
     * LOGOUT DE TODOS OS DISPOSITIVOS
     */
    public function logoutAll(Request $request)
    {
        $request->user()
            ->tokens()
            ->delete();

        return response()->json([
            'message' => 'Todos os tokens foram revogados.'
        ]);
    }

    /**
     * REGISTRO
     */
    public function register(RegisterRequest $request)
{
    $data = $request->validated();

    $data['senha'] = Hash::make($data['senha']);

    /*
     Upload imagem perfil
    */
    if ($request->hasFile('imagem_perfil')) {
        // Salva o arquivo na pasta 'perfil' dentro do disco public de forma limpa
        $caminho = $request->file('imagem_perfil')->store('perfil', config('filesystems.default'));

        // Injeta o caminho correto diretamente no array que vai para o banco
        $data['imagem_perfil'] = $caminho;
    }

    $user = new User($data);

    // Psicólogo nasce pendente: só publica depois que o admin aprovar
    if ($user->tipo === 'psicologo') {
        $user->crp_status = 'pendente';
    }

    $user->save();

    EmailVerificationController::enviarEmailVerificacao($user);

    return response()->json([
        'message' => 'Cadastro realizado com sucesso. Enviamos um e-mail de confirmação — verifique sua caixa de entrada antes de fazer login.',
        'user' => new UserResource($user)
    ], 201);
}
    /**
     * USUÁRIO LOGADO
     */
    public function me(Request $request)
    {
        return new UserResource(
            $request->user()
        );
    }
}
