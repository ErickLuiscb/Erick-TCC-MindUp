<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'titulo' => 'required|string|max:100',

            'descricao' => 'nullable|string|max:5000',

            'arquivo' => 'required|file|mimes:mp4,mov,avi,wmv,webm,mkv|max:51200',

            'ativo' => 'sometimes|required|boolean',

            'categorias' => 'nullable|array|max:5',

            'categorias.*' => 'exists:categorias,id',
        ];
    }
}
