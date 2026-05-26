<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'titulo' => $this->titulo,

            'descricao' => $this->descricao,

            'arquivo' => $this->arquivo
                ? url('storage/' . $this->arquivo)
                : null,

            'data_criacao' => $this->data_criacao,

            'autor' => $this->whenLoaded('autor', function () {
                return [
                    'id' => $this->autor->id,
                    'nome' => $this->autor->nome,
                    'email' => $this->autor->email,
                ];
            }),

            'categorias' => $this->whenLoaded('categorias', function () {
                return $this->categorias->map(function ($categoria) {
                    return [
                        'id' => $categoria->id,
                        'nome' => $categoria->nome,
                    ];
                });
            }),
        ];
    }
}
