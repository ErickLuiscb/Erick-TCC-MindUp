<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnotacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'texto' => $this->texto,
            'data_criacao' => $this->data_criacao,
            'usuario' => [
                'id' => $this->usuario->id ?? null,
                'nome' => $this->usuario->nome ?? null,
                'email' => $this->usuario->email ?? null,
            ],
        ];
    }
}
