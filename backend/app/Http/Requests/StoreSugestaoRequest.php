<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSugestaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'tipo' => 'sometimes|required|in:livro,filme,serie,anime,musica,podcast,documentario',

            'titulo' => 'required|string|max:150',

            'descricao' => 'nullable|string|max:5000',

            'link' => 'sometimes|nullable|url|max:255',

            'capa' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',

            'categorias' => 'nullable|array|max:5',

            'categorias.*' => 'exists:categorias,id',
        ];
    }
}
