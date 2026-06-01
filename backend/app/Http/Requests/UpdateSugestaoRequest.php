<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSugestaoRequest extends FormRequest
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

            'tipo' => 'sometimes|required|in:livro,filme,serie,anime,musica,podcast,documentario',

            'link' => 'sometimes|nullable|url|max:255',

            'capa' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:4096',

            'categorias' => 'sometimes|array|max:5',

            'categorias.*' => 'exists:categorias,id',
        ];
    }
}
