<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAutoajudaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'titulo' => 'sometimes|required|string|max:150',

            'descricao' => 'sometimes|nullable|string',

            'tipo_midia' => 'sometimes|required|in:video,audio,imagem,pdf',

            'link_externo' => 'sometimes|nullable|url|max:255',

            'midia' => 'sometimes|nullable|file|max:51200',

            'ativo' => 'sometimes|required|boolean',

            'categorias' => 'sometimes|array|max:5',

            'categorias.*' => 'exists:categorias,id',
        ];
    }
}
