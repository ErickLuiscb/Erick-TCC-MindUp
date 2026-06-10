<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArtigoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'titulo' => $this->titulo,

            'descricao' => $this->descricao,

            'arquivo_pdf' => $this->arquivo_pdf
                ? url('storage/' . $this->arquivo_pdf)
                : null,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'favoritado' => auth('sanctum')->check()
                ? $this->favoritos->contains(
                'usuario_id',
                auth('sanctum')->id()
            )
            : false,

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
