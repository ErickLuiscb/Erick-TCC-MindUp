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
            'titulo'    => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'arquivo'   => 'required|file|mimes:mp4,mov,avi,wmv|max:51200',
        ];
    }
}
