<?php

namespace App\Http\Requests;

use App\Support\Humores;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAnotacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'sometimes|required|string|max:100',

            'texto' => 'sometimes|required|string',

            'humor' => Humores::regraValidacao(),
        ];
    }
}
