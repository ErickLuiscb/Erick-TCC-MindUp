<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
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
                'message' => 'Credenciais inválidas.'
            ], 401);
        }

        $abilities = [];

        if ($user->tipo === 'psicologo') {
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
    public function register(
        StoreUserRequest $request
    ) {
        $data = $request->validated();

        $data['senha'] = Hash::make(
            $data['senha']
        );

        $data['criado_em'] = now();

        /*
         Se possui CRP,
         considera psicólogo
        */
        if (!empty($data['crp'])) {
            $data['tipo'] = 'psicologo';
        }

        /*
         Upload imagem perfil
        */
        if ($request->hasFile('imagem_perfil')) {

            $nome = uniqid('perfil_', true) . '.' .
                $request->file('imagem_perfil')
                    ->getClientOriginalExtension();

            Storage::disk('public')->putFileAs(
                'perfil',
                $request->file('imagem_perfil'),
                $nome
            );

            $data['imagem_perfil'] =
                'perfil/' . $nome;
        }

        $user = User::create($data);

        return response()->json([
            'message' => 'Usuário registrado com sucesso.',
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
