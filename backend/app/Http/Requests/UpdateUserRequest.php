<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'nome' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:usuarios,email,' . ($user?->id),
            'senha' => 'sometimes|required|string|min:6',
            'tipo' => 'sometimes|string|in:usuario,psicologo',
            'imagem_perfil' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048',
            'crp' => 'nullable|string|max:20',
        ];
    }
}
