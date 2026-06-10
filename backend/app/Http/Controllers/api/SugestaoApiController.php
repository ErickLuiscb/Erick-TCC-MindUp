<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSugestaoRequest;
use App\Http\Requests\UpdateSugestaoRequest;
use App\Http\Resources\SugestaoResource;
use App\Models\Sugestao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SugestaoApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Sugestao::with([
            'autor',
            'categorias',
            'favoritos'
        ]);

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->filled('categoria')) {

            $query->whereHas('categorias', function ($q) use ($request) {

                $q->where('categorias.id', $request->categoria);
            });
        }

        if ($request->filled('busca')) {

            $query->where(
                'titulo',
                'ILIKE',
                '%' . $request->busca . '%'
            );
        }

        $sugestoes = $query
            ->latest()
            ->get();

        return response()->json([
            'data' => SugestaoResource::collection($sugestoes)
        ]);
    }

    public function show(Sugestao $sugestao)
    {
        return response()->json([
            'data' => new SugestaoResource(
                $sugestao->load([
                    'autor',
                    'categorias',
                    'favoritos'
                ])
            )
        ]);
    }

    public function minhasSugestoes(Request $request)
    {
        $sugestoes = Sugestao::where(
                'autor_id',
                $request->user()->id
            )
            ->with([
                'autor',
                'categorias',
                'favoritos'
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => SugestaoResource::collection($sugestoes)
        ]);
    }

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

        if ($request->hasFile('capa')) {

            $nome = uniqid('sugestao_', true) . '.' .
                $request->file('capa')
                    ->getClientOriginalExtension();

            $request->file('capa')
                ->storeAs('sugestoes', $nome, 'public');

            $data['capa'] = 'sugestoes/' . $nome;
        }

        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        $sugestao = Sugestao::create($data);

        if (!empty($categorias)) {
            $sugestao->categorias()->sync($categorias);
        }

        return response()->json([
            'message' => 'Sugestão criada com sucesso.',
            'data' => new SugestaoResource(
                $sugestao->load([
                    'autor',
                    'categorias',
                    'favoritos'
                ])
            )
        ], 201);
    }

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

        if ($request->hasFile('capa')) {

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

        $categorias = $data['categorias'] ?? null;
        unset($data['categorias']);

        $sugestao->update($data);

        if ($categorias !== null) {
        $sugestao->categorias()->sync($categorias);

        }

        return response()->json([
            'message' => 'Sugestão atualizada com sucesso.',
            'data' => new SugestaoResource(
                $sugestao->fresh()->load([
                    'autor',
                    'categorias',
                    'favoritos'
                ])
            )
        ]);
    }

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
