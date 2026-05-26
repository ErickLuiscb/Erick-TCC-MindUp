<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserApiController extends Controller
{
    /**
     * LISTAR TODOS (admin)
     */
    public function index(Request $request)
    {
        if (!$request->user()->tokenCan('admin')) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        return response()->json([
            'data' => UserResource::collection(User::all())
        ]);
    }

    /**
     * VISUALIZAR PERFIL
     */
    public function show(Request $request, User $user)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $user->id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        return response()->json([
            'data' => new UserResource($user)
        ]);
    }

    /**
     * CRIAR USUÁRIO
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        $data['senha'] = Hash::make($data['senha']);

        if ($request->hasFile('imagem_perfil')) {
            $data['imagem_perfil'] = $this->salvarImagem(
                $request->file('imagem_perfil')
            );
        }

        $user = User::create($data);

        return response()->json([
            'message' => 'Usuário criado com sucesso.',
            'data' => new UserResource($user)
        ], 201);
    }

    /**
     * ATUALIZAR USUÁRIO
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $user->id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validated();

        // senha
        if (!empty($data['senha'])) {
            $data['senha'] = Hash::make($data['senha']);
        } else {
            unset($data['senha']);
        }

        // imagem
        if ($request->hasFile('imagem_perfil')) {

            if (
                $user->imagem_perfil &&
                Storage::disk('public')->exists($user->imagem_perfil)
            ) {
                Storage::disk('public')->delete($user->imagem_perfil);
            }

            $data['imagem_perfil'] = $this->salvarImagem(
                $request->file('imagem_perfil')
            );
        }

        $user->update($data);

        return response()->json([
            'message' => 'Usuário atualizado com sucesso.',
            'data' => new UserResource($user->fresh())
        ]);
    }

    /**
     * REMOVER USUÁRIO
     */
    public function destroy(Request $request, User $user)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $user->id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        if (
            $user->imagem_perfil &&
            Storage::disk('public')->exists($user->imagem_perfil)
        ) {
            Storage::disk('public')->delete($user->imagem_perfil);
        }

        $user->delete();

        return response()->json([
            'message' => 'Conta removida com sucesso.'
        ], 200);
    }

    /**
     * HELPER — salvar imagem
     */
    private function salvarImagem($file): string
    {
        $nome = uniqid('perfil_', true) . '.' .
            $file->getClientOriginalExtension();

        Storage::disk('public')->putFileAs(
            'perfil',
            $file,
            $nome
        );

        return "perfil/{$nome}";
    }
}
