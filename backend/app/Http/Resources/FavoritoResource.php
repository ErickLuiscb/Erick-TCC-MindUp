<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FavoritoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /*
        IDENTIFICA TIPO
        */

        $tipo = match ($this->favoritavel_type) {

            'App\Models\Video' => 'video',

            'App\Models\Artigo' => 'artigo',

            'App\Models\Sugestao' => 'sugestao',

            'App\Models\Autoajuda' => 'autoajuda',

            default => 'desconhecido',
        };

        return [

            'id' => $this->id,

            'data_criacao' => $this->data_criacao,

            /*
            TIPO DO CONTEÚDO
            */

            'tipo' => $tipo,

            /*
            CONTEÚDO FAVORITADO
            */

            'conteudo' => $this->favoritavel,
        ];
    }
}
