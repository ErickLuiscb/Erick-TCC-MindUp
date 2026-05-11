<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'titulo'    => $this->titulo,
            'descricao' => $this->descricao,

            'arquivo' => $this->arquivo
                ? url('storage/' . $this->arquivo)
                : null,

            'data_criacao' => $this->data_criacao,

            'autor' => [
                'id'    => $this->autor->id ?? null,
                'nome'  => $this->autor->nome ?? null,
                'email' => $this->autor->email ?? null,
            ],
        ];
    }
}
