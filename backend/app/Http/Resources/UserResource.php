<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'nome' => $this->nome,

            'email' => $this->email,

            'imagem_perfil' => $this->imagem_perfil
                ? Storage::disk(config('filesystems.default'))->url($this->imagem_perfil)
                : null,

            'crp' => $this->crp,

            'tipo' => $this->tipo,

            'is_admin' => $this->is_admin,

            'role' => $this->role,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
