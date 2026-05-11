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
    public function index(Request $request)
    {
        if (!$request->user()->tokenCan('admin')) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        return UserResource::collection(User::all());
    }

    public function show(Request $request, User $user)
    {
        if ($request->user()->id !== $user->id) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        return new UserResource($user);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['senha'] = Hash::make($data['senha']);

        if ($request->hasFile('imagem_perfil')) {
            $data['imagem_perfil'] = $this->salvarImagem($request->file('imagem_perfil'));
        }

        $user = User::create($data);

        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        if ($request->user()->id !== $user->id) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $data = $request->validated();

        if (!empty($data['senha'])) {
            $data['senha'] = Hash::make($data['senha']);
        }

        if ($request->hasFile('imagem_perfil')) {
            if ($user->imagem_perfil) {
                Storage::disk('public')->delete($user->imagem_perfil);
            }

            $data['imagem_perfil'] = $this->salvarImagem($request->file('imagem_perfil'));
        }

        $user->update($data);

        return response()->json([
            'user' => new UserResource($user->fresh())
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id !== $user->id) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        if ($user->imagem_perfil) {
            Storage::disk('public')->delete($user->imagem_perfil);
        }

        $user->delete();

        return response()->json(['message' => 'Conta removida']);
    }

    /**
     * Helper ÚNICO para upload público
     */
    private function salvarImagem($file): string
    {
        $nome = uniqid('perfil_', true) . '.' . $file->getClientOriginalExtension();

        Storage::disk('public')->putFileAs(
            'perfil',
            $file,
            $nome
        );

        return "perfil/{$nome}";
    }
}
