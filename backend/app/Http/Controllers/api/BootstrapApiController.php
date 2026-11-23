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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * VERSÃO COM MEDIÇÃO TEMPORÁRIA (diagnóstico).
 *
 * O comportamento e o JSON devolvido são os mesmos da versão original.
 * A única diferença: grava no log do Render (stderr) quanto tempo cada
 * etapa levou. Depois de achar o gargalo, é só voltar ao arquivo original.
 */
class BootstrapApiController extends Controller
{
    public function index(Request $request)
    {
        $inicio = microtime(true);

        // Tempo desde que o PHP recebeu a requisição até chegar aqui
        // (boot do Laravel + CORS + autenticação Sanctum).
        $ateAquiMs = defined('LARAVEL_START')
            ? round(($inicio - LARAVEL_START) * 1000)
            : null;

        // Linha de "início": se ela aparece e a de "fim" não, a requisição
        // travou no meio do caminho.
        $this->log('inicio', [
            'usuario_id' => $request->user()->id,
            'ate_controller_ms' => $ateAquiMs,
        ]);

        // Conta quantas queries rodaram e quanto tempo o banco levou.
        $qtdQueries = 0;
        $msBanco = 0.0;
        DB::listen(function ($query) use (&$qtdQueries, &$msBanco) {
            $qtdQueries++;
            $msBanco += $query->time;
        });

        $etapas = [];

        // ---------- CONSULTAS ----------
        $categorias = $this->medir('q_categorias', $etapas, fn () =>
            Categoria::orderBy('nome')->get()
        );

        $videos = $this->medir('q_videos', $etapas, fn () =>
            Video::with(['autor', 'categorias', 'favoritos'])->latest()->get()
        );

        $artigos = $this->medir('q_artigos', $etapas, fn () =>
            Artigo::with(['autor', 'categorias', 'favoritos'])->latest()->get()
        );

        $sugestoes = $this->medir('q_sugestoes', $etapas, fn () =>
            Sugestao::with(['autor', 'categorias', 'favoritos'])->latest()->get()
        );

        $autoajudas = $this->medir('q_autoajudas', $etapas, fn () =>
            Autoajuda::with(['autor', 'categorias', 'favoritos'])->latest()->get()
        );

        $favoritos = $this->medir('q_favoritos', $etapas, fn () =>
            Favorito::where('usuario_id', $request->user()->id)
                ->with([
                    'favoritavel' => function ($morphTo) {
                        $morphTo->morphWith([
                            Video::class     => ['autor', 'categorias', 'favoritos'],
                            Artigo::class    => ['autor', 'categorias', 'favoritos'],
                            Sugestao::class  => ['autor', 'categorias', 'favoritos'],
                            Autoajuda::class => ['autor', 'categorias', 'favoritos'],
                        ]);
                    },
                ])
                ->latest('data_criacao')
                ->get()
                // Ignora favoritos "órfãos" (conteúdo já apagado).
                ->filter(fn ($favorito) => $favorito->favoritavel !== null)
                ->values()
        );

        // ---------- MONTAGEM DO JSON (Resources) ----------
        $payload = $this->medir('resources', $etapas, fn () => [
            'categorias' => CategoriaResource::collection($categorias)->resolve($request),
            'videos' => VideoResource::collection($videos)->resolve($request),
            'artigos' => ArtigoResource::collection($artigos)->resolve($request),
            'sugestoes' => SugestaoResource::collection($sugestoes)->resolve($request),
            'autoajudas' => AutoajudaResource::collection($autoajudas)->resolve($request),
            'favoritos' => FavoritoResource::collection($favoritos)->resolve($request),
        ]);

        $resposta = $this->medir('json', $etapas, fn () => response()->json($payload));

        $this->log('fim', [
            'total_ms' => round((microtime(true) - $inicio) * 1000),
            'etapas_ms' => $etapas,
            'queries' => $qtdQueries,
            'banco_ms' => round($msBanco),
            'itens' => [
                'categorias' => count($categorias),
                'videos' => count($videos),
                'artigos' => count($artigos),
                'sugestoes' => count($sugestoes),
                'autoajudas' => count($autoajudas),
                'favoritos' => count($favoritos),
            ],
            'kb' => round(strlen($resposta->getContent()) / 1024),
            'pico_memoria_mb' => round(memory_get_peak_usage(true) / 1048576, 1),
        ]);

        return $resposta;
    }

    /** Executa um trecho e anota quantos ms ele levou. */
    private function medir(string $nome, array &$etapas, callable $fn)
    {
        $t = microtime(true);
        $resultado = $fn();
        $etapas[$nome] = round((microtime(true) - $t) * 1000);

        return $resultado;
    }

    /** Escreve no stderr, que é o que o Render mostra na aba Logs. */
    private function log(string $evento, array $dados): void
    {
        Log::channel('stderr')->info('[bootstrap] ' . $evento . ' ' . json_encode($dados));
    }
}
