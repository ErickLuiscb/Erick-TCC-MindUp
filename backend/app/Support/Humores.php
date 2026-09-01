<?php

namespace App\Support;

class Humores
{
    /**
     * Lista única de humores aceitos nas anotações.
     *
     * Para adicionar um novo humor no futuro, basta acrescentar uma
     * chave aqui — a validação do backend (StoreAnotacaoRequest /
     * UpdateAnotacaoRequest) usa essa lista automaticamente.
     *
     * Mantenha o array espelhado no frontend, em
     * src/utils/humores.js (mesmas chaves).
     */
    public const VALIDOS = [
        'feliz',
        'calmo',
        'neutro',
        'triste',
        'ansioso',
        'irritado',
        'cansado',
        'grato',
    ];

    public static function regraValidacao(): string
    {
        return 'nullable|in:' . implode(',', self::VALIDOS);
    }
}
