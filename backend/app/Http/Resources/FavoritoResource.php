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

        /*
        ENVOLVE O CONTEÚDO NO RESOURCE CORRETO
        (garante URL de mídia via Storage::url() e o campo "favoritado",
        exatamente como quando o conteúdo é buscado direto de /videos,
        /artigos, /sugestoes ou /autoajudas)
        */

        $conteudo = match ($tipo) {

            'video' => new VideoResource($this->favoritavel),

            'artigo' => new ArtigoResource($this->favoritavel),

            'sugestao' => new SugestaoResource($this->favoritavel),

            'autoajuda' => new AutoajudaResource($this->favoritavel),

            default => $this->favoritavel,
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

            'conteudo' => $conteudo,
        ];
    }
}
