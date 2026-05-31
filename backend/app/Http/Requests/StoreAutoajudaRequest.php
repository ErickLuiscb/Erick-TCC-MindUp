<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            //Importante: Aqui o Front-end sabe como renderizar, como o layout deve ser aberto e etc...

            'midia' => [
                'required',
                'file',
                'max:51200',
                'mimes:jpg,jpeg,png,webp,mp4,mov,avi,wmv,webm,mkv'
                //Aqui criei para ser flexivel, já que em Autoajuda poder tanto imagem como Video,
                //Onde ele aceita qualquer formato de imagem ou video.
            ],

            'categorias' => 'nullable|array|max:5',

            'categorias.*' => 'exists:categorias,id',
        ];
    }
}
