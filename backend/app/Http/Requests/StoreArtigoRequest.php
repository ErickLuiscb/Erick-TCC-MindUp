<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArtigoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'titulo' => 'required|string|max:150',

            'descricao' => 'nullable|string|max:5000',

            'arquivo_pdf' => 'required|file|mimes:pdf|max:10240',

            'categorias' => 'nullable|array|max:5',

            'categorias.*' => 'exists:categorias,id',
        ];
    }
}
