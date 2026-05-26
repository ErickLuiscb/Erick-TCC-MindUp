<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artigo;
use App\Http\Requests\StoreArtigoRequest;
use App\Http\Requests\UpdateArtigoRequest;
use App\Http\Resources\ArtigoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArtigoApiController extends Controller
{
    /**
     * LISTAR TODOS OS ARTIGOS
     * Público
     */
    public function index(Request $request)
    {
        $query = Artigo::with([
            'autor',
            'categorias'
        ]);

        // filtro por categoria
        if ($request->has('categoria')) {

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

    /**
     * VISUALIZAR UM ARTIGO
     * Público
     */
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

    /**
     * LISTAR ARTIGOS DO AUTOR LOGADO
     * Dashboard
     */
    public function meusArtigos(Request $request)
    {
        $artigos = Artigo::where(
                'autor_id',
                $request->user()->id
            )
            ->with('categorias')
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => ArtigoResource::collection($artigos)
        ]);
    }

    /**
     * CRIAR ARTIGO
     * Psicólogo/Admin
     */
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

        /*
         UPLOAD PDF
        */

        if ($request->hasFile('arquivo_pdf')) {

            $nome = uniqid('artigo_', true) . '.' .
                $request->file('arquivo_pdf')
                    ->getClientOriginalExtension();

            $request->file('arquivo_pdf')
                ->storeAs('artigos', $nome, 'public');

            $data['arquivo_pdf'] = 'artigos/' . $nome;
        }

        /*
        CATEGORIAS
        */

        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        /*
        | CRIA ARTIGO
        */

        $artigo = Artigo::create($data);

        /*
    SYNC CATEGORIAS
        */

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

    /**
     * ATUALIZAR ARTIGO
     * Admin ou dono
     */
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

        /*
        NOVO PDF
        */

        if ($request->hasFile('arquivo_pdf')) {

            // remove antigo
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

        /*
        CATEGORIAS
        */

        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        /*
        UPDATE
        */

        $artigo->update($data);

        /*
        SYNC CATEGORIAS
        */

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

    /**
     * REMOVER ARTIGO
     * Admin ou dono
     */
    public function destroy(Request $request, Artigo $artigo)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $artigo->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        /*
         REMOVE PDF
        */

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
