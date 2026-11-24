<?php

namespace App\Http\Resources\Concerns;

/**
 * Resume os favoritos de um conteúdo (Video, Artigo, Sugestao, Autoajuda)
 * sem obrigar o controller a carregar TODOS os favoritos de TODOS os usuários.
 *
 * Se o controller já trouxe os valores prontos do banco, usamos eles:
 *   - favoritos_count          -> withCount('favoritos')
 *   - favoritado_pelo_usuario  -> withExists(['favoritos as favoritado_pelo_usuario' => ...])
 *
 * Se não trouxe (ex.: /videos, /artigos... que ainda carregam a relação
 * inteira com with('favoritos')), cai no cálculo antigo. Assim nenhum
 * controller existente precisa ser alterado.
 */
trait ResumoDeFavoritos
{
    protected function favoritadoPeloUsuario(): bool
    {
        if (! auth('sanctum')->check()) {
            return false;
        }

        $atributos = $this->resource->getAttributes();

        if (array_key_exists('favoritado_pelo_usuario', $atributos)) {
            return (bool) $atributos['favoritado_pelo_usuario'];
        }

        return $this->favoritos->contains('usuario_id', auth('sanctum')->id());
    }

    protected function totalDeFavoritos(): int
    {
        $atributos = $this->resource->getAttributes();

        if (array_key_exists('favoritos_count', $atributos)) {
            return (int) $atributos['favoritos_count'];
        }

        return $this->favoritos->count();
    }
}
