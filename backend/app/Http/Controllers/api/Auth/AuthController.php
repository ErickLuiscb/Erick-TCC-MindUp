<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'senha' => 'required|string'
        ]);

        // Busca usuário
        $user = User::where('email', $request->email)->first();

        // Verifica email ou senha
        if (!$user || !Hash::check($request->senha, $user->senha)) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }

        // Determina abilities baseado no tipo
        $abilities = match($user->tipo) {
            'psicologo' => ['admin', 'publicador', 'premium'],
            'usuario'   => ['premium'],
            default     => [],
        };

        // Criar token
        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'message'   => 'Login realizado',
            'token'     => $token,
            'abilities' => $abilities,
            'user'      => [
                'id'    => $user->id,
                'nome'  => $user->nome,
                'email' => $user->email,
                'tipo'  => $user->tipo,
                'crp'   => $user->crp,
                'imagem_perfil' => url('storage/' . $user->imagem_perfil),
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout realizado']);
    }

    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Todos os tokens foram revogados']);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nome'  => 'required|string|max:100',
            'email' => 'required|email|unique:usuarios,email',
            'senha' => 'required|string|min:6',
            'tipo'  => 'sometimes|string|in:usuario,psicologo',
            'crp'   => 'sometimes|string|max:20',
            'imagem_perfil' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048'
        ]);

        $data = [
            'nome'      => $request->nome,
            'email'     => $request->email,
            'senha'     => Hash::make($request->senha),
            'tipo'      => $request->tipo ?? 'usuario',
            'criado_em' => now(),
        ];

        // Se tem CRP → psicólogo
        if ($request->filled('crp')) {
            $data['crp'] = $request->crp;
            $data['tipo'] = 'psicologo';
        }

        // Upload de imagem
        if ($request->hasFile('imagem_perfil')) {
            $file = $request->file('imagem_perfil');
            $nome = uniqid('perfil_', true) . '.' . $file->getClientOriginalExtension();
            $file->move(storage_path('app/public/perfil'), $nome);
            $data['imagem_perfil'] = 'perfil/' . $nome;
        }

        $user = User::create($data);

        return response()->json([
            'message' => 'Usuário registrado com sucesso',
            'user' => [
                'id'    => $user->id,
                'nome'  => $user->nome,
                'email' => $user->email,
                'tipo'  => $user->tipo,
                'crp'   => $user->crp,
                'imagem_perfil' => $user->imagem_perfil,
            ]
        ], 201);
    }

    public function me(Request $request)
{
    return new UserResource($request->user());
}
}
