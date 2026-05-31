<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFavoritoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            /*
            TIPO DO CONTEÚDO
            */

            'tipo' => 'required|in:video,artigo,sugestao,autoajuda',

            /*
            ID DO CONTEÚDO
            */

            'favoritavel_id' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [

            'tipo.required' => 'O tipo do conteúdo é obrigatório.',

            'tipo.in' => 'Tipo de conteúdo inválido.',

            'favoritavel_id.required' => 'O conteúdo é obrigatório.',

            'favoritavel_id.integer' => 'O ID do conteúdo deve ser numérico.',
        ];
    }
}
