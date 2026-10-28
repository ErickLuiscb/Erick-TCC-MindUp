<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Artigo;
use App\Models\Autoajuda;
use App\Models\Sugestao;
use App\Models\Video;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * MODO VISITANTE — prévia pública dos conteúdos.
 *
 * Rota pública (sem login). Devolve apenas os 3 conteúdos mais recentes
 * de cada tipo, num formato PRÓPRIO e enxuto: de propósito NÃO reutiliza
 * os Resources autenticados, porque eles expõem o e-mail do autor.
 * Nenhum dado de psicólogo (nem o nome) é enviado ao visitante.
 * Todas essas regras para que as informações do autor fiquem privadas,
 * e para que o visitante tenha uma experiência basica, sem precisar de login.

 */
class VisitanteApiController extends Controller
{
    // Quantos itens de cada tipo o visitante enxerga
    private const LIMITE = 3;

    // Cache curto: aliviar o servidor gratuito sem deixar o conteúdo
    // novo (ou removido) "preso" por muito tempo.
    private const CACHE_SEGUNDOS = 120;

    private const CACHE_CHAVE = 'visitante:conteudos';

    /**
     * GET /visitante/conteudos
     */
    public function index()
    {
        $dados = Cache::remember(
            self::CACHE_CHAVE,
            self::CACHE_SEGUNDOS,
            fn () => [
                'videos'     => $this->videos(),
                'artigos'    => $this->artigos(),
                'sugestoes'  => $this->sugestoes(),
                'autoajudas' => $this->autoajudas(),
            ]
        );

        return response()->json(['data' => $dados]);
    }

    // =========================================
    // UM MÉTODO POR TIPO DE CONTEÚDO
    // =========================================

    private function videos(): array
    {
        return $this->ultimos(Video::class)
            ->map(fn ($v) => $this->base($v) + [
                'arquivo' => $this->url($v->arquivo),
            ])
            ->all();
    }

    private function artigos(): array
    {
        return $this->ultimos(Artigo::class)
            ->map(fn ($a) => $this->base($a) + [
                'arquivo_pdf' => $this->url($a->arquivo_pdf),
            ])
            ->all();
    }

    private function sugestoes(): array
    {
        return $this->ultimos(Sugestao::class)
            ->map(fn ($s) => $this->base($s) + [
                'tipo'         => $s->tipo,
                'link_externo' => $s->link_externo,
                'capa'         => $this->url($s->capa),
            ])
            ->all();
    }

    private function autoajudas(): array
    {
        return $this->ultimos(Autoajuda::class)
            ->map(fn ($a) => $this->base($a) + [
                'tipo_midia' => $a->tipo_midia,
                'midia'      => $this->url($a->midia),
            ])
            ->all();
    }

    // =========================================
    // AUXILIARES
    // =========================================

    /**
     * Os N mais recentes do model informado.
     * O autor NÃO é carregado: nenhum dado de psicólogo é público.
     */
    private function ultimos(string $model)
    {
        return $model::with('categorias')
            ->latest()
            ->latest('id') // desempate estável
            ->limit(self::LIMITE)
            ->get();
    }

    /**
     * Campos comuns aos 4 tipos. Sem dados do autor, sem favoritos.
     */
    private function base($item): array
    {
        return [
            'id'         => $item->id,
            'titulo'     => $item->titulo,
            'descricao'  => $item->descricao,
            'created_at' => $item->created_at,

            'categorias' => $item->categorias
                ->map(fn ($c) => ['id' => $c->id, 'nome' => $c->nome])
                ->values()
                ->all(),
        ];
    }

    private function url(?string $caminho): ?string
    {
        return $caminho
            ? Storage::disk(config('filesystems.default'))->url($caminho)
            : null;
    }
}
