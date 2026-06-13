<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreAutoajudaRequest extends FormRequest
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
            'tipo_midia' => 'required|in:imagem,video',
            'midia' => 'required|file|max:51200',
            'ativo' => 'sometimes|required|boolean',
            'categorias' => 'nullable|array|max:5',
            'categorias.*' => 'exists:categorias,id',
        ];
    }

    /**
     * Validação cruzada customizada após as regras iniciais
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Se já houver erros de validação gerais, nem prossegue
            if ($validator->errors()->any()) {
                return;
            }

            $tipoMidia = $this->input('tipo_midia');
            $file = $this->file('midia');

            if ($file) {
                $extensao = strtolower($file->getClientOriginalExtension());
                $imagensPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
                $videosPermitidos = ['mp4', 'mov', 'avi', 'wmv', 'webm', 'mkv'];

                // Bloqueio 1: Selecionou imagem, mas enviou vídeo
                if ($tipoMidia === 'imagem' && !in_array($extensao, $imagensPermitidas)) {
                    $validator->errors()->add('midia', 'O tipo de mídia está selecionado como imagem, mas o arquivo enviado não é uma imagem válida (jpg, jpeg, png, webp).');
                }

                // Bloqueio 2: Selecionou vídeo, mas enviou imagem
                if ($tipoMidia === 'video' && !in_array($extensao, $videosPermitidos)) {
                    $validator->errors()->add('midia', 'O tipo de mídia está selecionado como vídeo, mas o arquivo enviado não é um vídeo válido (mp4, mov, avi, wmv, webm, mkv).');
                }
            }
        });
    }
}
