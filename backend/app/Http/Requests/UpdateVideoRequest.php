<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'    => 'sometimes|required|string|max:100',
            'descricao' => 'sometimes|nullable|string',
            'arquivo'   => 'sometimes|file|mimes:mp4,mov,avi,wmv|max:51200',
        ];
    }
}
