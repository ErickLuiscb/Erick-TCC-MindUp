<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArtigoRequest;
use App\Http\Requests\UpdateArtigoRequest;
use App\Http\Resources\ArtigoResource;
use App\Models\Artigo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArtigoApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Artigo::with([
            'autor',
            'categorias'
        ]);

        if ($request->filled('categoria')) {

            $query->whereHas('categorias', function ($q) use ($request) {

                $q->where('categorias.id', $request->categoria);
            });
        }

        $artigos = $query
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => ArtigoResource::collection($artigos)
        ]);
    }

    public function show(Artigo $artigo)
    {
        return response()->json([
            'data' => new ArtigoResource(
                $artigo->load([
                    'autor',
                    'categorias'
                ])
            )
        ]);
    }

    public function meusArtigos(Request $request)
    {
        $artigos = Artigo::where(
                'autor_id',
                $request->user()->id
            )
            ->with([
                'autor',
                'categorias'
            ])
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => ArtigoResource::collection($artigos)
        ]);
    }

    public function store(StoreArtigoRequest $request)
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

        if ($request->hasFile('arquivo_pdf')) {

            $nome = uniqid('artigo_', true) . '.' .
                $request->file('arquivo_pdf')
                    ->getClientOriginalExtension();

            $request->file('arquivo_pdf')
                ->storeAs('artigos', $nome, 'public');

            $data['arquivo_pdf'] = 'artigos/' . $nome;
        }

        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        $artigo = Artigo::create($data);

        if (!empty($categorias)) {
            $artigo->categorias()->sync($categorias);
        }

        return response()->json([
            'message' => 'Artigo criado com sucesso.',
            'data' => new ArtigoResource(
                $artigo->load([
                    'autor',
                    'categorias'
                ])
            )
        ], 201);
    }

    public function update(
        UpdateArtigoRequest $request,
        Artigo $artigo
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $artigo->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('arquivo_pdf')) {

            if (
                $artigo->arquivo_pdf &&
                Storage::disk('public')->exists($artigo->arquivo_pdf)
            ) {
                Storage::disk('public')->delete($artigo->arquivo_pdf);
            }

            $nome = uniqid('artigo_', true) . '.' .
                $request->file('arquivo_pdf')
                    ->getClientOriginalExtension();

            $request->file('arquivo_pdf')
                ->storeAs('artigos', $nome, 'public');

            $data['arquivo_pdf'] = 'artigos/' . $nome;
        }

        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        $artigo->update($data);

        $artigo->categorias()->sync($categorias);

        return response()->json([
            'message' => 'Artigo atualizado com sucesso.',
            'data' => new ArtigoResource(
                $artigo->fresh()->load([
                    'autor',
                    'categorias'
                ])
            )
        ]);
    }

    public function destroy(
        Request $request,
        Artigo $artigo
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $artigo->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        if (
            $artigo->arquivo_pdf &&
            Storage::disk('public')->exists($artigo->arquivo_pdf)
        ) {
            Storage::disk('public')->delete($artigo->arquivo_pdf);
        }

        $artigo->delete();

        return response()->json([
            'message' => 'Artigo removido com sucesso.'
        ]);
    }
}
