<?php

namespace App\Models\Concerns;

/**
 * Para os conteúdos que podem ser favoritados (Video, Artigo, Sugestao, Autoajuda).
 *
 * A tabela "favoritos" é polimórfica (favoritavel_type + favoritavel_id), então o
 * banco não consegue apagar os favoritos em cascata. Sem isto, apagar um conteúdo
 * favoritado deixava um favorito "órfão" apontando para o nada.
 *
 * O Laravel chama automaticamente o método boot{NomeDoTrait} ao iniciar o model.
 *
 * Observação: este trait só é usado por models Eloquent. O "static::deleting"
 * vem do Model (trait HasEvents), mas o editor não sabe disso aqui dentro do
 * trait; a linha @method abaixo existe só para ele parar de marcar erro.
 *
 * @method static void deleting(\Closure|string|array $callback)
 */
trait ApagaFavoritosAoExcluir
{
    public static function bootApagaFavoritosAoExcluir(): void
    {
        static::deleting(function ($conteudo) {
            $conteudo->favoritos()->delete();
        });
    }
}
