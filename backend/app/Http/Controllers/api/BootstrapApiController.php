<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArtigoResource;
use App\Http\Resources\AutoajudaResource;
use App\Http\Resources\CategoriaResource;
use App\Http\Resources\FavoritoResource;
use App\Http\Resources\SugestaoResource;
use App\Http\Resources\VideoResource;
use App\Models\Artigo;
use App\Models\Autoajuda;
use App\Models\Categoria;
use App\Models\Favorito;
use App\Models\Sugestao;
use App\Models\Video;
use Illuminate\Http\Request;

class BootstrapApiController extends Controller
{
    /**
     * Reúne, numa única resposta, todos os dados que o app precisa
     * logo após o login (categorias, conteúdos e favoritos do usuário).
     *
     * Objetivo: evitar que o front dispare várias requisições
     * simultâneas ao mesmo tempo (uma por módulo), o que sobrecarrega
     * o servidor e causa falhas intermitentes em algumas delas.
     */
    public function index(Request $request)
    {
        $categorias = Categoria::orderBy('nome')->get();

        $videos = Video::with(['autor', 'categorias', 'favoritos'])
            ->latest()
            ->get();

        $artigos = Artigo::with(['autor', 'categorias', 'favoritos'])
            ->latest()
            ->get();

        $sugestoes = Sugestao::with(['autor', 'categorias', 'favoritos'])
            ->latest()
            ->get();

        $autoajudas = Autoajuda::with(['autor', 'categorias', 'favoritos'])
            ->latest()
            ->get();

        $favoritos = Favorito::where('usuario_id', $request->user()->id)
            ->with('favoritavel')
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'categorias' => CategoriaResource::collection($categorias),
            'videos' => VideoResource::collection($videos),
            'artigos' => ArtigoResource::collection($artigos),
            'sugestoes' => SugestaoResource::collection($sugestoes),
            'autoajudas' => AutoajudaResource::collection($autoajudas),
            'favoritos' => FavoritoResource::collection($favoritos),
        ]);
    }
}
