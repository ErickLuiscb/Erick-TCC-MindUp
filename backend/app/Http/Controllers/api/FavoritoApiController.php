<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFavoritoRequest;
use App\Http\Resources\FavoritoResource;
use App\Models\Artigo;
use App\Models\Autoajuda;
use App\Models\Favorito;
use App\Models\Sugestao;
use App\Models\Video;
use Illuminate\Http\Request;

class FavoritoApiController extends Controller
{
    /**
     * LISTAR FAVORITOS DO USUÁRIO
     */
    public function index(Request $request)
    {
        $favoritos = Favorito::where(
                'usuario_id',
                $request->user()->id
            )
            ->with('favoritavel')
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => FavoritoResource::collection($favoritos)
        ]);
    }

    /**
     * FAVORITAR / DESFAVORITAR CONTEÚDO (toggle)
     */
    public function store(
        StoreFavoritoRequest $request
    ) {

        /*
        MAPEIA TIPOS
        */

        $tipos = [

            'video' => Video::class,

            'artigo' => Artigo::class,

            'sugestao' => Sugestao::class,

            'autoajuda' => Autoajuda::class,
        ];

        /*
        PEGA MODEL
        */

        $modelClass = $tipos[$request->tipo];


        /*
        BUSCA CONTEÚDO (garante que o conteúdo existe de verdade)
        */

        $conteudo = $modelClass::findOrFail(
            $request->favoritavel_id
        );

        /*
        VERIFICA SE JÁ ESTÁ FAVORITADO
        */

        $favorito = Favorito::where('usuario_id', $request->user()->id)
            ->where('favoritavel_id', $conteudo->id)
            ->where('favoritavel_type', $modelClass)
            ->first();

        /*
        JÁ EXISTE -> REMOVE (desfavoritar)
        */

        if ($favorito) {
            $favorito->delete();

            return response()->json([
                'message' => 'Favorito removido com sucesso.',
                'favoritado' => false,
            ]);
        }

        /*
        NÃO EXISTE -> CRIA (favoritar)
        */

        $favorito = Favorito::create([

            'usuario_id' => $request->user()->id,

            'favoritavel_id' => $conteudo->id,

            'favoritavel_type' => $modelClass,

            'data_criacao' => now(),
        ]);

        return response()->json([

            'message' => 'Conteúdo favoritado com sucesso.',

            'favoritado' => true,

            'data' => new FavoritoResource(
                $favorito->load('favoritavel')
            )
        ], 201);
    }

    /**
     * REMOVER FAVORITO
     */
    public function destroy(
        Request $request,
        Favorito $favorito
    ) {

        /*
        SEGURANÇA
        */

        if (
            $favorito->usuario_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $favorito->delete();

        return response()->json([
            'message' => 'Favorito removido com sucesso.'
        ]);
    }
}
