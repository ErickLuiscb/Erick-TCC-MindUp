<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // PARA SAIL: URL correta para storage
        $imagemUrl = null;
        if ($this->imagem_perfil) {
            // Sail precisa desta estrutura
            $imagemUrl = url('storage/' . $this->imagem_perfil);
        }

        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'email' => $this->email,
            'imagem_perfil' => $imagemUrl,
            'crp' => $this->crp,
            'tipo' => $this->tipo,
            'is_admin' => $this->is_admin ?? false,
            'role' => $this->role ?? 'user',
            'criado_em' => $this->criado_em,
        ];
    }
}
