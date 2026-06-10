<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SugestaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'tipo' => $this->tipo,

            'titulo' => $this->titulo,

            'descricao' => $this->descricao,

            'link_externo' => $this->link_externo,

            'capa' => $this->capa
                ? url('storage/' . $this->capa)
                : null,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'favoritado' => auth('sanctum')->check()
                ? $this->favoritos->contains(
                'usuario_id',
              auth('sanctum')->id()
            )
             : false,

            'quantidade_favoritos' => $this->favoritos->count(),

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
