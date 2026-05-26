<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sugestao;
use App\Http\Requests\StoreSugestaoRequest;
use App\Http\Requests\UpdateSugestaoRequest;
use App\Http\Resources\SugestaoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SugestaoApiController extends Controller
{
    /**
     * Listar sugestões
     */
    public function index(Request $request)
    {
        $query = Sugestao::with([
            'autor',
            'categorias'
        ]);

        // filtro por tipo
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        // filtro por categoria
        if ($request->has('categoria')) {

            $query->whereHas('categorias', function ($q) use ($request) {

                $q->where(
                    'categorias.id',
                    $request->categoria
                );
            });
        }

        // busca por título
        if ($request->has('busca')) {

            $query->where(
                'titulo',
                'ILIKE',
                '%' . $request->busca . '%'
            );
        }

        $sugestoes = $query
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => SugestaoResource::collection($sugestoes)
        ]);
    }

    /**
     * Visualizar sugestão
     */
    public function show(Sugestao $sugestao)
    {
        return response()->json([
            'data' => new SugestaoResource(
                $sugestao->load([
                    'autor',
                    'categorias'
                ])
            )
        ]);
    }

    /**
     * Sugestões do autor logado
     */
    public function minhasSugestoes(Request $request)
    {
        $sugestoes = Sugestao::where(
                'autor_id',
                $request->user()->id
            )
            ->with('categorias')
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => SugestaoResource::collection($sugestoes)
        ]);
    }

    /**
     * Criar sugestão
     */
    public function store(StoreSugestaoRequest $request)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            !$request->user()->tokenCan('publicador')
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validated();

        $data['autor_id'] = $request->user()->id;

        // upload capa
        if ($request->hasFile('capa')) {

            $nome = uniqid('sugestao_', true) . '.' .
                $request->file('capa')
                    ->getClientOriginalExtension();

            $request->file('capa')
                ->storeAs('sugestoes', $nome, 'public');

            $data['capa'] = 'sugestoes/' . $nome;
        }

        // categorias
        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        // cria sugestão
        $sugestao = Sugestao::create($data);

        // salva categorias
        if (!empty($categorias)) {

            $sugestao->categorias()
                ->sync($categorias);
        }

        return response()->json([
            'message' => 'Sugestão criada com sucesso.',
            'data' => new SugestaoResource(
                $sugestao->load([
                    'autor',
                    'categorias'
                ])
            )
        ], 201);
    }

    /**
     * Atualizar sugestão
     */
    public function update(
        UpdateSugestaoRequest $request,
        Sugestao $sugestao
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $sugestao->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validated();

        // nova capa
        if ($request->hasFile('capa')) {

            // remove antiga
            if (
                $sugestao->capa &&
                Storage::disk('public')->exists($sugestao->capa)
            ) {
                Storage::disk('public')->delete($sugestao->capa);
            }

            $nome = uniqid('sugestao_', true) . '.' .
                $request->file('capa')
                    ->getClientOriginalExtension();

            $request->file('capa')
                ->storeAs('sugestoes', $nome, 'public');

            $data['capa'] = 'sugestoes/' . $nome;
        }

        // categorias
        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        // update
        $sugestao->update($data);

        // atualiza categorias
        $sugestao->categorias()
            ->sync($categorias);

        return response()->json([
            'message' => 'Sugestão atualizada com sucesso.',
            'data' => new SugestaoResource(
                $sugestao->fresh()->load([
                    'autor',
                    'categorias'
                ])
            )
        ]);
    }

    /**
     * Remover sugestão
     */
    public function destroy(
        Request $request,
        Sugestao $sugestao
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $sugestao->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        // remove capa
        if (
            $sugestao->capa &&
            Storage::disk('public')->exists($sugestao->capa)
        ) {
            Storage::disk('public')->delete($sugestao->capa);
        }

        $sugestao->delete();

        return response()->json([
            'message' => 'Sugestão removida com sucesso.'
        ]);
    }
}
