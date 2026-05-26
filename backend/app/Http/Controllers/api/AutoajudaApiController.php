<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAutoajudaRequest;
use App\Http\Requests\UpdateAutoajudaRequest;
use App\Http\Resources\AutoajudaResource;
use App\Models\Autoajuda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AutoajudaApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Autoajuda::with(['autor', 'categorias'])
            ->latest('data_criacao');

        // filtro por categoria
        if ($request->filled('categoria_id')) {
            $query->whereHas('categorias', function ($q) use ($request) {
                $q->where('categorias.id', $request->categoria_id);
            });
        }

        // filtro por tipo de mídia
        if ($request->filled('tipo_midia')) {
            $query->where('tipo_midia', $request->tipo_midia);
        }

        return AutoajudaResource::collection(
            $query->get()
        );
    }

    public function show(Autoajuda $autoajuda)
    {
        return new AutoajudaResource(
            $autoajuda->load(['autor', 'categorias'])
        );
    }

    public function meusConteudos(Request $request)
    {
        return AutoajudaResource::collection(
            Autoajuda::where('autor_id', $request->user()->id)
                ->with(['categorias'])
                ->latest('data_criacao')
                ->get()
        );
    }

    public function store(StoreAutoajudaRequest $request)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            !$request->user()->tokenCan('publicador')
        ) {
            return response()->json([
                'error' => 'Acesso negado'
            ], 403);
        }

        $data = $request->validated();

        $data['autor_id'] = $request->user()->id;

        // upload da mídia
        if ($request->hasFile('midia')) {

            $arquivo = $request->file('midia');

            $nome = uniqid('autoajuda_', true) . '.' .
                $arquivo->getClientOriginalExtension();

            $arquivo->storeAs(
                'autoajuda',
                $nome,
                'public'
            );

            $data['midia'] = 'autoajuda/' . $nome;
        }

        $autoajuda = Autoajuda::create($data);

        // categorias
        if ($request->filled('categorias')) {
            $autoajuda->categorias()->sync(
                $request->categorias
            );
        }

        return new AutoajudaResource(
            $autoajuda->load(['autor', 'categorias'])
        );
    }

    public function update(
        UpdateAutoajudaRequest $request,
        Autoajuda $autoajuda
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $autoajuda->autor_id
        ) {
            return response()->json([
                'error' => 'Acesso negado'
            ], 403);
        }

        $data = $request->validated();

        // troca mídia
        if ($request->hasFile('midia')) {

            if (
                $autoajuda->midia &&
                Storage::disk('public')->exists($autoajuda->midia)
            ) {
                Storage::disk('public')->delete($autoajuda->midia);
            }

            $arquivo = $request->file('midia');

            $nome = uniqid('autoajuda_', true) . '.' .
                $arquivo->getClientOriginalExtension();

            $arquivo->storeAs(
                'autoajuda',
                $nome,
                'public'
            );

            $data['midia'] = 'autoajuda/' . $nome;
        }

        $autoajuda->update($data);

        // atualizar categorias
        if ($request->filled('categorias')) {
            $autoajuda->categorias()->sync(
                $request->categorias
            );
        }

        return new AutoajudaResource(
            $autoajuda->fresh()->load([
                'autor',
                'categorias'
            ])
        );
    }

    public function destroy(
        Request $request,
        Autoajuda $autoajuda
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $autoajuda->autor_id
        ) {
            return response()->json([
                'error' => 'Acesso negado'
            ], 403);
        }

        // remover mídia
        if (
            $autoajuda->midia &&
            Storage::disk('public')->exists($autoajuda->midia)
        ) {
            Storage::disk('public')->delete($autoajuda->midia);
        }

        // remover categorias da pivot
        $autoajuda->categorias()->detach();

        $autoajuda->delete();

        return response()->json([
            'message' => 'Conteúdo de autoajuda removido com sucesso.'
        ]);
    }
}
