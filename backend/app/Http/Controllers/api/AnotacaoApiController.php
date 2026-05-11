<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anotacao;
use App\Http\Requests\StoreAnotacaoRequest;
use App\Http\Requests\UpdateAnotacaoRequest;
use App\Http\Resources\AnotacaoResource;
use Illuminate\Http\Request;

class AnotacaoApiController extends Controller
{
    /**
     * LISTAR — sempre apenas do usuário autenticado
     */
    public function index(Request $request)
    {
        return AnotacaoResource::collection(
            Anotacao::where('usuario_id', $request->user()->id)
                ->with('usuario')
                ->latest('data_criacao')
                ->get()
        );
    }

    /**
     * VISUALIZAR — apenas se for dono
     */
    public function show(Request $request, Anotacao $anotacao)
    {
        if ($anotacao->usuario_id !== $request->user()->id) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        return new AnotacaoResource($anotacao->load('usuario'));
    }

    /**
     * CRIAR — sempre para o usuário autenticado
     */
    public function store(StoreAnotacaoRequest $request)
    {
        $anotacao = Anotacao::create([
            'titulo'     => $request->titulo,
            'texto'      => $request->texto,
            'usuario_id' => $request->user()->id,
        ]);

        return new AnotacaoResource($anotacao);
    }

    /**
     * ATUALIZAR — apenas se for dono
     */
    public function update(UpdateAnotacaoRequest $request, Anotacao $anotacao)
    {
        if ($anotacao->usuario_id !== $request->user()->id) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $anotacao->update($request->validated());

        return new AnotacaoResource($anotacao);
    }

    /**
     * DELETAR — apenas se for dono
     */
    public function destroy(Request $request, Anotacao $anotacao)
    {
        if ($anotacao->usuario_id !== $request->user()->id) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $anotacao->delete();

        return response()->json([
            'message' => 'Anotação removida com sucesso.'
        ], 200);
    }
}
