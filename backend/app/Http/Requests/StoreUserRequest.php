<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:100',
            'email' => 'required|email|unique:usuarios,email',
            'senha' => 'required|string|min:6',
            'tipo' => 'required|string|max:50',
            'imagem_perfil' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'crp' => 'nullable|string|max:20',
            'is_admin' => 'boolean',
            'role' => 'nullable|string|max:50',
        ];
    }
}
