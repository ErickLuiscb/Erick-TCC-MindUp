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
        $usuarioId = $request->user()->id;

        // Em vez de trazer TODOS os favoritos de TODOS os usuários de cada
        // conteúdo (with('favoritos')), pedimos ao banco só dois números:
        //   - favoritos_count:         quantos favoritos o conteúdo tem
        //   - favoritado_pelo_usuario: se o usuário logado favoritou
        // Os Resources (ResumoDeFavoritos) usam esses valores prontos.
        $comResumoDeFavoritos = fn ($query) => $query
            ->with(['autor', 'categorias'])
            ->withCount('favoritos')
            ->withExists([
                'favoritos as favoritado_pelo_usuario' => fn ($q) => $q->where('usuario_id', $usuarioId),
            ]);

        $categorias = Categoria::orderBy('nome')->get();

        $videos = $comResumoDeFavoritos(Video::query())->latest()->get();

        $artigos = $comResumoDeFavoritos(Artigo::query())->latest()->get();

        $sugestoes = $comResumoDeFavoritos(Sugestao::query())->latest()->get();

        $autoajudas = $comResumoDeFavoritos(Autoajuda::query())->latest()->get();

        $favoritos = Favorito::where('usuario_id', $usuarioId)
            ->with([
                'favoritavel' => function ($morphTo) {
                    $morphTo
                        ->morphWith([
                            Video::class     => ['autor', 'categorias'],
                            Artigo::class    => ['autor', 'categorias'],
                            Sugestao::class  => ['autor', 'categorias'],
                            Autoajuda::class => ['autor', 'categorias'],
                        ])
                        ->morphWithCount([
                            Video::class     => ['favoritos'],
                            Artigo::class    => ['favoritos'],
                            Sugestao::class  => ['favoritos'],
                            Autoajuda::class => ['favoritos'],
                        ]);
                },
            ])
            ->latest('data_criacao')
            ->get()
            //Arrumando bug invisel futuro:
            // Ignora favoritos "órfãos" (conteúdo já apagado), que podem existir
            // de antes da correção; sem isto a listagem inteira quebrava.
            ->filter(fn ($favorito) => $favorito->favoritavel !== null)
            ->values()
            // Todo item desta lista foi favoritado por este usuário, por definição.
            ->each(fn ($favorito) => $favorito->favoritavel->setAttribute('favoritado_pelo_usuario', true));

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
