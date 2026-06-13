<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateAutoajudaRequest extends FormRequest
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
            'tipo_midia' => 'sometimes|required|in:imagem,video',
            'midia' => 'sometimes|required|file|max:51200',
            'ativo' => 'sometimes|required|boolean',
            'categorias' => 'sometimes|array|max:5',
            'categorias.*' => 'exists:categorias,id',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->any()) {
                return;
            }

            // Pega o modelo de autoajuda que está vindo pela rota atual
            $autoajuda = $this->route('autoajuda');

            // Se o usuário não enviou o tipo_midia novo, assume o tipo que já estava salvo no banco
            $tipoMidia = $this->input('tipo_midia', $autoajuda?->tipo_midia);
            $file = $this->file('midia');

            if ($file && $tipoMidia) {
                $extensao = strtolower($file->getClientOriginalExtension());
                $imagensPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
                $videosPermitidos = ['mp4', 'mov', 'avi', 'wmv', 'webm', 'mkv'];

                if ($tipoMidia === 'imagem' && !in_array($extensao, $imagensPermitidas)) {
                    $validator->errors()->add('midia', 'O tipo de mídia é imagem, mas o arquivo enviado não corresponde a este tipo.');
                }

                if ($tipoMidia === 'video' && !in_array($extensao, $videosPermitidos)) {
                    $validator->errors()->add('midia', 'O tipo de mídia é vídeo, mas o arquivo enviado não corresponde a este tipo.');
                }
            }
        });
    }
}
