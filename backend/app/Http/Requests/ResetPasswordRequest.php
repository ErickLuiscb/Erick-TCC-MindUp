<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'token' => 'required|string',
            'senha' => 'required|string|min:6|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'senha.confirmed' => 'A confirmação de senha não corresponde.',
            'senha.min' => 'A nova senha precisa ter pelo menos 6 caracteres.',
        ];
    }
}
