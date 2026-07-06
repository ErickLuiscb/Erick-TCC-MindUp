<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Anotacao;
use App\Http\Requests\StoreAnotacaoRequest;
use App\Http\Requests\UpdateAnotacaoRequest;
use App\Http\Resources\AnotacaoResource;
use Illuminate\Http\Request;

class AnotacaoApiController extends Controller
{
    /**
     * LISTAR ANOTAÇÕES DO USUÁRIO
     */
    public function index(Request $request)
    {
        $anotacoes = Anotacao::where(
                'usuario_id',
                $request->user()->id
            )
            ->with('usuario')
            ->latest()
            ->get();

        return response()->json([
            'data' => AnotacaoResource::collection($anotacoes)
        ]);
    }

    /**
     * VISUALIZAR ANOTAÇÃO
     */
    public function show(Request $request, Anotacao $anotacao)
    {
        if ($anotacao->usuario_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        return response()->json([
            'data' => new AnotacaoResource(
                $anotacao->load('usuario')
            )
        ]);
    }

    /**
     * CRIAR ANOTAÇÃO
     */
    public function store(StoreAnotacaoRequest $request)
    {
        $anotacao = Anotacao::create([
            'titulo' => $request->titulo,
            'texto' => $request->texto,
            'usuario_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Anotação criada com sucesso.',
            'data' => new AnotacaoResource(
                $anotacao->load('usuario')
            )
        ], 201);
    }

    /**
     * ATUALIZAR ANOTAÇÃO
     */
    public function update(
        UpdateAnotacaoRequest $request,
        Anotacao $anotacao
    ) {
        if ($anotacao->usuario_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $anotacao->update($request->validated());

        return response()->json([
            'message' => 'Anotação atualizada com sucesso.',
            'data' => new AnotacaoResource(
                $anotacao->fresh()->load('usuario')
            )
        ]);
    }

    /**
     * REMOVER ANOTAÇÃO
     */
    public function destroy(Request $request, Anotacao $anotacao)
    {
        if ($anotacao->usuario_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $anotacao->delete();

        return response()->json([
            'message' => 'Anotação removida com sucesso.'
        ], 200);
    }
}
