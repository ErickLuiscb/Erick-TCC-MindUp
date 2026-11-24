<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Concerns\ResumoDeFavoritos;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Resources\Json\JsonResource;

class AutoajudaResource extends JsonResource
{
    use ResumoDeFavoritos;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'titulo' => $this->titulo,

            'descricao' => $this->descricao,

            'tipo_midia' => $this->tipo_midia,

            'midia' => $this->midia
                ? Storage::disk(config('filesystems.default'))->url($this->midia)
                : null,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'favoritado' => $this->favoritadoPeloUsuario(),
            'quantidade_favoritos' => $this->totalDeFavoritos(),

            'autor' => $this->whenLoaded('autor', fn () => new AutorResource($this->autor)),

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
