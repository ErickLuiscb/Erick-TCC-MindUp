<?php

namespace App\Http\Resources;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Visão do psicólogo para o PAINEL DO ADMIN.
 *
 * É o único Resource que devolve o CPF — e só enquanto a solicitação
 * está pendente (a decisão do admin apaga o CPF). Nunca use este
 * Resource fora das rotas protegidas por `abilities:admin`.
 */
class AdminPsicologoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'nome' => $this->nome,

            'email' => $this->email,

            'email_verificado' => !is_null($this->email_verified_at),

            'imagem_perfil' => $this->imagem_perfil
                ? Storage::disk(config('filesystems.default'))->url($this->imagem_perfil)
                : null,

            'crp' => $this->crp,

            'crp_regiao' => $this->crp_regiao,

            // Só dígitos (o frontend formata). Nulo depois da decisão.
            'cpf' => $this->cpfLegivel(),

            'crp_status' => $this->crp_status,

            'crp_motivo' => $this->crp_motivo,

            'crp_analisado_por' => $this->crp_analisado_por,

            'crp_analisado_em' => $this->crp_analisado_em,

            'created_at' => $this->created_at,
        ];
    }

    /**
     * Se a APP_KEY mudou, o CPF guardado fica ilegível. Em vez de derrubar
     * a lista inteira com erro 500, devolve nulo para esse registro.
     */
    private function cpfLegivel(): ?string
    {
        try {
            return $this->cpf;
        } catch (DecryptException $e) {
            return null;
        }
    }
}
