<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateArtigoRequest extends FormRequest
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

            'arquivo_pdf' => 'sometimes|nullable|file|mimes:pdf|max:20480',

            'ativo' => 'sometimes|required|boolean',

            'categorias' => 'sometimes|array|max:5',

            'categorias.*' => 'exists:categorias,id',
        ];
    }
}
