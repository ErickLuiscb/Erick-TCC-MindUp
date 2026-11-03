<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Autor (psicólogo) como aparece nos conteúdos: vídeos, artigos,
 * sugestões e autoajuda.
 *
 * Só expõe o que a tela precisa mostrar: nome, foto e CRP (que é um
 * registro profissional público). E-mail, CPF, status da verificação
 * e demais dados NÃO saem por aqui; para isso existe o UserResource,
 * usado apenas no perfil do próprio usuário e no painel do admin.
 * Dessa forma, impedindo que dados sensíveis de psicólogos sejam
 * expostos em conteúdos públicos.
 */
class AutorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'nome' => $this->nome,

            'imagem_perfil' => $this->imagem_perfil
                ? Storage::disk(config('filesystems.default'))->url($this->imagem_perfil)
                : null,

            // "07/12345" (região/número), mesmo formato do painel do admin.
            // Psicólogos antigos não têm região: mostra só o número.
            'crp' => $this->crp
                ? ($this->crp_regiao
                    ? str_pad((string) $this->crp_regiao, 2, '0', STR_PAD_LEFT) . '/' . $this->crp
                    : $this->crp)
                : null,
        ];
    }
}
